"""
Resume service handling file storage, text extraction (PyMuPDF & docx), metadata recording, and text cleanup for AI parsing.
"""

import os
from pathlib import Path
from typing import Any, Dict, List, Optional
import docx
import fitz  # PyMuPDF
from fastapi import UploadFile
from loguru import logger
from app.core.config import settings
from app.core.exceptions import FileUploadError, NotFoundError
from app.models.resume import ResumeDocument
from app.repositories.resume_repository import ResumeRepository
from app.schemas.resume import ResumeExtractResponse, ResumeListResponse, ResumeResponse
from app.services.s3_service import S3Service
from app.utils.enums import ResumeStatus
from app.utils.helpers import generate_uuid, sanitize_filename
from app.utils.validators import validate_uploaded_file


class ResumeService:
    """Service handling resume processing, text extraction, S3 upload, and parsing."""

    def __init__(self, resume_repo: ResumeRepository, s3_service: Optional[S3Service] = None):
        self.resume_repo = resume_repo
        self.s3_service = s3_service or S3Service()
        self.upload_dir = Path(__file__).resolve().parent.parent / settings.UPLOAD_FOLDER
        self.upload_dir.mkdir(parents=True, exist_ok=True)

    async def upload_and_process_resume(self, user_id: str, file: UploadFile) -> ResumeResponse:
        """
        Validate file, save to disk, upload to AWS S3, parse resume using resume-parser-pro, and save document in MongoDB.
        """
        if not file.filename:
            raise FileUploadError("No filename provided.")

        original_filename = sanitize_filename(file.filename)

        # Check duplicate original filename for user: if existing, return existing or update with unique suffix
        existing_resume = await self.resume_repo.find_by_user_and_filename(user_id, original_filename)
        if existing_resume:
            logger.info(f"Existing upload found for '{original_filename}'. Overwriting/updating record.")

        content = await validate_uploaded_file(file)

        ext = original_filename.rsplit(".", 1)[-1].lower()
        resume_id = generate_uuid()
        unique_filename = f"{resume_id}_{original_filename}"
        file_path = str(self.upload_dir / unique_filename)

        # Write file to disk
        with open(file_path, "wb") as f:
            f.write(content)

        logger.info(f"Saved uploaded file to disk: {file_path}")

        # 1. Upload to S3 Bucket
        content_type = file.content_type or "application/octet-stream"
        s3_url = self.s3_service.upload_file(content, unique_filename, content_type)

        # 2. Extract plain text
        extracted_text = ""
        status = ResumeStatus.PARSED

        try:
            extracted_text = self._extract_text_from_file(file_path, ext)
            if not extracted_text or not extracted_text.strip():
                status = ResumeStatus.FAILED
                extracted_text = ""
        except Exception as e:
            logger.error(f"Text extraction failed for file '{unique_filename}': {e}")
            status = ResumeStatus.FAILED
            extracted_text = ""

        # 3. Parse resume using AI Parser backend
        parsed_data = {}
        ai_evaluation = {}
        try:
            import httpx
            with open(file_path, "rb") as f:
                async with httpx.AsyncClient(timeout=120.0) as client:
                    response = await client.post(
                        "http://localhost:8001/api/upload",
                        files={"file": (original_filename, f, file.content_type or "application/pdf")}
                    )
                    response.raise_for_status()
                    ai_result = response.json()
                    parsed_data = ai_result.get("parsed_resume", {})
                    ai_evaluation = ai_result.get("evaluation", {})
        except Exception as e:
            logger.error(f"AI Parsing failed for '{unique_filename}': {e}")
            status = ResumeStatus.FAILED

        # 4. Create MongoDB Document
        resume_doc = ResumeDocument(
            id=resume_id,
            user_id=user_id,
            filename=unique_filename,
            original_filename=original_filename,
            file_path=file_path,
            extracted_text=extracted_text,
            s3_url=s3_url,
            parsed_data=parsed_data,
            ai_evaluation=ai_evaluation,
            status=status,
        )

        created = await self.resume_repo.create(resume_doc.to_dict())
        logger.info(f"Recorded resume document in MongoDB: ID '{resume_id}' for user '{user_id}' with S3 URL '{s3_url}'")
        return ResumeResponse.model_validate(created)

    def _extract_text_from_file(self, file_path: str, ext: str) -> str:
        """Extract plain text from PDF, DOCX, or DOC file."""
        if ext == "pdf":
            return self._extract_text_from_pdf(file_path)
        elif ext == "docx":
            return self._extract_text_from_docx(file_path)
        elif ext == "doc":
            return self._extract_text_from_doc(file_path)
        else:
            raise FileUploadError(f"Unsupported extension: {ext}")

    def _extract_text_from_pdf(self, file_path: str) -> str:
        """Extract text from PDF using PyMuPDF (fitz)."""
        text_parts = []
        with fitz.open(file_path) as doc:
            for page in doc:
                text_parts.append(page.get_text())
        return "\n".join(text_parts).strip()

    def _extract_text_from_docx(self, file_path: str) -> str:
        """Extract text from DOCX using python-docx."""
        doc = docx.Document(file_path)
        text_parts = [para.text for para in doc.paragraphs if para.text.strip()]
        for table in doc.tables:
            for row in table.rows:
                row_text = " | ".join([cell.text.strip() for cell in row.cells if cell.text.strip()])
                if row_text:
                    text_parts.append(row_text)
        return "\n".join(text_parts).strip()

    def _extract_text_from_doc(self, file_path: str) -> str:
        """Fallback text extraction for legacy binary DOC format."""
        try:
            with open(file_path, "rb") as f:
                content = f.read().decode("utf-8", errors="ignore")
                # Filter printable ASCII/text characters
                clean = "".join([c for c in content if c.isprintable() or c in ("\n", "\r", "\t")])
                return clean.strip()
        except Exception:
            return ""

    async def get_resume_by_id(self, resume_id: str, user_id: str, is_admin: bool = False) -> ResumeResponse:
        """Fetch single resume by ID, checking ownership if non-admin."""
        resume = await self.resume_repo.get_by_id(resume_id)
        if not resume:
            raise NotFoundError("Resume not found.")
        if not is_admin and resume["user_id"] != user_id:
            raise NotFoundError("Resume not found.")
        return ResumeResponse.model_validate(resume)

    async def get_user_resumes(self, user_id: str, skip: int = 0, limit: int = 100) -> ResumeListResponse:
        """Fetch list of resumes belonging to user."""
        resumes = await self.resume_repo.get_by_user_id(user_id, skip=skip, limit=limit)
        total = await self.resume_repo.count_by_user_id(user_id)
        items = [ResumeResponse.model_validate(r) for r in resumes]
        return ResumeListResponse(total=total, resumes=items)

    async def filter_resumes(
        self,
        user_id: str,
        job_title: Optional[str] = None,
        min_experience: Optional[float] = None,
        max_experience: Optional[float] = None,
        location: Optional[str] = None,
        employment_type: Optional[str] = None,
        year_of_passing: Optional[str] = None,
        skills: Optional[List[str]] = None,
        skip: int = 0,
        limit: int = 100,
    ) -> ResumeListResponse:
        """Filter resumes belonging to user matching criteria."""
        resumes = await self.resume_repo.filter_resumes(
            user_id=user_id,
            job_title=job_title,
            min_experience=min_experience,
            max_experience=max_experience,
            location=location,
            employment_type=employment_type,
            year_of_passing=year_of_passing,
            skills=skills,
            skip=skip,
            limit=limit,
        )
        total = len(resumes)
        items = [ResumeResponse.model_validate(r) for r in resumes]
        return ResumeListResponse(total=total, resumes=items)

    async def extract_resume_text_for_ai(self, resume_id: str, user_id: str, is_admin: bool = False) -> ResumeExtractResponse:
        """Extract and format resume text for AI parsing pipeline."""
        resume = await self.resume_repo.get_by_id(resume_id)
        if not resume:
            raise NotFoundError("Resume not found.")
        if not is_admin and resume["user_id"] != user_id:
            raise NotFoundError("Resume not found.")

        extracted = resume.get("extracted_text", "") or ""
        return ResumeExtractResponse(
            id=resume["id"],
            original_filename=resume["original_filename"],
            status=ResumeStatus(resume["status"]),
            extracted_text=extracted,
            text_length=len(extracted),
        )

    async def delete_resume(self, resume_id: str, user_id: str, is_admin: bool = False) -> bool:
        """Delete resume record from DB and remove associated file from disk."""
        resume = await self.resume_repo.get_by_id(resume_id)
        if not resume:
            raise NotFoundError("Resume not found.")
        if not is_admin and resume["user_id"] != user_id:
            raise NotFoundError("Resume not found.")

        # Remove file from disk if present
        file_path = resume.get("file_path")
        if file_path and os.path.exists(file_path):
            try:
                os.remove(file_path)
                logger.info(f"Deleted file from disk: {file_path}")
            except Exception as e:
                logger.error(f"Failed to delete file from disk: {file_path} - {e}")

        # Remove from MongoDB
        deleted = await self.resume_repo.delete(resume_id)
        logger.info(f"Deleted resume record '{resume_id}' from MongoDB.")
        return deleted


    async def get_parsed_resume_summary(
        self,
        user_id: str,
        skip: int = 0,
        limit: int = 100,
    ):
        """
        Return aggregated summary arrays across user's parsed resumes.
        """
        raw_resumes = await self.resume_repo.get_parsed_resume_summary(
            user_id=user_id,
            skip=skip,
            limit=limit,
        )

        locations = set()
        total_experience_years = set()
        primary_skills = set()
        frameworks = set()
        databases = set()
        designations = set()
        roles = set()
        year_of_passing = set()
        experience_levels = set()
        ai_technical_scores = set()
        personality_analysis_list = []

        for item in raw_resumes:
            parsed_data = item.get("parsed_data") or {}
            ai_eval = item.get("ai_evaluation") or {}

            # Locations
            if parsed_data.get("location"):
                locations.add(parsed_data["location"].strip())

            # Total experience years
            exp = parsed_data.get("total_experience_years")
            if exp is not None and isinstance(exp, (int, float)):
                total_experience_years.add(float(exp))

            # Primary skills
            for s in parsed_data.get("primary_skills") or []:
                if s and isinstance(s, str) and s.strip():
                    primary_skills.add(s.strip())

            # Frameworks
            for f in parsed_data.get("frameworks") or []:
                if f and isinstance(f, str) and f.strip():
                    frameworks.add(f.strip())

            # Databases
            for d in parsed_data.get("databases") or []:
                if d and isinstance(d, str) and d.strip():
                    databases.add(d.strip())

            # Designations (from top-level field or experience entries)
            if parsed_data.get("designation"):
                designations.add(parsed_data["designation"].strip())

            # Roles (from top-level field or projects/experience entries)
            if parsed_data.get("role"):
                roles.add(parsed_data["role"].strip())

            # Experience array items for designation and role
            for exp_item in parsed_data.get("experience") or []:
                if isinstance(exp_item, dict):
                    des = exp_item.get("designation")
                    if des and isinstance(des, str) and des.strip():
                        designations.add(des.strip())
                    r = exp_item.get("role")
                    if r and isinstance(r, str) and r.strip():
                        roles.add(r.strip())

            # Projects array items for roles/designations if present
            for proj in parsed_data.get("projects") or []:
                if isinstance(proj, dict):
                    r = proj.get("role")
                    if r and isinstance(r, str) and r.strip():
                        roles.add(r.strip())

            # Education array items for year_of_passing
            for edu_item in parsed_data.get("education") or []:
                if isinstance(edu_item, dict):
                    yop = edu_item.get("year_of_passing")
                    if yop and isinstance(yop, (str, int)) and str(yop).strip():
                        year_of_passing.add(str(yop).strip())

            # Experience levels (check both parsed_data and ai_evaluation)
            if parsed_data.get("experience_level"):
                experience_levels.add(str(parsed_data["experience_level"]).strip())
            if ai_eval.get("experience_level"):
                experience_levels.add(str(ai_eval["experience_level"]).strip())

            # AI technical scores
            score = ai_eval.get("ai_technical_score")
            if score is not None and isinstance(score, (int, float)):
                ai_technical_scores.add(int(score))

            # Personality analysis
            p_analysis = ai_eval.get("personality_analysis")
            if p_analysis and isinstance(p_analysis, dict) and p_analysis not in personality_analysis_list:
                personality_analysis_list.append(p_analysis)

        return {
            "locations": sorted(list(locations)),
            "total_experience_years": sorted(list(total_experience_years)),
            "primary_skills": sorted(list(primary_skills)),
            "frameworks": sorted(list(frameworks)),
            "databases": sorted(list(databases)),
            "designations": sorted(list(designations)),
            "roles": sorted(list(roles)),
            "year_of_passing": sorted(list(year_of_passing)),
            "experience_levels": sorted(list(experience_levels)),
            "ai_technical_scores": sorted(list(ai_technical_scores)),
            "personality_analysis": personality_analysis_list,
        }