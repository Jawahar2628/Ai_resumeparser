"""
Resume log repository for MongoDB database queries regarding ResumeLog entities.
"""

from typing import Any, Dict, List
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.repositories.base_repository import BaseRepository
from app.utils.constants import RESUME_LOGS_COLLECTION


class ResumeLogRepository(BaseRepository):
    """Repository handling database operations for resume_logs collection."""

    def __init__(self, db: AsyncIOMotorDatabase):
        super().__init__(db, RESUME_LOGS_COLLECTION)

    async def get_logs_by_resume_id(self, resume_id: str) -> List[Dict[str, Any]]:
        """Fetch version history logs for a specific resume ID."""
        return await self.find_many(query={"resume_id": resume_id}, sort_by="created_at", descending=True)

    async def get_logs_by_user_id(self, user_id: str, skip: int = 0, limit: int = 100) -> List[Dict[str, Any]]:
        """Fetch version logs belonging to specific user."""
        return await self.find_many(query={"user_id": user_id}, skip=skip, limit=limit, sort_by="created_at", descending=True)
