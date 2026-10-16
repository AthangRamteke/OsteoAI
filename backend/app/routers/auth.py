"""
routers/auth.py
=======================================================================
Account endpoints:

    POST /auth/register   create an account, returns a session token
    POST /auth/login      exchange email + password for a session token
    GET  /auth/me         current user from a Bearer token

Passwords are hashed with Argon2id (no input-length cap, unlike bcrypt's
72 bytes). Tokens are signed HS256 JWTs carrying only the user id.

Academic-prototype scope: there is no password reset, rate limiting,
email verification or token revocation.
=======================================================================
"""

from __future__ import annotations

import logging
from datetime import datetime, timedelta, timezone

import jwt
from argon2 import PasswordHasher
from argon2.exceptions import InvalidHashError, VerificationError
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.auth_schemas import AuthResponse, LoginRequest, RegisterRequest, UserOut
from app.config import database_url, jwt_expiry_hours, jwt_secret
from app.db import DatabaseUnavailable
from app.db import users as user_store

logger = logging.getLogger("osteoai.auth")

router = APIRouter(prefix="/auth", tags=["auth"])

_hasher = PasswordHasher()
_bearer = HTTPBearer(auto_error=False)

_ALGORITHM = "HS256"
_INVALID_LOGIN = "Invalid email or password"

# Verified against when the email is unknown, so a missing account takes
# as long to reject as a wrong password and the timing reveals nothing.
_DUMMY_HASH = _hasher.hash("osteoai-timing-equalizer")


def _require_database() -> None:
    if database_url() is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Accounts are unavailable: the database is not configured.",
        )


def _unavailable(exc: DatabaseUnavailable) -> HTTPException:
    logger.error("Auth database error: %s", exc)
    return HTTPException(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        detail="Accounts are temporarily unavailable. Please try again.",
    )


def _issue(user: dict, remember: bool) -> AuthResponse:
    expires_at = datetime.now(timezone.utc) + timedelta(
        hours=jwt_expiry_hours(remember)
    )
    token = jwt.encode(
        {"sub": str(user["id"]), "exp": expires_at},
        jwt_secret(),
        algorithm=_ALGORITHM,
    )
    return AuthResponse(token=token, expires_at=expires_at, user=UserOut(**user))


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def register(body: RegisterRequest) -> AuthResponse:
    _require_database()

    try:
        user = user_store.create_user(body.name, body.email, _hasher.hash(body.password))
    except DatabaseUnavailable as exc:
        raise _unavailable(exc) from exc

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists.",
        )

    logger.info("Registered user id=%s", user["id"])
    return _issue(user, body.remember)


@router.post("/login", response_model=AuthResponse)
def login(body: LoginRequest) -> AuthResponse:
    _require_database()

    try:
        record = user_store.get_user_with_hash(body.email)
    except DatabaseUnavailable as exc:
        raise _unavailable(exc) from exc

    try:
        _hasher.verify(record["password_hash"] if record else _DUMMY_HASH, body.password)
    except (VerificationError, InvalidHashError):
        record = None

    if record is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=_INVALID_LOGIN)

    if _hasher.check_needs_rehash(record["password_hash"]):
        try:
            user_store.update_password_hash(record["id"], _hasher.hash(body.password))
        except DatabaseUnavailable:
            pass  # login still valid; rehash next time

    user = {key: record[key] for key in ("id", "name", "email", "created_at")}
    return _issue(user, body.remember)


def current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer),
) -> UserOut:
    """Dependency: the signed-in user, or 401."""

    unauthorized = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Not signed in.",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if credentials is None or credentials.scheme.lower() != "bearer":
        raise unauthorized

    try:
        claims = jwt.decode(credentials.credentials, jwt_secret(), algorithms=[_ALGORITHM])
        user_id = int(claims["sub"])
    except (jwt.PyJWTError, KeyError, ValueError):
        raise unauthorized

    _require_database()

    try:
        user = user_store.get_user_by_id(user_id)
    except DatabaseUnavailable as exc:
        raise _unavailable(exc) from exc

    if user is None:
        raise unauthorized

    return UserOut(**user)


@router.get("/me", response_model=UserOut)
def me(user: UserOut = Depends(current_user)) -> UserOut:
    return user
