"""
Resume controller handling HTTP requests for resume upload, retrieval, text extraction, and deletion.
"""

from fastapi import UploadFile, status
from fastapi.responses import JSONResponse
from app.services.resume_service import ResumeService
from app.utils.response import success_response


class ResumeController:
    """Controller orchestrating resume management API endpoints."""

    def __init__(self, resume_service: ResumeService):
        self.resume_service = resume_service

    async def upload_resume(self, user_id: str, file: UploadFile) -> JSONResponse:
        """Process resume file upload and text extraction."""
        resume_response = await self.resume_service.upload_and_process_resume(user_id, file)
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

    async def get_resume(self, resume_id: str, user_id: str, is_admin: bool = False) -> JSONResponse:
        """Process request to get details for single resume."""
        resume_response = await self.resume_service.get_resume_by_id(resume_id, user_id, is_admin=is_admin)
        return success_response(
            data=resume_response.model_dump(),
            message="Resume retrieved successfully.",
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
