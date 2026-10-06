import re
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone, timedelta
from app.core.database import get_database
from app.utils.constants import RESUMES_COLLECTION, INTERVIEWS_COLLECTION, RESUME_LOGS_COLLECTION
from app.utils.enums import ResumeStatus, InterviewStatus

# Specialization categories for the Domain Specialization chart. Each entry is
# (name, color, title pattern, skill pattern). Titles (specialization, role,
# designation) are matched first; skills are only used when no title matches.
DOMAIN_CATEGORIES = [
    ("QA & Testing", "#f59e0b",
     r"\bqa\b|quality|\btest|\bsdet\b|automation",
     r"selenium|testng|junit|cucumber|jmeter|appium|cypress|playwright|\btest|\bqa\b|\buat\b"),
    ("Data, AI & Analytics", "#8b5cf6",
     r"data|\betl\b|analytics|business intelligence|\b(bi|ai|ml|dba)\b|machine learning|snowflake|databricks|big ?data",
     r"spark|snowflake|databricks|power ?bi|tableau|\betl\b|data|hadoop|airflow|kafka|\bdbt\b|machine learning|\bssis\b|informatica"),
    ("Cloud & DevOps", "#14b8a6",
     r"devops|cloud|\bsre\b|reliability|platform engineer|kubernetes",
     r"docker|kubernetes|jenkins|terraform|ansible|ci/cd|helm|grafana|prometheus|devops|cloudformation|\b(aws|azure|gcp)\b"),
    ("UI/UX Design", "#ec4899",
     r"\b(ux|ui)\b|designer|user experience",
     r"figma|wirefram|prototyp|\b(ux|ui)\b|usability|adobe xd|user research"),
    ("Project & Product Management", "#f97316",
     r"project manag|program manag|product manag|product owner|delivery|scrum|agile coach|manager|\bpmo\b",
     r"project management|scrum|agile|\bpmp\b|waterfall|risk management|budget|roadmap|sprint planning"),
    ("Business Analysis", "#3b82f6",
     r"business (systems? )?analyst|\bbsa\b|systems? analyst|functional (analyst|consultant)",
     r"business analysis|requirement|stakeholder|\b(brd|frd)\b|user stories|process mapping|gap analysis"),
    ("IT Support & Security", "#10b981",
     r"support|administrator|\bsys(tems?)? ?admin|technician|security|help ?desk|network|\bit systems\b",
     r"\bitil\b|servicenow|active directory|troubleshoot|help ?desk|networking|firewall|\bsiem\b|windows server"),
    ("Software Development", "#6366f1",
     r"software|developer|full.?stack|front.?end|back.?end|programmer|\bjava\b|\.net|\bweb\b|mobile|mainframe",
     r"\bjava\b|javascript|typescript|react|angular|spring|node|c#|\.net|html|css|php|django|flask|microservices|kotlin|swift"),
]
DOMAIN_OTHER = ("Others", "#94a3b8")
DOMAIN_NOT_SPECIFIED = ("Not Specified", "#cbd5e1")
_DOMAIN_COLORS = {name: color for name, color, _, _ in DOMAIN_CATEGORIES} | dict([DOMAIN_OTHER, DOMAIN_NOT_SPECIFIED])
_DOMAIN_TITLE_PATTERNS = [(name, re.compile(title)) for name, _, title, _ in DOMAIN_CATEGORIES]
_DOMAIN_SKILL_PATTERNS = [(name, re.compile(skill)) for name, _, _, skill in DOMAIN_CATEGORIES]
_DOMAIN_SKILL_FIELDS = (
    "primary_skills", "programming_languages", "frameworks", "databases",
    "cloud_tech", "devops_and_infrastructure", "other_technologies",
)


def _match_title(text: Any) -> Optional[str]:
    """Return the category whose keyword appears earliest in a role/specialization title."""
    text = str(text).strip().lower() if text else ""
    best = None
    for name, pattern in _DOMAIN_TITLE_PATTERNS:
        match = pattern.search(text)
        if match and (best is None or match.start() < best[0]):
            best = (match.start(), name)
    return best[1] if best else None


