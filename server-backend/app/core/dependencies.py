"""
FastAPI dependency injectors for database access, JWT user authentication, and RBAC authorization.
"""

from typing import Callable, List
from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.core.database import get_database
from app.core.exceptions import AuthenticationError, AuthorizationError
from app.core.security import decode_jwt_token
from app.utils.constants import USERS_COLLECTION

security_bearer = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security_bearer),
    db: AsyncIOMotorDatabase = Depends(get_database),
) -> dict:
    """
    Dependency to validate JWT Access Token and fetch current authenticated user from MongoDB.
    """
    if not credentials or not credentials.credentials:
        raise AuthenticationError("Authorization header missing or invalid.")

    token = credentials.credentials
    payload = decode_jwt_token(token)

    if payload.get("type") != "access":
        raise AuthenticationError("Invalid token type. Access token required.")

    user_id = payload.get("sub")
    if not user_id:
        raise AuthenticationError("Token payload missing subject.")

    users_collection = db[USERS_COLLECTION]
    user = await users_collection.find_one({"id": user_id})

    if not user:
        raise AuthenticationError("Authenticated user no longer exists.")

    return user


async def get_current_active_user(
    current_user: dict = Depends(get_current_user),
) -> dict:
    """
    Dependency to ensure the current authenticated user is active.
    """
    if not current_user.get("is_active", True):
        raise AuthenticationError("User account is inactive.")
    return current_user


def require_role(allowed_roles: List[str]) -> Callable:
    """
    Dependency factory to enforce Role-Based Access Control (RBAC).
    """

    async def role_checker(current_user: dict = Depends(get_current_active_user)) -> dict:
        user_role = current_user.get("role")
        if user_role not in allowed_roles:
            raise AuthorizationError(f"Action requires one of the following roles: {', '.join(allowed_roles)}")
        return current_user

    return role_checker
