"""
Pydantic schemas for User entity representations, creation, updates, and password changes.
"""

from typing import Optional
from pydantic import BaseModel, ConfigDict, EmailStr, Field
from app.utils.enums import UserRole


class UserResponse(BaseModel):
    """User response object DTO."""

    id: str
    full_name: str
    email: EmailStr
    role: UserRole
    is_active: bool
    created_at: str
    updated_at: str

    model_config = ConfigDict(from_attributes=True)


class UserCreate(BaseModel):
    """Admin user creation schema."""

    full_name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6)
    role: UserRole = UserRole.USER
    is_active: bool = True


class UserUpdate(BaseModel):
    """User profile update schema."""

    full_name: Optional[str] = Field(None, min_length=2, max_length=100)
    email: Optional[EmailStr] = None
    is_active: Optional[bool] = None
    role: Optional[UserRole] = None


class ChangePasswordRequest(BaseModel):
    """Change password request payload."""

    old_password: str = Field(..., min_length=6)
    new_password: str = Field(..., min_length=6)
