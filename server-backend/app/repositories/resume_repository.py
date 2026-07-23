"""
Resume repository for MongoDB database queries regarding Resume entities.
"""

from typing import Any, Dict, List, Optional
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.repositories.base_repository import BaseRepository
from app.utils.constants import RESUMES_COLLECTION
from app.utils.enums import ResumeStatus


class ResumeRepository(BaseRepository):
    """Repository handling database operations for resumes collection."""

    def __init__(self, db: AsyncIOMotorDatabase):
        super().__init__(db, RESUMES_COLLECTION)

    async def get_by_user_id(self, user_id: str, skip: int = 0, limit: int = 100) -> List[Dict[str, Any]]:
        """Fetch list of resumes belonging to specific user."""
        return await self.find_many(query={"user_id": user_id}, skip=skip, limit=limit, sort_by="upload_date", descending=True)

    async def count_by_user_id(self, user_id: str) -> int:
        """Count total resumes uploaded by user."""
        return await self.count(query={"user_id": user_id})

    async def find_by_user_and_filename(self, user_id: str, original_filename: str) -> Optional[Dict[str, Any]]:
        """Check if user has already uploaded a file with the same original filename."""
        return await self.find_one({"user_id": user_id, "original_filename": original_filename})

    async def update_status_and_text(self, resume_id: str, status: ResumeStatus, extracted_text: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """Update resume extraction status and extracted text content."""
        update_fields: Dict[str, Any] = {"status": status.value}
        if extracted_text is not None:
            update_fields["extracted_text"] = extracted_text
        return await self.update(resume_id, update_fields)
