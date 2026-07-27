"""
Resume repository for MongoDB database queries regarding Resume entities.
"""

from typing import Any, Dict, List, Optional
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.repositories.base_repository import BaseRepository
from app.utils.constants import RESUMES_COLLECTION
from app.utils.enums import ResumeStatus
from typing import Any, Dict, List


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
    ) -> List[Dict[str, Any]]:
        """Filter resumes based on multiple criteria matching parsed_data fields."""
        import re

        and_conditions: List[Dict[str, Any]] = [{"user_id": user_id}]

        if job_title and job_title.strip():
            # Split job title search term to match words individually or full phrase
            jt_clean = job_title.strip()
            jt_regex = re.compile(re.escape(jt_clean), re.IGNORECASE)
            
            # Match across designation, role, experience entries, primary_skills, or extracted_text fallback
            and_conditions.append({
                "$or": [
                    {"parsed_data.designation": {"$regex": jt_regex}},
                    {"parsed_data.role": {"$regex": jt_regex}},
                    {"parsed_data.name": {"$regex": jt_regex}},
                    {"parsed_data.full_name": {"$regex": jt_regex}},
                    {"parsed_data.experience.designation": {"$regex": jt_regex}},
                    {"parsed_data.experience.company": {"$regex": jt_regex}},
                    {"parsed_data.primary_skills": {"$regex": jt_regex}},
                    {"extracted_text": {"$regex": jt_regex}},
                ]
            })

        if min_experience is not None or max_experience is not None:
            exp_query: Dict[str, Any] = {}
            if min_experience is not None:
                exp_query["$gte"] = min_experience
            if max_experience is not None:
                exp_query["$lte"] = max_experience
            
            and_conditions.append({
                "$or": [
                    {"parsed_data.total_experience_years": exp_query},
                    {"parsed_data.years_of_experience": exp_query},
                ]
            })

        if location and location.strip():
            loc_regex = re.compile(re.escape(location.strip()), re.IGNORECASE)
            and_conditions.append({
                "$or": [
                    {"parsed_data.location": {"$regex": loc_regex}},
                    {"extracted_text": {"$regex": loc_regex}},
                ]
            })

        if employment_type and employment_type.strip():
            emp_clean = employment_type.strip()
            # Handle common variations like "Full Time", "Full-Time", "Fulltime"
            emp_pattern = re.escape(emp_clean).replace(r"\ ", r"[\s\-_]*")
            emp_regex = re.compile(emp_pattern, re.IGNORECASE)

            and_conditions.append({
                "$or": [
                    {"parsed_data.employment_type": {"$regex": emp_regex}},
                    {"parsed_data.job_type": {"$regex": emp_regex}},
                    {"extracted_text": {"$regex": emp_regex}},
                ]
            })

        if year_of_passing and year_of_passing.strip():
            yop_regex = re.compile(re.escape(year_of_passing.strip()), re.IGNORECASE)
            and_conditions.append({
                "$or": [
                    {"parsed_data.education.year_of_passing": {"$regex": yop_regex}},
                    {"parsed_data.education.year": {"$regex": yop_regex}},
                    {"extracted_text": {"$regex": yop_regex}},
                ]
            })

        if skills:
            skill_queries = []
            for s in skills:
                if s and s.strip():
                    s_regex = re.compile(re.escape(s.strip()), re.IGNORECASE)
                    skill_queries.append({
                        "$or": [
                            {"parsed_data.skills": {"$regex": s_regex}},
                            {"parsed_data.primary_skills": {"$regex": s_regex}},
                            {"parsed_data.frameworks": {"$regex": s_regex}},
                            {"parsed_data.databases": {"$regex": s_regex}},
                            {"parsed_data.cloud_tech": {"$regex": s_regex}},
                        ]
                    })
            if skill_queries:
                and_conditions.append({"$or": skill_queries})

        from loguru import logger
        logger.info(f"[FILTER_RESUMES] Params received -> user_id: {user_id}, job_title: {job_title}, min_exp: {min_experience}, max_exp: {max_experience}, location: {location}, emp_type: {employment_type}, skills: {skills}")

        final_query = {"$and": and_conditions} if len(and_conditions) > 1 else and_conditions[0]
        logger.info(f"[FILTER_RESUMES] Compiled MongoDB query: {final_query}")

        results = await self.find_many(query=final_query, skip=skip, limit=limit, sort_by="upload_date", descending=True)
        logger.info(f"[FILTER_RESUMES] Returned {len(results)} matching resume document(s)")
        return results

    async def find_by_user_and_filename(self, user_id: str, original_filename: str) -> Optional[Dict[str, Any]]:
        """Check if user has already uploaded a file with the same original filename."""
        return await self.find_one({"user_id": user_id, "original_filename": original_filename})

    async def update_status_and_text(self, resume_id: str, status: ResumeStatus, extracted_text: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """Update resume extraction status and extracted text content."""
        update_fields: Dict[str, Any] = {"status": status.value}
        if extracted_text is not None:
            update_fields["extracted_text"] = extracted_text
        return await self.update(resume_id, update_fields)

    async def get_parsed_resume_summary(
        self,
        user_id: str,
        skip: int = 0,
        limit: int = 100,
    ) -> List[Dict[str, Any]]:
        """
        Return only required parsed resume fields where status is PARSED.
        """
        query = {
            "user_id": user_id,
            "status": ResumeStatus.PARSED.value,
        }

        projection = {
            "_id": 0,
            "id": 1,
            "original_filename": 1,
            "upload_date": 1,
            "status": 1,
            "parsed_data.location": 1,
            "parsed_data.total_experience_years": 1,
            "parsed_data.primary_skills": 1,
            "parsed_data.frameworks": 1,
            "parsed_data.databases": 1,
            "parsed_data.designation": 1,
            "parsed_data.role": 1,
            "parsed_data.experience": 1,
            "parsed_data.projects": 1,
            "parsed_data.education": 1,
            "parsed_data.experience_level": 1,
            "ai_evaluation.experience_level": 1,
            "ai_evaluation.ai_technical_score": 1,
            "ai_evaluation.personality_analysis": 1,
        }

        cursor = (
            self.collection
            .find(query, projection)
            .sort("upload_date", -1)
            .skip(skip)
            .limit(limit)
        )

        return await cursor.to_list(length=limit)