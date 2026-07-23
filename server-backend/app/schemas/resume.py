"""
Pydantic schemas for Resume entity, upload responses, text extraction, and metadata.
"""

from typing import List, Optional
from pydantic import BaseModel, ConfigDict
from app.utils.enums import ResumeStatus


class ResumeResponse(BaseModel):
    """Resume metadata response DTO."""

    id: str
    user_id: str
    filename: str
    original_filename: str
    file_path: str
    extracted_text: Optional[str] = None
    upload_date: str
    status: ResumeStatus

    model_config = ConfigDict(from_attributes=True)


class ResumeExtractResponse(BaseModel):
    """Extracted resume text response ready for AI parsing."""

    id: str
    original_filename: str
    status: ResumeStatus
    extracted_text: str
    text_length: int

    model_config = ConfigDict(from_attributes=True)


class ResumeListResponse(BaseModel):
    """List of user resumes response."""

    total: int
    resumes: List[ResumeResponse]

    model_config = ConfigDict(from_attributes=True)
