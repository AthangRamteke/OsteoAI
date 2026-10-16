"""
auth_schemas.py
=======================================================================
Request/response models for /auth.

Passwords are only required to be non-empty: there is deliberately no
minimum length or complexity rule.
=======================================================================
"""

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator


def _not_blank(value: str) -> str:
    if not value.strip():
        raise ValueError("must not be empty")
    return value


def _email(value: str) -> str:
    value = value.strip().lower()

    # Light sanity check only; deliverability is not verified.
    local, _, domain = value.partition("@")
    if not local or not domain or " " in value:
        raise ValueError("must be a valid email address")

    return value


class RegisterRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: str = Field(..., max_length=200)
    email: str = Field(..., max_length=320)
    password: str = Field(..., min_length=1)
    remember: bool = True

    _name = field_validator("name")(_not_blank)
    _email = field_validator("email")(_email)


class LoginRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    email: str = Field(..., max_length=320)
    password: str = Field(..., min_length=1)
    remember: bool = False

    _email = field_validator("email")(_email)


class UserOut(BaseModel):
    id: int
    name: str
    email: str
    created_at: datetime


class AuthResponse(BaseModel):
    token: str
    token_type: str = "bearer"
    expires_at: datetime
    user: UserOut
