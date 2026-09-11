from fastapi import APIRouter, Depends, HTTPException, Response, Request
from sqlalchemy.orm import Session as DBSession

from database import get_db
import models
import schemas
import auth as auth_utils

router = APIRouter(prefix="/api/auth", tags=["auth"])


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
        password_hash=auth_utils.hash_password(payload.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    auth_utils.create_session(db, user.id, response)
    return user


@router.post("/login", response_model=schemas.UserOut)
def login(payload: schemas.LoginIn, response: Response, db: DBSession = Depends(get_db)):
    user = (
        db.query(models.User)
        .filter(models.User.email == payload.email, models.User.role == payload.role)
        .first()
    )
    if not user or not auth_utils.verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    auth_utils.create_session(db, user.id, response)
    return user


@router.post("/logout")
def logout(request: Request, response: Response, db: DBSession = Depends(get_db)):
    token = request.cookies.get(auth_utils.SESSION_COOKIE_NAME)
    auth_utils.destroy_session(db, token, response)
    return {"ok": True}


@router.get("/me", response_model=schemas.UserOut)
def me(user: models.User = Depends(auth_utils.get_current_user)):
    return user
