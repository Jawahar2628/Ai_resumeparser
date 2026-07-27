import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Bell, Settings, Mail, Phone, MapPin, ChevronDown, CheckCircle2, ExternalLink, User, Award, Brain, Briefcase, GraduationCap, Code } from "lucide-react";
import { getResumeById } from "../utils/Api";

export default function Evaluation() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("Experience");

  useEffect(() => {
    if (id) {
      setLoading(true);
      setError(null);
      getResumeById(id)
        .then((data) => {
          setCandidate(data);
          setLoading(false);
        })
        .catch((e) => {
          console.error("Error fetching candidate evaluation:", e);
          setError("Failed to load candidate details from backend database.");
          setLoading(false);
        });
    } else {
      setLoading(false);
      setError("No candidate ID specified in route.");
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-slate-400 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span>Loading Candidate Profile...</span>
        </div>
      </div>
    );
  }

  if (error || !candidate) {
    return (
      <div className="bg-[#030514] text-slate-100 min-h-screen p-6 rounded-2xl space-y-6 font-sans">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 bg-[#030514] border border-slate-800 text-slate-300 px-4 py-1.5 rounded-xl text-xs font-bold hover:bg-slate-900 transition-colors shadow-sm cursor-pointer"
        >
          <ArrowLeft size={14} />
          Back
        </button>
        <div className="p-8 text-center text-red-400 bg-red-950/20 border border-red-900/40 rounded-2xl">
          {error || "Candidate profile record not found."}
        </div>
      </div>
    );
  }

  const navTabs = ["Experience", "Education", "Skills", "Projects", "Certifications", "Analysis", "Documents"];

  const parsed = candidate?.parsed_data || {};
  const evalData = candidate?.ai_evaluation || {};

  // Clean email formatting (remove accidental spaces e.g. "t h i n e s h...")
  const rawEmail = parsed.email || "N/A";
  const email = rawEmail !== "N/A" ? rawEmail.replace(/\s+/g, "") : "N/A";

  const name = parsed.full_name || parsed.name || candidate?.original_filename || "Candidate Record";
  const status = (candidate?.status || "PARSED").toUpperCase();
  const phone = parsed.phone || "N/A";
  const location = parsed.location || "N/A";
  const linkedin = parsed.linkedin || "";
  const github = parsed.github || "";
  const aiScore = evalData.ai_technical_score ?? 0;
  const expLevel = evalData.experience_level || "Not Specified";
  const scoreLabel = evalData.recommendation || (aiScore >= 80 ? "Highly Recommended Candidate" : aiScore >= 60 ? "Suitable Candidate" : "Needs Review");

  const totalExp = parsed.total_experience_years !== undefined && parsed.total_experience_years !== null
    ? `${parsed.total_experience_years} Years`
    : parsed.years_of_experience !== undefined
    ? `${parsed.years_of_experience} Years`
    : "N/A";

  // Combine primary_skills, frameworks, databases, cloud_tech into categorized skill matrix
  const primarySkills = parsed.primary_skills || [];
  const frameworks = parsed.frameworks || [];
  const databases = parsed.databases || [];
  const cloudTech = parsed.cloud_tech || [];
  const allSkills = [...new Set([...primarySkills, ...frameworks, ...databases, ...cloudTech, ...(parsed.skills || [])])];

  const s3Url = candidate?.s3_url || "";
  const experiences = parsed.experience || [];
  const education = parsed.education || [];
  const projects = parsed.projects || [];
  const certifications = parsed.certifications || [];
  
  const skillStrengths = evalData.skill_strengths || [];
  const skillWeaknesses = evalData.skill_weaknesses || [];
  const personality = evalData.personality_analysis || {};
  const careerAnalysis = evalData.career_analysis || {};

  return (
    <div className="bg-[#030514] text-slate-100 min-h-screen p-6 rounded-2xl space-y-6 font-sans">
      {/* Top Bar Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-slate-100">Candidate Profile</h1>
        </div>

        <div className="flex items-center gap-3">
          <button className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-900 rounded-lg transition-colors border border-slate-800">
            <Bell size={18} />
          </button>
          <button className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-900 rounded-lg transition-colors border border-slate-800">
            <Settings size={18} />
          </button>
        </div>
      </div>

      {/* Action Buttons Row */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 bg-[#030514] border border-slate-800 text-slate-300 px-4 py-1.5 rounded-xl text-xs font-bold hover:bg-slate-900 transition-colors shadow-sm cursor-pointer"
        >
          <ArrowLeft size={14} />
          Back
        </button>

        <div className="flex items-center gap-3">
          {s3Url && (
            <a
              href={s3Url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 bg-indigo-600/20 border border-indigo-500/40 text-indigo-300 px-4 py-1.5 rounded-xl text-xs font-bold hover:bg-indigo-600/30 transition-colors shadow-sm"
            >
              <ExternalLink size={14} />
              Open Original Resume
            </a>
          )}
          <button className="flex items-center gap-1.5 bg-[#030514] border border-slate-800 text-slate-300 px-4 py-1.5 rounded-xl text-xs font-bold hover:bg-slate-900 transition-colors shadow-sm">
            Actions
            <ChevronDown size={14} />
          </button>
        </div>
      </div>

      {/* Profile Overview Header Card & Score Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card (2 cols) */}
        <div className="lg:col-span-2 bg-[#030514] p-6 rounded-2xl border border-slate-800 shadow-sm flex flex-col sm:flex-row items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-slate-900 border-2 border-slate-700 flex items-center justify-center text-indigo-400 flex-shrink-0 shadow-sm">
            <User size={40} />
          </div>

          <div className="space-y-3 text-center sm:text-left flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
              <h2 className="text-xl font-extrabold text-slate-100">{name}</h2>
              <span className="bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                {status}
              </span>
              <span className="bg-indigo-950/60 border border-indigo-800/50 text-indigo-300 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                {expLevel} Level
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-6 gap-y-2 text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <Mail size={14} className="text-slate-400" />
                <span>{email}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Phone size={14} className="text-slate-400" />
                <span>{phone}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin size={14} className="text-slate-400" />
                <span>{location}</span>
              </div>
            </div>

            {(linkedin || github) && (
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-6 gap-y-2 text-xs">
                {linkedin && (
                  <a href={linkedin.startsWith("http") ? linkedin : `https://${linkedin}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-blue-400 font-semibold hover:underline">
                    <span className="bg-[#0a66c2] text-white w-3.5 h-3.5 rounded-xs flex items-center justify-center text-[9px] font-bold">in</span>
                    <span className="truncate max-w-[200px]">{linkedin}</span>
                  </a>
                )}
                {github && (
                  <a href={github.startsWith("http") ? github : `https://${github}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-blue-400 font-semibold hover:underline">
                    <svg className="w-3.5 h-3.5 fill-current text-slate-300" viewBox="0 0 24 24">
                      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                    </svg>
                    <span>{github}</span>
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        {/* AI Profile Score Card (1 col) */}
        <div className="bg-[#030514] p-6 rounded-2xl border border-slate-800 shadow-sm flex items-center justify-between">
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-100">AI Technical Score</h3>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-extrabold text-slate-100">{aiScore}</span>
              <span className="text-xs text-slate-400 font-semibold">/100</span>
            </div>
            <span className="text-xs font-bold text-emerald-400 block">{scoreLabel}</span>
          </div>

          {/* Gauge Ring Visual */}
          <div className="relative w-20 h-20 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-800"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-emerald-500 stroke-current"
                strokeWidth="3.5"
                strokeDasharray={`${aiScore}, 100`}
                strokeLinecap="round"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Metrics Row: Total Experience & Personality Trait Overview */}
      <div className="bg-[#030514] p-6 rounded-2xl border border-slate-800 shadow-sm grid grid-cols-2 sm:grid-cols-4 gap-6 divide-x divide-slate-800">
        <div className="space-y-1">
          <span className="text-xs font-semibold text-slate-400">Total Experience</span>
          <div className="text-base font-extrabold text-slate-100">{totalExp}</div>
        </div>

        <div className="pl-6 space-y-1">
          <span className="text-xs font-semibold text-slate-400">Leadership Score</span>
          <div className="text-base font-extrabold text-indigo-400">{personality.leadership ? `${personality.leadership}%` : "N/A"}</div>
        </div>

        <div className="pl-6 space-y-1">
          <span className="text-xs font-semibold text-slate-400">Team Player</span>
          <div className="text-base font-extrabold text-emerald-400">{personality.team_player ? `${personality.team_player}%` : "N/A"}</div>
        </div>

        <div className="pl-6 space-y-1">
          <span className="text-xs font-semibold text-slate-400">Job Hopping Risk</span>
          <div className="text-base font-extrabold text-slate-100">{careerAnalysis.job_hopping_risk || "N/A"}</div>
        </div>
      </div>

      {/* Content Tabs Wrapper */}
      <div className="bg-[#030514] rounded-2xl p-6 border border-slate-800 shadow-sm space-y-6">
        {/* Navigation Tabs Header */}
        <div className="flex items-center gap-6 border-b border-slate-800 pb-4 overflow-x-auto">
          {navTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-xs font-bold transition-colors whitespace-nowrap relative pb-4 -mb-4 cursor-pointer ${
                activeTab === tab ? "text-blue-400" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {tab}
              {activeTab === tab && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-full"></span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content Section */}
        {activeTab === "Experience" && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Briefcase size={16} className="text-indigo-400" /> Work Experience
            </h3>
            {experiences.length > 0 ? (
              <div className="space-y-4">
                {experiences.map((exp: any, idx: number) => (
                  <div key={idx} className="p-4 rounded-xl border border-slate-800 bg-[#030514] space-y-2">
                    <div className="flex flex-wrap justify-between items-center">
                      <h4 className="text-xs font-bold text-slate-100">
                        {exp.designation || "Role"} - <span className="text-blue-400">{exp.company}</span>
                      </h4>
                      <span className="text-[11px] text-slate-400 font-medium">{exp.duration || "N/A"}</span>
                    </div>
                    {exp.responsibilities && (
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {Array.isArray(exp.responsibilities) ? exp.responsibilities.join(" ") : exp.responsibilities}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-slate-400">No work experience entries parsed.</div>
            )}
          </div>
        )}

        {activeTab === "Education" && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <GraduationCap size={16} className="text-indigo-400" /> Education Details
            </h3>
            {education.length > 0 ? (
              education.map((edu: any, idx: number) => (
                <div key={idx} className="p-4 rounded-xl border border-slate-800 bg-[#030514] flex justify-between items-center text-xs">
                  <div>
                    <h4 className="font-bold text-slate-100">{edu.degree}</h4>
                    <p className="text-slate-400">{edu.institution}</p>
                    {edu.score && <p className="text-[11px] text-emerald-400 mt-0.5">Score / CGPA: {edu.score}</p>}
                  </div>
                  <span className="text-slate-400 font-medium">{edu.year_of_passing || edu.year}</span>
                </div>
              ))
            ) : (
              <div className="text-xs text-slate-400">No education entries parsed.</div>
            )}
          </div>
        )}

        {activeTab === "Skills" && (
          <div className="space-y-5">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Code size={16} className="text-indigo-400" /> Extracted Technical & Domain Skills
            </h3>

            {primarySkills.length > 0 && (
              <div>
                <span className="text-xs text-slate-400 block mb-2 font-semibold">Primary Roles / Skills</span>
                <div className="flex flex-wrap gap-2">
                  {primarySkills.map((s: string, i: number) => (
                    <span key={i} className="bg-indigo-950/70 border border-indigo-800/60 text-indigo-300 text-xs px-3 py-1.5 rounded-lg font-semibold">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {databases.length > 0 && (
              <div>
                <span className="text-xs text-slate-400 block mb-2 font-semibold font-mono">Databases</span>
                <div className="flex flex-wrap gap-2">
                  {databases.map((s: string, i: number) => (
                    <span key={i} className="bg-emerald-950/70 border border-emerald-800/60 text-emerald-300 text-xs px-3 py-1.5 rounded-lg font-semibold">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {allSkills.length > 0 ? (
              <div>
                <span className="text-xs text-slate-400 block mb-2 font-semibold">All Skills</span>
                <div className="flex flex-wrap gap-2">
                  {allSkills.map((skill: string, idx: number) => (
                    <span key={idx} className="bg-slate-900 border border-slate-800 text-slate-200 text-xs px-3 py-1.5 rounded-lg font-semibold">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-400">No skills parsed.</div>
            )}
          </div>
        )}

        {activeTab === "Projects" && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Award size={16} className="text-indigo-400" /> Key Projects
            </h3>
            {projects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {projects.map((proj: any, idx: number) => (
                  <div key={idx} className="p-4 rounded-xl border border-slate-800 bg-[#030514] space-y-2">
                    <div className="flex justify-between items-start">
                      <h4 className="text-xs font-bold text-slate-100">{proj.name}</h4>
                      {proj.role && <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded">{proj.role}</span>}
                    </div>
                    {proj.description && <p className="text-xs text-slate-300 leading-relaxed">{proj.description}</p>}
                    {proj.tech_stack && Array.isArray(proj.tech_stack) && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {proj.tech_stack.map((t: string, ti: number) => (
                          <span key={ti} className="text-[10px] bg-indigo-950/60 border border-indigo-900/40 text-indigo-300 px-2 py-0.5 rounded">
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-slate-400">No projects parsed.</div>
            )}
          </div>
        )}

        {activeTab === "Certifications" && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-100">Certifications</h3>
            {certifications.length > 0 ? (
              <ul className="space-y-2 text-xs text-slate-300">
                {certifications.map((cert: string, idx: number) => (
                  <li key={idx} className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-emerald-400" />
                    <span>{cert}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-xs text-slate-400">No certifications listed.</div>
            )}
          </div>
        )}

        {activeTab === "Analysis" && (
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Brain size={16} className="text-indigo-400" /> AI Evaluation & Personality Analysis
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/40 space-y-2">
                <h4 className="text-xs font-bold text-emerald-400">Skill Strengths</h4>
                {skillStrengths.length > 0 ? (
                  <ul className="space-y-1 text-xs text-emerald-300">
                    {skillStrengths.map((s: string, i: number) => (
                      <li key={i}>• {s}</li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-xs text-slate-400 font-normal">No specific strengths flagged.</div>
                )}
              </div>

              <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-800/40 space-y-2">
                <h4 className="text-xs font-bold text-rose-400">Skill Weaknesses</h4>
                {skillWeaknesses.length > 0 ? (
                  <ul className="space-y-1 text-xs text-rose-300">
                    {skillWeaknesses.map((w: string, i: number) => (
                      <li key={i}>• {w}</li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-xs text-slate-400 font-normal">No major weaknesses flagged.</div>
                )}
              </div>

              <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-800/40 space-y-2">
                <h4 className="text-xs font-bold text-amber-400">Recommended Upskilling</h4>
                {careerAnalysis.recommended_upskilling && Array.isArray(careerAnalysis.recommended_upskilling) ? (
                  <ul className="space-y-1 text-xs text-amber-300">
                    {careerAnalysis.recommended_upskilling.map((g: string, i: number) => (
                      <li key={i}>• {g}</li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-xs text-slate-400 font-normal">No upskilling recommendations.</div>
                )}
              </div>
            </div>

            {/* Personality Analysis Breakdown */}
            {personality && Object.keys(personality).length > 0 && (
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-slate-200">Personality Trait Score Ratings</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  {Object.entries(personality).map(([key, val]: [string, any]) => (
                    <div key={key} className="space-y-1">
                      <span className="text-slate-400 capitalize">{key.replace("_", " ")}</span>
                      <div className="text-sm font-extrabold text-indigo-400">{val}%</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "Documents" && (
          <div className="space-y-4 text-xs">
            <h3 className="text-sm font-bold text-slate-100">Original Resume Document</h3>
            {s3Url ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <span className="text-slate-300">{candidate?.original_filename || "Resume Document"}</span>
                  <a
                    href={s3Url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-indigo-400 hover:text-indigo-300 font-semibold underline flex items-center gap-1"
                  >
                    <ExternalLink size={14} /> Open Document
                  </a>
                </div>
                <iframe
                  src={s3Url}
                  className="w-full h-[600px] rounded-xl border border-slate-800"
                  title="Resume Viewer"
                />
              </div>
            ) : (
              <p className="text-slate-400">No S3 document URL available for this record.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
