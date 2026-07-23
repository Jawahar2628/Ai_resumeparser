"""
User management routes for accessing profile details, updating profile, and admin user listings.
"""

from fastapi import APIRouter, Depends, Query, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.controllers.user_controller import UserController
from app.core.database import get_database
from app.core.dependencies import get_current_active_user, require_role
from app.repositories.user_repository import UserRepository
from app.schemas.user import UserUpdate
from app.services.user_service import UserService
from app.utils.enums import UserRole

router = APIRouter(prefix="/api/v1/users", tags=["Users"])


def get_user_controller(db: AsyncIOMotorDatabase = Depends(get_database)) -> UserController:
    """Dependency injector for UserController."""
    user_repo = UserRepository(db)
    user_service = UserService(user_repo)
    return UserController(user_service)


@router.get(
    "/me",
    status_code=status.HTTP_200_OK,
    summary="Get current user profile",
    description="Retrieve profile information of currently authenticated user.",
)
async def get_me(
    current_user: dict = Depends(get_current_active_user),
    controller: UserController = Depends(get_user_controller),
):
    return await controller.get_me(current_user)


@router.put(
    "/me",
    status_code=status.HTTP_200_OK,
    summary="Update user profile",
    description="Update profile details for currently authenticated user.",
)
async def update_me(
    payload: UserUpdate,
    current_user: dict = Depends(get_current_active_user),
    controller: UserController = Depends(get_user_controller),
):
    return await controller.update_me(current_user["id"], payload)


@router.get(
    "",
    status_code=status.HTTP_200_OK,
    summary="List all users (Admin)",
    description="Retrieve paginated list of registered users. Requires administrator role.",
)
async def list_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    admin_user: dict = Depends(require_role([UserRole.ADMIN])),
    controller: UserController = Depends(get_user_controller),
):
    return await controller.list_users(skip=skip, limit=limit)
