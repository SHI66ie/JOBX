"""Password hashing (stdlib PBKDF2, no extra deps) and server-side session cookies.

Sessions are opaque random tokens stored in the `sessions` table (not signed
client-side blobs), so revoking a session server-side is just deleting a row.
"""
import hashlib
import hmac
import os
import secrets
import datetime

from fastapi import Depends, HTTPException, Request, Response
from sqlalchemy.orm import Session as DBSession

from database import get_db
import models

SESSION_COOKIE_NAME = "jomp_session"
SESSION_TTL_DAYS = 7
PBKDF2_ITERATIONS = 260_000


def hash_password(password: str) -> str:
    salt = os.urandom(16)
    dk = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, PBKDF2_ITERATIONS)
    return f"pbkdf2_sha256${PBKDF2_ITERATIONS}${salt.hex()}${dk.hex()}"


def verify_password(password: str, stored: str) -> bool:
    try:
        algo, iterations_str, salt_hex, hash_hex = stored.split("$")
        iterations = int(iterations_str)
        salt = bytes.fromhex(salt_hex)
        expected = bytes.fromhex(hash_hex)
    except (ValueError, AttributeError):
        return False
    dk = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, iterations)
    return hmac.compare_digest(dk, expected)


def create_session(db: DBSession, user_id: int, response: Response) -> str:
    token = secrets.token_urlsafe(32)
    expires_at = datetime.datetime.utcnow() + datetime.timedelta(days=SESSION_TTL_DAYS)
    db.add(models.Session(token=token, user_id=user_id, expires_at=expires_at))
    db.commit()
    response.set_cookie(
        key=SESSION_COOKIE_NAME,
        value=token,
        httponly=True,
        samesite="lax",
        max_age=SESSION_TTL_DAYS * 24 * 3600,
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
        raise HTTPException(status_code=401, detail="Not logged in")

    db_session = db.query(models.Session).filter(models.Session.token == token).first()
    if not db_session or db_session.expires_at < datetime.datetime.utcnow():
        raise HTTPException(status_code=401, detail="Session expired")

    user = db.query(models.User).filter(models.User.id == db_session.user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


def require_role(role: str):
    """Dependency factory: only lets through users with the given role."""

    def dependency(user: models.User = Depends(get_current_user)) -> models.User:
        if user.role != role:
            raise HTTPException(status_code=403, detail=f"This action requires a {role} account")
        return user

    return dependency
