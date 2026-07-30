"""
Resume controller handling HTTP requests for resume upload, retrieval, text extraction, and deletion.
"""

from fastapi import UploadFile, status, BackgroundTasks
from fastapi.responses import JSONResponse
from app.schemas.resume import ResumeUpdateRequest
from app.services.resume_service import ResumeService
from app.utils.response import success_response


class ResumeController:
    """Controller orchestrating resume management API endpoints."""

    def __init__(self, resume_service: ResumeService):
        self.resume_service = resume_service

    async def upload_resume(self, user_id: str, file: UploadFile, background_tasks: BackgroundTasks) -> JSONResponse:
        """Process resume file upload and text extraction."""
        resume_response = await self.resume_service.upload_and_process_resume(user_id, file, background_tasks)
        return success_response(
            data=resume_response.model_dump(),
            message="Resume uploaded and processed successfully.",
            status_code=status.HTTP_201_CREATED,
        )

    async def list_resumes(self, user_id: str, skip: int = 0, limit: int = 100) -> JSONResponse:
        """Process request to list all user uploaded resumes."""
        resume_list_response = await self.resume_service.get_user_resumes(user_id, skip=skip, limit=limit)
        return success_response(
            data=resume_list_response.model_dump(),
            message="Resumes retrieved successfully.",
        )

    async def filter_resumes(
        self,
        user_id: str,
        job_title: list[str] = None,
        min_experience: float = None,
        max_experience: float = None,
        location: list[str] = None,
        employment_type: list[str] = None,
        year_of_passing: list[str] = None,
        skills: list[str] = None,
        keywords: list[str] = None,
        skip: int = 0,
        limit: int = 100,
    ) -> JSONResponse:
        """Process request to filter resumes based on criteria."""
        filtered_response = await self.resume_service.filter_resumes(
            user_id=user_id,
            job_title=job_title,
            min_experience=min_experience,
            max_experience=max_experience,
            location=location,
            employment_type=employment_type,
            year_of_passing=year_of_passing,
            skills=skills,
            keywords=keywords,
            skip=skip,
            limit=limit,
        )
        return success_response(
            data=filtered_response.model_dump(),
            message="Filtered resumes retrieved successfully.",
        )

    async def get_resume(self, resume_id: str, user_id: str, is_admin: bool = False) -> JSONResponse:
        """Process request to get details for single resume."""
        resume_response = await self.resume_service.get_resume_by_id(resume_id, user_id, is_admin=is_admin)
        return success_response(
            data=resume_response.model_dump(),
            message="Resume retrieved successfully.",
        )

    async def update_resume(self, resume_id: str, update_payload: ResumeUpdateRequest, user_id: str, is_admin: bool = False) -> JSONResponse:
        """Process request to update resume fields and append HR update."""
        resume_response = await self.resume_service.update_resume(resume_id, user_id, update_payload, is_admin=is_admin)
        return success_response(
            data=resume_response.model_dump(),
            message="Resume updated successfully.",
        )

    async def extract_text(self, resume_id: str, user_id: str, is_admin: bool = False) -> JSONResponse:
        """Process request to extract formatted text prepared for AI parsing."""
        extraction_response = await self.resume_service.extract_resume_text_for_ai(resume_id, user_id, is_admin=is_admin)
        return success_response(
            data=extraction_response.model_dump(),
            message="Resume text extracted successfully.",
        )

    async def delete_resume(self, resume_id: str, user_id: str, is_admin: bool = False) -> JSONResponse:
        """Process request to delete resume file and record."""
        await self.resume_service.delete_resume(resume_id, user_id, is_admin=is_admin)
        return success_response(
            data={},
            message="Resume deleted successfully.",
        )


    async def parsed_resume_summary(
        self,
        user_id: str,
        skip: int = 0,
        limit: int = 100,
    ):
        """
        Get parsed resume summary.
        """
        resumes = await self.resume_service.get_parsed_resume_summary(
            user_id=user_id,
            skip=skip,
            limit=limit,
        )

        return success_response(
            data=resumes,
            message="Parsed resume summary retrieved successfully.",
        )