def categorize_domain(parsed_data: Any) -> str:
    """Map a resume's parsed data to one of the dashboard specialization categories."""
    if not isinstance(parsed_data, dict) or not parsed_data:
        return DOMAIN_NOT_SPECIFIED[0]

    designations = [
        e.get("designation") for e in (parsed_data.get("experience") or []) if isinstance(e, dict)
    ]
    # Most specific signal first; older designations are a last resort before skills
    titles = [
        parsed_data.get("specialization"),
        parsed_data.get("current_role"),
        *designations[:1],
        parsed_data.get("primary_domain"),
        *designations[1:],
    ]
    for title in titles:
        category = _match_title(title)
        if category:
            return category

    skills = [
        str(skill).lower()
        for field in _DOMAIN_SKILL_FIELDS
        for skill in (parsed_data.get(field) or [])
    ]
    scores = [(sum(1 for skill in skills if pattern.search(skill)), name) for name, pattern in _DOMAIN_SKILL_PATTERNS]
    best_score = max(score for score, _ in scores)
    if best_score > 0:
        return next(name for score, name in scores if score == best_score)
    return DOMAIN_OTHER[0]


# Seniority levels for the Seniority Distribution chart, in the parser's vocabulary.
SENIORITY_LEVELS = {
    "Junior": "#10b981",
    "Mid": "#f59e0b",
    "Senior": "#3b82f6",
    "Lead / Architect": "#8b5cf6",
    "Not Specified": "#cbd5e1",
}
_SENIORITY_LABEL_PATTERNS = [
    ("Lead / Architect", re.compile(r"lead|principal|architect|manager|head|director|staff")),
    ("Senior", re.compile(r"senior|\bsr\b")),
    ("Mid", re.compile(r"mid|intermediate")),
    ("Junior", re.compile(r"junior|\bjr\b|fresher|entry|trainee|intern|graduate")),
]
_LEAD_TITLE_PATTERN = re.compile(r"\blead\b|principal|architect|manager|\bhead\b|director")
_NON_LEAD_TITLE_PATTERN = re.compile(r"assistant|associate|trainee|intern")


def categorize_seniority(parsed_data: Any, experience_level: Any = None) -> str:
    """Map a resume to a seniority level, inferring it when the parser did not set one."""
    if not isinstance(parsed_data, dict) or not parsed_data:
        return "Not Specified"

    # Explicit level from the parser, then from the AI evaluation
    for label in (parsed_data.get("seniority"), experience_level):
        text = str(label).strip().lower() if label else ""
        for level, pattern in _SENIORITY_LABEL_PATTERNS:
            if pattern.search(text):
                return level

    # Otherwise infer: a lead/manager title wins, then years of experience
    experience = [e for e in (parsed_data.get("experience") or []) if isinstance(e, dict)]
    title = str(parsed_data.get("current_role") or (experience[0].get("designation") if experience else "") or "").lower()
    if _LEAD_TITLE_PATTERN.search(title) and not _NON_LEAD_TITLE_PATTERN.search(title):
        return "Lead / Architect"

    try:
        years = float(parsed_data.get("total_experience_years"))
    except (TypeError, ValueError):
        years = 0.0
    if years >= 5:
        return "Senior"
    if years >= 2:
        return "Mid"
    if years > 0:
        return "Junior"
    for level, pattern in _SENIORITY_LABEL_PATTERNS[1:]:
        if pattern.search(title):
            return level
    return "Not Specified"


