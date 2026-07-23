"""
User controller handling HTTP requests for profile viewing, updating, and admin user listing.
"""

from fastapi.responses import JSONResponse
from app.schemas.user import UserResponse, UserUpdate
from app.services.user_service import UserService
from app.utils.response import success_response


class UserController:
    """Controller orchestrating user management API endpoints."""

    def __init__(self, user_service: UserService):
        self.user_service = user_service

    async def get_me(self, current_user: dict) -> JSONResponse:
        """Return profile information of currently authenticated user."""
        user_response = UserResponse.model_validate(current_user)
        return success_response(
            data=user_response.model_dump(),
            message="User profile retrieved successfully.",
        )

    async def update_me(self, user_id: str, payload: UserUpdate) -> JSONResponse:
        """Update authenticated user's profile information."""
        user_response = await self.user_service.update_user_profile(user_id, payload)
        return success_response(
            data=user_response.model_dump(),
            message="User profile updated successfully.",
        )

    async def list_users(self, skip: int = 0, limit: int = 100) -> JSONResponse:
        """Return list of all registered users (Admin privilege)."""
        users = await self.user_service.list_all_users(skip=skip, limit=limit)
        user_list = [u.model_dump() for u in users]
        return success_response(
            data={"total": len(user_list), "users": user_list},
            message="Users list retrieved successfully.",
        )
