"""
Resume entity model representation for MongoDB document persistence.
"""

from typing import Any, Dict, Optional
from pydantic import BaseModel, Field
from app.utils.enums import ResumeStatus
from app.utils.helpers import generate_uuid, utc_now


class ResumeDocument(BaseModel):
    """MongoDB Resume Document structure representation."""

    id: str = Field(default_factory=generate_uuid)
    user_id: str
    filename: str
    original_filename: str
    file_path: str
    extracted_text: Optional[str] = None
    s3_url: Optional[str] = None
    parsed_data: Optional[Dict[str, Any]] = None
    upload_date: str = Field(default_factory=lambda: utc_now().isoformat())
    status: ResumeStatus = ResumeStatus.PENDING

    def to_dict(self) -> Dict[str, Any]:
        """Convert pydantic model to dictionary for MongoDB operations."""
        return self.model_dump()