class DashboardService:
    async def get_dashboard_metrics(self) -> Dict[str, Any]:
        db = get_database()
        resumes_coll = db[RESUMES_COLLECTION]
        interviews_coll = db[INTERVIEWS_COLLECTION]
        logs_coll = db[RESUME_LOGS_COLLECTION]

        # 1. Stats
        total_resumes = await resumes_coll.count_documents({"$or": [{"redirect_id": None}, {"redirect_id": {"$exists": False}}]})
        
        # Resumes created today (UTC)
        today = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
        today_iso = today.isoformat()
        ai_parsed_today = await resumes_coll.count_documents({
            "upload_date": {"$gte": today_iso},
            "$or": [{"redirect_id": None}, {"redirect_id": {"$exists": False}}]
        })
        
        jd_matches = await logs_coll.count_documents({"action": "evaluation_generated"})
        total_interviews = await interviews_coll.count_documents({})
        total_offers = await resumes_coll.count_documents({"status": "OFFERED", "$or": [{"redirect_id": None}, {"redirect_id": {"$exists": False}}]})
        
        stats = [
            {"label": "Total Resumes", "value": str(total_resumes), "change": "", "changeColor": "text-slate-400"},
            {"label": "AI Parsed Today", "value": str(ai_parsed_today), "change": "", "changeColor": "text-slate-400"},
            {"label": "JD Matches", "value": str(jd_matches), "change": "", "changeColor": "text-slate-400"},
            {"label": "Interviews", "value": str(total_interviews), "change": "", "changeColor": "text-slate-400"},
            {"label": "Offers", "value": str(total_offers), "change": "", "changeColor": "text-slate-400"},
        ]

        # 2. Pipeline and Status Counts
        new_count = await resumes_coll.count_documents({"status": "NEW", "$or": [{"redirect_id": None}, {"redirect_id": {"$exists": False}}]})
        shortlisted_count = await resumes_coll.count_documents({"status": "SHORTLISTED", "$or": [{"redirect_id": None}, {"redirect_id": {"$exists": False}}]})
        interview_count = await resumes_coll.count_documents({"status": "INTERVIEW", "$or": [{"redirect_id": None}, {"redirect_id": {"$exists": False}}]})
        client_interview_count = await resumes_coll.count_documents({"status": "CLIENT_INTERVIEW", "$or": [{"redirect_id": None}, {"redirect_id": {"$exists": False}}]})
        offered_count = total_offers

        total_status_count = new_count + shortlisted_count + interview_count + client_interview_count + offered_count
        
        def calc_pct(count):
            return f"{round((count / total_status_count) * 100) if total_status_count > 0 else 0}%"

        pipelineData = [
            {"stage": "Resumes Uploaded", "count": str(total_resumes), "width": "100%", "bg": "bg-blue-600"},
            {"stage": "Shortlisted", "count": str(shortlisted_count), "width": calc_pct(shortlisted_count), "bg": "bg-sky-500"},
            {"stage": "Interviews", "count": str(interview_count), "width": calc_pct(interview_count), "bg": "bg-emerald-400"},
            {"stage": "Client Interviews", "count": str(client_interview_count), "width": calc_pct(client_interview_count), "bg": "bg-emerald-600"},
            {"stage": "Offers", "count": str(offered_count), "width": calc_pct(offered_count), "bg": "bg-emerald-200"},
        ]

        statusData = [
            {"name": "New", "percentage": calc_pct(new_count), "count": new_count, "color": "#2563eb"},
            {"name": "Shortlisted", "percentage": calc_pct(shortlisted_count), "count": shortlisted_count, "color": "#06b6d4"},
            {"name": "Interview", "percentage": calc_pct(interview_count), "count": interview_count, "color": "#34d399"},
            {"name": "Client Interview", "percentage": calc_pct(client_interview_count), "count": client_interview_count, "color": "#f59e0b"},
            {"name": "Offered", "percentage": calc_pct(offered_count), "count": offered_count, "color": "#64748b"},
        ]

        # 3. Recent Activities
        logs_cursor = logs_coll.find({}).sort("created_at", -1).limit(5)
        recent_logs = await logs_cursor.to_list(length=5)
        
        recentActivities = []
        for log in recent_logs:
            title = log.get("action", "Activity").replace("_", " ").title()
            icon_type = "file"
            if "eval" in title.lower():
                icon_type = "sparkles"
            elif "interview" in title.lower():
                icon_type = "video"
            elif "status" in title.lower() or "update" in title.lower():
                icon_type = "check"
                
            time_str = log.get("created_at", "")
            if time_str:
                try:
                    dt = datetime.fromisoformat(time_str.replace('Z', '+00:00'))
                    diff = datetime.now(timezone.utc) - dt
                    if diff.days > 0:
                        time_str = f"{diff.days} days ago"
                    elif diff.seconds > 3600:
                        time_str = f"{diff.seconds // 3600} hours ago"
                    elif diff.seconds > 60:
                        time_str = f"{diff.seconds // 60} mins ago"
                    else:
                        time_str = "Just now"
                except Exception:
                    pass

            details = log.get("details", "")
            if not details and log.get("email"):
                details = f"for {log.get('email')}"
            
            display_title = f"{title} - {details}".strip(" -")
            
            recentActivities.append({
                "title": display_title[:60],
                "time": time_str,
                "icon_type": icon_type,
                "bg": "bg-slate-800"
            })

        # 4. Upcoming Interviews
        now_iso = datetime.now(timezone.utc).isoformat()
        interviews_cursor = interviews_coll.find({
            "scheduled_date": {"$gte": today_iso[:10]},
            "status": InterviewStatus.SCHEDULED.value
        }).sort([("scheduled_date", 1), ("scheduled_time", 1)]).limit(5)
        upcoming_db = await interviews_cursor.to_list(length=5)
        
        upcomingInterviews = []
        for inv in upcoming_db:
            upcomingInterviews.append({
                "time": f"{inv.get('scheduled_date', '')} {inv.get('scheduled_time', '')}".strip(),
                "role": inv.get("job_title", "Interview"),
                "candidate": inv.get("candidate_name", "Unknown")
            })

        # 5 & 6. Seniority and Domain Distribution
        # Both are derived per resume (older records lack the parser's seniority and
        # domain fields), so fetch only the fields the categorizers read.
        profile_fields = [
            "seniority", "total_experience_years", "specialization", "current_role",
            "primary_domain", "experience.designation", *_DOMAIN_SKILL_FIELDS,
        ]
        profile_cursor = resumes_coll.find(
            {"$or": [{"redirect_id": None}, {"redirect_id": {"$exists": False}}]},
            {"_id": 0, "ai_evaluation.experience_level": 1, **{f"parsed_data.{field}": 1 for field in profile_fields}},
        )

        seniority_counts: Dict[str, int] = {}
        category_counts: Dict[str, int] = {}
        async for resume in profile_cursor:
            parsed_data = resume.get("parsed_data")
            level = categorize_seniority(parsed_data, (resume.get("ai_evaluation") or {}).get("experience_level"))
            seniority_counts[level] = seniority_counts.get(level, 0) + 1
            category = categorize_domain(parsed_data)
            category_counts[category] = category_counts.get(category, 0) + 1

        def to_distribution(counts: Dict[str, int], colors: Dict[str, str]) -> List[Dict[str, Any]]:
            # Highest count first
            return [
                {
                    "name": name,
                    "percentage": f"{round((count / total_resumes) * 100) if total_resumes > 0 else 0}%",
                    "count": count,
                    "color": colors[name],
                }
                for name, count in sorted(counts.items(), key=lambda item: (-item[1], item[0]))
            ]

        seniorityDistribution = to_distribution(seniority_counts, SENIORITY_LEVELS)
        domainDistribution = to_distribution(category_counts, _DOMAIN_COLORS)

        return {
            "stats": stats,
            "pipelineData": pipelineData,
            "statusData": statusData,
            "recentActivities": recentActivities,
            "upcomingInterviews": upcomingInterviews,
            "seniorityDistribution": seniorityDistribution,
            "domainDistribution": domainDistribution
        }
