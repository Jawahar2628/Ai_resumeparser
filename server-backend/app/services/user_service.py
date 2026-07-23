"""
User management service handling user profile operations and admin user listings.
"""

from typing import List
from app.core.exceptions import NotFoundError
from app.repositories.user_repository import UserRepository
from app.schemas.user import UserResponse, UserUpdate
from app.utils.helpers import utc_now


class UserService:
    """Service handling user profile management operations."""

    def __init__(self, user_repo: UserRepository):
        self.user_repo = user_repo

    async def get_user_profile(self, user_id: str) -> UserResponse:
        """Get profile details for specified user ID."""
        user = await self.user_repo.get_by_id(user_id)
        if not user:
            raise NotFoundError("User profile not found.")
        return UserResponse.model_validate(user)

    async def update_user_profile(self, user_id: str, payload: UserUpdate) -> UserResponse:
        """Update profile fields for specified user."""
        user = await self.user_repo.get_by_id(user_id)
        if not user:
            raise NotFoundError("User profile not found.")

        update_dict = payload.model_dump(exclude_unset=True)
        if not update_dict:
            return UserResponse.model_validate(user)

        update_dict["updated_at"] = utc_now().isoformat()
        updated_user = await self.user_repo.update(user_id, update_dict)
        return UserResponse.model_validate(updated_user)

    async def list_all_users(self, skip: int = 0, limit: int = 100) -> List[UserResponse]:
        """Fetch paginated list of all registered users (Admin only)."""
        users = await self.user_repo.find_many(skip=skip, limit=limit, sort_by="created_at", descending=True)
        return [UserResponse.model_validate(u) for u in users]
