"""
User repository for MongoDB database queries regarding User entities.
"""

from typing import Any, Dict, Optional
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.repositories.base_repository import BaseRepository
from app.utils.constants import USERS_COLLECTION


class UserRepository(BaseRepository):
    """Repository handling database operations for users collection."""

    def __init__(self, db: AsyncIOMotorDatabase):
        super().__init__(db, USERS_COLLECTION)

    async def get_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        """Fetch user document by normalized email address."""
        return await self.find_one({"email": email.strip().lower()})

    async def update_password(self, user_id: str, new_hashed_password: str, updated_at: str) -> Optional[Dict[str, Any]]:
        """Update password hash for given user."""
        return await self.update(user_id, {"password": new_hashed_password, "updated_at": updated_at})
