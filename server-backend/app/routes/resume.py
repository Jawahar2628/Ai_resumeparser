"""
Resume processing routes for uploading PDF/DOC/DOCX files, listing resumes, text extraction, and deletion.
"""

from fastapi import APIRouter, Depends, File, Query, UploadFile, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.controllers.resume_controller import ResumeController
from app.core.database import get_database
from app.core.dependencies import get_current_active_user, get_current_active_user_optional
from app.repositories.resume_repository import ResumeRepository
from app.services.resume_service import ResumeService
from app.utils.enums import UserRole

router = APIRouter(prefix="/api/v1/resumes", tags=["Resumes"])


def get_resume_controller(db: AsyncIOMotorDatabase = Depends(get_database)) -> ResumeController:
    """Dependency injector for ResumeController."""
    resume_repo = ResumeRepository(db)
    resume_service = ResumeService(resume_repo)
    return ResumeController(resume_service)


@router.post(
    "/upload",
    status_code=status.HTTP_201_CREATED,
    summary="Upload resume file",
    description="Upload a PDF, DOC, or DOCX resume document. Extracts text and stores file metadata.",
)
async def upload_resume(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_active_user_optional),
    controller: ResumeController = Depends(get_resume_controller),
):
    return await controller.upload_resume(current_user["id"], file)


@router.get(
    "",
    status_code=status.HTTP_200_OK,
    summary="List user resumes",
    description="Retrieve paginated list of uploaded resumes belonging to current user.",
)
async def list_resumes(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    current_user: dict = Depends(get_current_active_user),
    controller: ResumeController = Depends(get_resume_controller),
):
    return await controller.list_resumes(current_user["id"], skip=skip, limit=limit)


@router.get(
    "/{resume_id}",
    status_code=status.HTTP_200_OK,
    summary="Get resume details",
    description="Retrieve metadata for specific resume by ID.",
)
async def get_resume(
    resume_id: str,
    current_user: dict = Depends(get_current_active_user),
    controller: ResumeController = Depends(get_resume_controller),
):
    is_admin = current_user.get("role") == UserRole.ADMIN
    return await controller.get_resume(resume_id, current_user["id"], is_admin=is_admin)


@router.get(
    "/{resume_id}/extract",
    status_code=status.HTTP_200_OK,
    summary="Extract text for AI parsing",
    description="Retrieve extracted resume text formatted and ready for AI LLM parsing.",
)
async def extract_text(
    resume_id: str,
    current_user: dict = Depends(get_current_active_user),
    controller: ResumeController = Depends(get_resume_controller),
):
    is_admin = current_user.get("role") == UserRole.ADMIN
    return await controller.extract_text(resume_id, current_user["id"], is_admin=is_admin)


@router.delete(
    "/{resume_id}",
    status_code=status.HTTP_200_OK,
    summary="Delete resume",
    description="Delete resume metadata from database and purge associated file from disk.",
)
async def delete_resume(
    resume_id: str,
    current_user: dict = Depends(get_current_active_user),
    controller: ResumeController = Depends(get_resume_controller),
):
    is_admin = current_user.get("role") == UserRole.ADMIN
    return await controller.delete_resume(resume_id, current_user["id"], is_admin=is_admin)
