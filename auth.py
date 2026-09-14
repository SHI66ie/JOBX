import hashlib
import hmac
import os
import secrets
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, Response, Request
from sqlalchemy.orm import Session as DBSession

from database import get_db
import models
import schemas

SESSION_COOKIE_NAME = "jomp_session"
SESSION_DAYS = 14
PBKDF2_ROUNDS = 120_000

router = APIRouter(prefix="/api/auth", tags=["auth"])


def hash_password(password: str) -> str:
    salt = os.urandom(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, PBKDF2_ROUNDS)
    return f"{salt.hex()}${digest.hex()}"


def verify_password(password: str, stored: str) -> bool:
    try:
        salt_hex, digest_hex = stored.split("$", 1)
        salt = bytes.fromhex(salt_hex)
    except ValueError:
        return False
    digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, PBKDF2_ROUNDS)
    return hmac.compare_digest(digest.hex(), digest_hex)


def create_session(db: DBSession, user_id: int, response: Response) -> str:
    token = secrets.token_urlsafe(32)
    expires_at = datetime.utcnow() + timedelta(days=SESSION_DAYS)
    db.add(models.Session(token=token, user_id=user_id, expires_at=expires_at))
    db.commit()
    response.set_cookie(
        key=SESSION_COOKIE_NAME,
        value=token,
        httponly=True,
        samesite="lax",
        max_age=SESSION_DAYS * 86400,
        path="/",
    )
    return token


def destroy_session(db: DBSession, token: str | None, response: Response) -> None:
    if token:
        db.query(models.Session).filter(models.Session.token == token).delete()
        db.commit()
    response.delete_cookie(SESSION_COOKIE_NAME, path="/")


def get_current_user(request: Request, db: DBSession = Depends(get_db)) -> models.User:
    token = request.cookies.get(SESSION_COOKIE_NAME)
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")

    session = db.query(models.Session).filter(models.Session.token == token).first()
    if not session or session.expires_at < datetime.utcnow():
        if session:
            db.delete(session)
            db.commit()
        raise HTTPException(status_code=401, detail="Session expired")

    user = db.query(models.User).filter(models.User.id == session.user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return user


def require_role(role: str):
    def _require(user: models.User = Depends(get_current_user)) -> models.User:
        if user.role != role:
            raise HTTPException(status_code=403, detail="Forbidden")
        return user

    return _require


@router.post("/register", response_model=schemas.UserOut)
def register(payload: schemas.RegisterIn, response: Response, db: DBSession = Depends(get_db)):
    existing = db.query(models.User).filter(models.User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=409, detail="An account with this email already exists")

    user = models.User(
        role=payload.role,
        name=payload.name,
        email=payload.email,
        country=payload.country,
        password_hash=hash_password(payload.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    create_session(db, user.id, response)
    return user


@router.post("/login", response_model=schemas.UserOut)
def login(payload: schemas.LoginIn, response: Response, db: DBSession = Depends(get_db)):
    user = (
        db.query(models.User)
        .filter(models.User.email == payload.email, models.User.role == payload.role)
        .first()
    )
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    create_session(db, user.id, response)
    return user


@router.post("/logout")
def logout(request: Request, response: Response, db: DBSession = Depends(get_db)):
    token = request.cookies.get(SESSION_COOKIE_NAME)
    destroy_session(db, token, response)
    return {"ok": True}


@router.get("/me", response_model=schemas.UserOut)
def me(user: models.User = Depends(get_current_user)):
    return user
