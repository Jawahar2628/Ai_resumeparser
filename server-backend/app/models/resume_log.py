"""
Resume log entity model representation for MongoDB document persistence.
Stores backup snapshots of old resume document values before an update occurs due to matching email.
"""

from typing import Any, Dict, Optional
from pydantic import BaseModel, Field
from app.utils.helpers import generate_uuid, utc_now


class ResumeLogDocument(BaseModel):
    """MongoDB Resume Log Document structure representation."""

    id: str = Field(default_factory=generate_uuid)
    resume_id: str
    temp_upload_id: Optional[str] = None
    user_id: str
    email: Optional[str] = None
    old_data: Dict[str, Any] = Field(default_factory=dict)
    action: str = "EMAIL_UPDATE_BACKUP"
    created_at: str = Field(default_factory=lambda: utc_now().isoformat())

    def to_dict(self) -> Dict[str, Any]:
        """Convert pydantic model to dictionary for MongoDB operations."""
        return self.model_dump()
