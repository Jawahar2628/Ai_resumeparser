"""
Pydantic schemas for Interview entity operations, scheduling, feedback, and responses.
"""

from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field
from app.utils.enums import InterviewStatus, InterviewType


class InterviewCreateRequest(BaseModel):
    """Payload for scheduling a new interview."""

    candidate_id: str
    candidate_name: str
    resume_id: Optional[str] = None

    job_id: Optional[str] = None
    job_title: str

    interview_type: InterviewType = InterviewType.TECHNICAL
    round_number: int = 1

    scheduled_date: str
    scheduled_time: str
    timezone: str = "Asia/Kolkata"
    duration_minutes: int = 60

    interviewer_id: Optional[str] = None
    interviewer_name: str
    interviewer_email: Optional[str] = None

    meeting_link: Optional[str] = None
    meeting_platform: Optional[str] = "Google Meet"

    notes: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class InterviewUpdateRequest(BaseModel):
    """Payload for updating existing interview details."""

    candidate_name: Optional[str] = None
    job_title: Optional[str] = None
    interview_type: Optional[InterviewType] = None
    round_number: Optional[int] = None

    scheduled_date: Optional[str] = None
    scheduled_time: Optional[str] = None
    timezone: Optional[str] = None
    duration_minutes: Optional[int] = None

    interviewer_id: Optional[str] = None
    interviewer_name: Optional[str] = None
    interviewer_email: Optional[str] = None

    meeting_link: Optional[str] = None
    meeting_platform: Optional[str] = None

    status: Optional[InterviewStatus] = None
    notes: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class InterviewRescheduleRequest(BaseModel):
    """Payload for rescheduling an interview."""

    scheduled_date: str
    scheduled_time: str
    timezone: Optional[str] = "Asia/Kolkata"
    duration_minutes: Optional[int] = 60
    reason: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class InterviewFeedbackRequest(BaseModel):
    """Payload for submitting interview rating and feedback."""

    rating: float = Field(..., ge=1.0, le=5.0, description="Rating score out of 5")
    feedback: str
    strengths: List[str] = Field(default_factory=list)
    weaknesses: List[str] = Field(default_factory=list)
    recommendation: Optional[str] = None  # Selected / Rejected / Next Round / Hold
    notes: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class InterviewResponse(BaseModel):
    """Response schema representing an Interview document."""

    id: str
    candidate_id: str
    candidate_name: str
    resume_id: Optional[str] = None

    job_id: Optional[str] = None
    job_title: str

    interview_type: InterviewType
    round_number: int

    scheduled_date: str
    scheduled_time: str
    timezone: str
    duration_minutes: int

    interviewer_id: Optional[str] = None
    interviewer_name: str
    interviewer_email: Optional[str] = None

    meeting_link: Optional[str] = None
    meeting_platform: Optional[str] = None

    status: InterviewStatus

    rating: Optional[float] = None
    feedback: Optional[str] = None
    strengths: List[str] = Field(default_factory=list)
    weaknesses: List[str] = Field(default_factory=list)
    recommendation: Optional[str] = None
    notes: Optional[str] = None

    reschedule_history: List[Dict[str, Any]] = Field(default_factory=list)

    created_by: Optional[str] = None
    updated_by: Optional[str] = None
    created_at: str
    updated_at: str

    model_config = ConfigDict(from_attributes=True)


class InterviewListResponse(BaseModel):
    """Paginated list of interviews response."""

    total: int
    interviews: List[InterviewResponse]

    model_config = ConfigDict(from_attributes=True)
