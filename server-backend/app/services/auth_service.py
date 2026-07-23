"""
Authentication service handling user registration, login authentication, token refresh, and password updates.
"""

from loguru import logger
from app.core.config import settings
from app.core.exceptions import AuthenticationError, AppException
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_jwt_token,
    hash_password,
    verify_password,
)
from app.models.user import UserDocument
from app.repositories.user_repository import UserRepository
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse
from app.schemas.user import ChangePasswordRequest, UserResponse
from app.utils.constants import ERROR_INVALID_CREDENTIALS, ERROR_USER_EXISTS
from app.utils.helpers import utc_now


class AuthService:
    """Service containing authentication business logic."""

    def __init__(self, user_repo: UserRepository):
        self.user_repo = user_repo

    async def register_user(self, payload: RegisterRequest) -> UserResponse:
        """Register a new standard user account."""
        email = payload.email.strip().lower()

        existing = await self.user_repo.get_by_email(email)
        if existing:
            raise AppException(ERROR_USER_EXISTS, status_code=400)

        hashed_pwd = hash_password(payload.password)
        user_doc = UserDocument(
            full_name=payload.full_name,
            email=email,
            password=hashed_pwd,
        )

        created = await self.user_repo.create(user_doc.to_dict())
        logger.info(f"Registered new user account: '{email}'")
        return UserResponse.model_validate(created)

    async def authenticate_user(self, payload: LoginRequest) -> TokenResponse:
        """Authenticate user credentials and issue JWT Access and Refresh tokens."""
        email = payload.email.strip().lower()
        user = await self.user_repo.get_by_email(email)

        if not user or not verify_password(payload.password, user["password"]):
            logger.warning(f"Failed login attempt for email: '{email}'")
            raise AuthenticationError(ERROR_INVALID_CREDENTIALS)

        if not user.get("is_active", True):
            raise AuthenticationError("User account is deactivated.")

        access_token = create_access_token(subject=user["id"], extra_claims={"role": user["role"]})
        refresh_token = create_refresh_token(subject=user["id"])

        logger.info(f"User '{email}' logged in successfully.")
        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="Bearer",
            expires_in_minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES,
        )

    async def refresh_tokens(self, refresh_token_str: str) -> TokenResponse:
        """Issue new access & refresh token pair using valid refresh token."""
        payload = decode_jwt_token(refresh_token_str)
        if payload.get("type") != "refresh":
            raise AuthenticationError("Invalid token type. Refresh token required.")

        user_id = payload.get("sub")
        user = await self.user_repo.get_by_id(user_id)
        if not user or not user.get("is_active", True):
            raise AuthenticationError("User account is invalid or inactive.")

        new_access_token = create_access_token(subject=user["id"], extra_claims={"role": user["role"]})
        new_refresh_token = create_refresh_token(subject=user["id"])

        return TokenResponse(
            access_token=new_access_token,
            refresh_token=new_refresh_token,
            token_type="Bearer",
            expires_in_minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES,
        )

    async def change_password(self, user_id: str, payload: ChangePasswordRequest) -> bool:
        """Update password for authenticated user."""
        user = await self.user_repo.get_by_id(user_id)
        if not user:
            raise AuthenticationError("User not found.")

        if not verify_password(payload.old_password, user["password"]):
            raise AppException("Old password is incorrect.", status_code=400)

        hashed_pwd = hash_password(payload.new_password)
        await self.user_repo.update_password(user_id, hashed_pwd, utc_now().isoformat())
        logger.info(f"Password changed successfully for user_id '{user_id}'")
        return True
