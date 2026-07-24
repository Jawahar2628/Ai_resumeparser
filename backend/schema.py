from typing import List, Optional
from pydantic import BaseModel, Field

class ExperienceItem(BaseModel):
    company: str = Field(description="Name of the company")
    designation: str = Field(description="Job title or designation")
    duration: str = Field(description="Duration of employment (e.g., Jan 2020 - Present)")
    responsibilities: Optional[str] = Field(description="Summary of responsibilities")

class EducationItem(BaseModel):
    degree: str = Field(description="Degree name (e.g., B.Tech, MCA)")
    specialization: Optional[str] = Field(description="Major or specialization")
    institution: str = Field(description="College or University name")
    year_of_passing: str = Field(description="Graduation year")
    score: Optional[str] = Field(description="Percentage or CGPA")

class CertificationItem(BaseModel):
    name: str = Field(description="Name of certification")
    issued_by: str = Field(description="Issuing organization")
    year: str = Field(description="Year of certification")

class ProjectItem(BaseModel):
    name: str = Field(description="Project name. Distinct from employment.")
    domain: Optional[str] = Field(description="Project domain (e.g., Banking, Healthcare)")
    duration: Optional[str] = Field(description="Duration of the project")
    role: Optional[str] = Field(description="Role played in the project")
    tech_stack: List[str] = Field(default_factory=list, description="Technologies used in the project")
    description: Optional[str] = Field(description="Brief description of the project")

class ResumeSchema(BaseModel):
    full_name: str = Field(description="Candidate's full name")
    email: str = Field(description="Candidate's email address")
    phone: str = Field(description="Candidate's phone number")
    location: Optional[str] = Field(description="Current location")
    linkedin: Optional[str] = Field(description="LinkedIn profile URL")
    total_experience_years: float = Field(default=0.0, description="Total years of experience extracted from resume")
    primary_skills: List[str] = Field(default_factory=list, description="Main technical skills")
    frameworks: List[str] = Field(default_factory=list, description="Frameworks known")
    databases: List[str] = Field(default_factory=list, description="Databases known")
    cloud_tech: List[str] = Field(default_factory=list, description="Cloud technologies (AWS, Azure, etc.)")
    experience: List[ExperienceItem] = Field(default_factory=list, description="List of past work experience. DO NOT INCLUDE ACADEMIC PROJECTS HERE.")
    projects: List[ProjectItem] = Field(default_factory=list, description="List of projects worked on. SEPARATE THESE FROM EXPERIENCE. Return empty list [] if none.")
    education: List[EducationItem] = Field(default_factory=list, description="List of educational qualifications")
    certifications: List[CertificationItem] = Field(default_factory=list, description="List of certifications ONLY if explicitly mentioned. Return empty list [] if none.")

class AIPersonalityScore(BaseModel):
    leadership: int = Field(default=0, description="Score 1-100 for leadership potential based on experience")
    team_player: int = Field(default=0, description="Score 1-100 for team collaboration")
    problem_solving: int = Field(default=0, description="Score 1-100 for problem solving ability")
    communication: int = Field(default=0, description="Score 1-100 for communication inference")

class CareerAnalysis(BaseModel):
    job_hopping_risk: str = Field(default="Unknown", description="Risk assessment: Low, Medium, High")
    career_stability: str = Field(default="Unknown", description="Overall stability inference")
    promotion_pattern: str = Field(default="Unknown", description="Any visible promotions in the same company?")
    recommended_upskilling: List[str] = Field(default_factory=list, description="Technologies the candidate should learn to grow")

class CandidateEvaluationSchema(BaseModel):
    experience_level: str = Field(default="Unknown", description="Classification: Fresher, Junior, Mid-Level, Senior, Architect")
    domain_expertise: List[str] = Field(default_factory=list, description="Top domains the candidate has worked in")
    ai_technical_score: int = Field(default=0, description="Overall technical strength score 1-100")
    skill_strengths: List[str] = Field(default_factory=list, description="Candidate's strongest skills")
    skill_weaknesses: List[str] = Field(default_factory=list, description="Candidate's weak areas compared to typical full stack roles")
    personality_analysis: AIPersonalityScore = Field(default_factory=AIPersonalityScore)
    career_analysis: CareerAnalysis = Field(default_factory=CareerAnalysis)
