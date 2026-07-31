"""
Interview service handling interview scheduling, rescheduling, feedback, filtering, and status updates.
"""

from typing import Any, Dict, List, Optional
from loguru import logger
from app.core.exceptions import NotFoundError
from app.models.interview import InterviewDocument
from app.repositories.interview_repository import InterviewRepository
from app.schemas.interview import (
    InterviewBatchCreateRequest,
    InterviewCreateRequest,
    InterviewFeedbackRequest,
    InterviewListResponse,
    InterviewRescheduleRequest,
    InterviewResponse,
    InterviewUpdateRequest,
)
from app.utils.enums import InterviewStatus, InterviewType
from app.utils.helpers import utc_now


class InterviewService:
    """Service handling interview business logic."""

    def __init__(self, interview_repo: InterviewRepository):
        self.interview_repo = interview_repo

    async def create_interview(self, payload: InterviewCreateRequest, created_by: Optional[str] = None) -> InterviewResponse:
        """Schedule a new interview document."""
        interview_doc = InterviewDocument(
            candidate_id=payload.candidate_id,
            candidate_name=payload.candidate_name,
            resume_id=payload.resume_id,
            job_id=payload.job_id,
            job_title=payload.job_title,
            job_location=payload.job_location,
            job_type=payload.job_type,
            interview_type=payload.interview_type,
            round_number=payload.round_number,
            scheduled_date=payload.scheduled_date,
            scheduled_time=payload.scheduled_time,
            timezone=payload.timezone,
            duration_minutes=payload.duration_minutes,
            interviewer_id=payload.interviewer_id,
            interviewer_name=payload.interviewer_name,
            interviewer_email=payload.interviewer_email,
            meeting_link=payload.meeting_link,
            meeting_platform=payload.meeting_platform,
            location=payload.location or payload.interview_location,
            interview_location=payload.interview_location or payload.location,
            hr_call_verification=payload.hr_call_verification,
            candidate_requested_date_time=payload.candidate_requested_date_time,
            candidate_requested_date=payload.candidate_requested_date,
            candidate_requested_time=payload.candidate_requested_time,
            candidate_requested_role=payload.candidate_requested_role,
            salary_requested=payload.salary_requested,
            final_fit_salary=payload.final_fit_salary,
            joining_date=payload.joining_date,
            interview_document_files=payload.interview_document_files,
            recommendation=payload.recommendation or "Pending",
            status=InterviewStatus.SCHEDULED,
            client_rating=payload.client_rating,
            client_feedback=payload.client_feedback,
            client_strengths=payload.client_strengths,
            client_weaknesses=payload.client_weaknesses,
            client_recommendation=payload.client_recommendation,
            client_notes=payload.client_notes,
            client_name=payload.client_name,
            client_feedback_date=payload.client_feedback_date,
            notes=payload.notes,
            created_by=created_by,
            updated_by=created_by,
        )

        created = await self.interview_repo.create(interview_doc.to_dict())
        logger.info(f"Scheduled new interview ID '{interview_doc.id}' for candidate '{payload.candidate_name}'")
        return InterviewResponse.model_validate(created)

    async def batch_create_interviews(
        self, payload: InterviewBatchCreateRequest, created_by: Optional[str] = None
    ) -> List[InterviewResponse]:
        """Batch schedule interviews for multiple candidates globally."""
        created_interviews: List[InterviewResponse] = []

        for candidate in payload.candidates:
            loc = candidate.interview_location or candidate.location or payload.interview_location or payload.location
            interview_doc = InterviewDocument(
                candidate_id=candidate.candidate_id,
                candidate_name=candidate.candidate_name,
                resume_id=candidate.resume_id,
                job_id=payload.job_id,
                job_title=payload.job_title,
                job_location=payload.job_location,
                job_type=payload.job_type,
                interview_type=payload.interview_type,
                round_number=payload.round_number,
                scheduled_date=payload.scheduled_date,
                scheduled_time=payload.scheduled_time,
                timezone=payload.timezone,
                duration_minutes=payload.duration_minutes,
                interviewer_id=payload.interviewer_id,
                interviewer_name=payload.interviewer_name,
                interviewer_email=payload.interviewer_email,
                meeting_link=payload.meeting_link,
                meeting_platform=payload.meeting_platform,
                location=loc,
                interview_location=loc,
                hr_call_verification=payload.hr_call_verification,
                candidate_requested_date_time=payload.candidate_requested_date_time,
                candidate_requested_date=payload.candidate_requested_date,
                candidate_requested_time=payload.candidate_requested_time,
                candidate_requested_role=payload.candidate_requested_role,
                salary_requested=payload.salary_requested,
                final_fit_salary=payload.final_fit_salary,
                joining_date=payload.joining_date,
                interview_document_files=payload.interview_document_files,
                recommendation=payload.recommendation or "Pending",
                status=InterviewStatus.SCHEDULED,
                client_rating=payload.client_rating,
                client_feedback=payload.client_feedback,
                client_strengths=payload.client_strengths,
                client_weaknesses=payload.client_weaknesses,
                client_recommendation=payload.client_recommendation,
                client_notes=payload.client_notes,
                client_name=payload.client_name,
                client_feedback_date=payload.client_feedback_date,
                notes=payload.notes,
                created_by=created_by,
                updated_by=created_by,
            )

            created = await self.interview_repo.create(interview_doc.to_dict())
            created_interviews.append(InterviewResponse.model_validate(created))

        logger.info(f"Batch scheduled {len(created_interviews)} interviews for job '{payload.job_title}'")
        return created_interviews

    async def get_interview_by_id(self, interview_id: str) -> InterviewResponse:
        """Fetch details for a single interview by ID."""
        interview = await self.interview_repo.get_by_id(interview_id)
        if not interview:
            raise NotFoundError("Interview not found.")
        return InterviewResponse.model_validate(interview)

    async def filter_interviews(
        self,
        candidate_id: Optional[str] = None,
        interviewer_id: Optional[str] = None,
        status: Optional[InterviewStatus] = None,
        interview_type: Optional[InterviewType] = None,
        job_title: Optional[str] = None,
        date_from: Optional[str] = None,
        date_to: Optional[str] = None,
        skip: int = 0,
        limit: int = 100,
    ) -> InterviewListResponse:
        """Filter and list interviews matching parameters."""
        interviews = await self.interview_repo.filter_interviews(
            candidate_id=candidate_id,
            interviewer_id=interviewer_id,
            status=status,
            interview_type=interview_type,
            job_title=job_title,
            date_from=date_from,
            date_to=date_to,
            skip=skip,
            limit=limit,
        )
        total = await self.interview_repo.count_interviews(
            candidate_id=candidate_id,
            interviewer_id=interviewer_id,
            status=status,
        )
        items = [InterviewResponse.model_validate(i) for i in interviews]
        return InterviewListResponse(total=total, interviews=items)

    async def update_interview(
        self,
        interview_id: str,
        payload: InterviewUpdateRequest,
        updated_by: Optional[str] = None,
    ) -> InterviewResponse:
        """Update fields of an existing interview document."""
        existing = await self.interview_repo.get_by_id(interview_id)
        if not existing:
            raise NotFoundError("Interview not found.")

        update_fields = payload.model_dump(exclude_unset=True)
        if "status" in update_fields and isinstance(update_fields["status"], InterviewStatus):
            update_fields["status"] = update_fields["status"].value
        if "interview_type" in update_fields and isinstance(update_fields["interview_type"], InterviewType):
            update_fields["interview_type"] = update_fields["interview_type"].value

        update_fields["updated_by"] = updated_by
        update_fields["updated_at"] = utc_now().isoformat()

        updated_doc = await self.interview_repo.update(interview_id, update_fields)
        logger.info(f"Updated interview record '{interview_id}'")
        return InterviewResponse.model_validate(updated_doc)

    async def reschedule_interview(
        self,
        interview_id: str,
        payload: InterviewRescheduleRequest,
        updated_by: Optional[str] = None,
    ) -> InterviewResponse:
        """Reschedule an existing interview and push entry into reschedule history."""
        existing = await self.interview_repo.get_by_id(interview_id)
        if not existing:
            raise NotFoundError("Interview not found.")

        history_entry = {
            "previous_date": existing.get("scheduled_date"),
            "previous_time": existing.get("scheduled_time"),
            "new_date": payload.scheduled_date,
            "new_time": payload.scheduled_time,
            "reason": payload.reason,
            "rescheduled_at": utc_now().isoformat(),
            "rescheduled_by": updated_by,
        }

        updated_doc = await self.interview_repo.reschedule_interview(
            interview_id=interview_id,
            new_date=payload.scheduled_date,
            new_time=payload.scheduled_time,
            timezone=payload.timezone or existing.get("timezone", "Asia/Kolkata"),
            duration_minutes=payload.duration_minutes or existing.get("duration_minutes", 60),
            history_entry=history_entry,
            updated_by=updated_by,
        )

        logger.info(f"Rescheduled interview ID '{interview_id}' to date {payload.scheduled_date} at {payload.scheduled_time}")
        return InterviewResponse.model_validate(updated_doc)

    async def submit_feedback(
        self,
        interview_id: str,
        payload: InterviewFeedbackRequest,
        updated_by: Optional[str] = None,
    ) -> InterviewResponse:
        """Submit rating, feedback, strengths, and weaknesses for an interview (Round Interviewer and/or Client)."""
        existing = await self.interview_repo.get_by_id(interview_id)
        if not existing:
            raise NotFoundError("Interview not found.")

        updated_doc = await self.interview_repo.submit_feedback(
            interview_id=interview_id,
            rating=payload.rating,
            feedback=payload.feedback,
            strengths=payload.strengths,
            weaknesses=payload.weaknesses,
            recommendation=payload.recommendation,
            notes=payload.notes,
            client_rating=payload.client_rating,
            client_feedback=payload.client_feedback,
            client_strengths=payload.client_strengths,
            client_weaknesses=payload.client_weaknesses,
            client_recommendation=payload.client_recommendation,
            client_notes=payload.client_notes,
            client_name=payload.client_name,
            client_feedback_date=payload.client_feedback_date,
            updated_by=updated_by,
            candidate_requested_date=payload.candidate_requested_date,
            candidate_requested_time=payload.candidate_requested_time,
            candidate_requested_role=payload.candidate_requested_role,
            salary_requested=payload.salary_requested,
            final_fit_salary=payload.final_fit_salary,
            joining_date=payload.joining_date,
            interview_document_files=payload.interview_document_files,
        )

        logger.info(f"Submitted feedback for interview ID '{interview_id}'")
        return InterviewResponse.model_validate(updated_doc)


    async def delete_interview(self, interview_id: str) -> bool:
        """Delete interview record from database."""
        existing = await self.interview_repo.get_by_id(interview_id)
        if not existing:
            raise NotFoundError("Interview not found.")

        deleted = await self.interview_repo.delete(interview_id)
        logger.info(f"Deleted interview document ID '{interview_id}'")
        return deleted
