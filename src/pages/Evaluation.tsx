import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Bell, Settings, Mail, Phone, MapPin, ChevronDown, CheckCircle2 } from "lucide-react";

export default function Evaluation() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Summary");

  useEffect(() => {
    if (id) {
      fetch(`http://127.0.0.1:8000/api/candidates/${id}`)
        .then(res => res.json())
        .then(data => {
          setCandidate(data);
          setLoading(false);
        })
        .catch(e => {
          console.error(e);
          setLoading(false);
        });
    } else {
      // Mock data for display when no specific ID is provided
      setCandidate({
        full_name: "Vijay",
        status: "Shortlisted",
        email: "vijay@gmail.com",
        phone: "+91 98456 78901",
        location: "Chennai, India",
        linkedin: "linkedin.com/in/vijaykumar",
        github: "github.com/vijaykumar",
        ai_score: 86,
        score_label: "Very Good Candidate",
        total_experience: "8.2 Years",
        relevant_experience: "7.5 Years",
        current_ctc: "12 LPA",
        expected_ctc: "18 LPA",
        notice_period: "30 Days",
        summary: "8+ years of experience in Java development with strong expertise in Spring Boot, Microservices, REST APIs and Cloud technologies. Proven track record in designing and delivering scalable enterprise applications.",
        skills: ["Java", "Spring Boot", "Microservices", "REST API", "SQL", "AWS", "Kafka", "Docker", "Jenkins", "Git"],
        experiences: [
          { role: "Senior Java Developer", company: "TechCorp Solutions", duration: "2021 - Present", desc: "Led microservices architecture redesign, improving system throughput by 40%." },
          { role: "Java Software Engineer", company: "DataSoft Inc.", duration: "2018 - 2021", desc: "Developed RESTful web services using Spring Boot and Hibernate." }
        ],
        education: [
          { degree: "B.Tech in Computer Science", institution: "Anna University", year: "2014 - 2018" }
        ],
        projects: [
          { name: "E-Commerce Payment Gateway", desc: "Integrated multi-vendor payment solution processing 1M+ daily transactions." }
        ],
        certifications: ["AWS Certified Solutions Architect", "Oracle Certified Professional Java SE 11"],
        analysis: {
          strengths: ["Strong backend architecture knowledge", "Extensive experience with distributed messaging (Kafka)", "Clean code enthusiast"],
          gaps: ["Limited frontend framework experience"]
        }
      });
      setLoading(false);
    }
  }, [id]);

  if (loading) {
    return <div className="text-white p-8 bg-[#030514] min-h-screen">Loading Candidate Profile...</div>;
  }

  const navTabs = ["Summary", "Experience", "Education", "Skills", "Projects", "Certifications", "Analysis", "Documents"];

  const parsed = candidate?.parsed_resume || {};
  const evalData = candidate?.evaluation || {};

  const name = candidate?.full_name || parsed.name || "Vijay Kumar";
  const status = candidate?.status || "Shortlisted";
  const email = candidate?.email || parsed.email || "vijay@gmail.com";
  const phone = candidate?.phone || parsed.phone || "+91 98456 78901";
  const location = candidate?.location || parsed.location || "Chennai, India";
  const linkedin = candidate?.linkedin || parsed.linkedin || "linkedin.com/in/vijaykumar";
  const github = candidate?.github || parsed.github || "github.com/vijaykumar";
  const aiScore = candidate?.ai_score || evalData.ai_technical_score || 86;
  const scoreLabel = candidate?.score_label || (aiScore >= 80 ? "Very Good Candidate" : "Good Candidate");

  const totalExp = candidate?.total_experience || (parsed.years_of_experience ? `${parsed.years_of_experience} Years` : "8.2 Years");
  const relExp = candidate?.relevant_experience || "7.5 Years";
  const currCtc = candidate?.current_ctc || "12 LPA";
  const expCtc = candidate?.expected_ctc || "18 LPA";
  const noticePeriod = candidate?.notice_period || "30 Days";

  const summaryText = candidate?.summary || parsed.summary || "8+ years of experience in Java development with strong expertise in Spring Boot, Microservices, REST APIs and Cloud technologies. Proven track record in designing and delivering scalable enterprise applications.";
  const skillsList = candidate?.skills || parsed.skills || ["Java", "Spring Boot", "Microservices", "REST API", "SQL", "AWS", "Kafka", "Docker", "Jenkins", "Git"];

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
          className="flex items-center gap-1.5 bg-[#030514] border border-slate-800 text-slate-300 px-4 py-1.5 rounded-xl text-xs font-bold hover:bg-slate-900 transition-colors shadow-sm"
        >
          <ArrowLeft size={14} />
          Back
        </button>

        <div className="flex items-center gap-3">
          <button className="bg-[#030514] border border-blue-500 text-blue-400 px-4 py-1.5 rounded-xl text-xs font-bold hover:bg-blue-950/30 transition-colors shadow-sm">
            Edit Profile
          </button>
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
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80"
            alt={name}
            className="w-24 h-24 rounded-full object-cover border-2 border-slate-700 flex-shrink-0 shadow-sm"
          />

          <div className="space-y-3 text-center sm:text-left flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
              <h2 className="text-xl font-extrabold text-slate-100">{name}</h2>
              <span className="bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                {status}
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

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-6 gap-y-2 text-xs">
              <a href={`https://${linkedin}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-blue-400 font-semibold hover:underline">
                <span className="bg-[#0a66c2] text-white w-3.5 h-3.5 rounded-xs flex items-center justify-center text-[9px] font-bold">in</span>
                <span>{linkedin}</span>
              </a>
              <a href={`https://${github}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-blue-400 font-semibold hover:underline">
                <svg className="w-3.5 h-3.5 fill-current text-slate-300" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
                <span>{github}</span>
              </a>
            </div>
          </div>
        </div>

        {/* AI Profile Score Card (1 col) */}
        <div className="bg-[#030514] p-6 rounded-2xl border border-slate-800 shadow-sm flex items-center justify-between">
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-100">AI Profile Score</h3>
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
            <div className="absolute text-slate-400">
              <span className="text-xs">⨝</span>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Row: Experience & CTC Cards */}
      <div className="bg-[#030514] p-6 rounded-2xl border border-slate-800 shadow-sm grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 divide-x divide-slate-800">
        <div className="space-y-1">
          <span className="text-xs font-semibold text-slate-400">Total Experience</span>
          <div className="text-base font-extrabold text-slate-100">{totalExp}</div>
        </div>

        <div className="pl-6 space-y-1">
          <span className="text-xs font-semibold text-slate-400">Relevant Experience</span>
          <div className="text-base font-extrabold text-slate-100">{relExp}</div>
        </div>

        <div className="pl-6 space-y-1">
          <span className="text-xs font-semibold text-slate-400">Current CTC</span>
          <div className="text-base font-extrabold text-slate-100">{currCtc}</div>
        </div>

        <div className="pl-6 space-y-1">
          <span className="text-xs font-semibold text-slate-400">Expected CTC</span>
          <div className="text-base font-extrabold text-slate-100">{expCtc}</div>
        </div>

        <div className="pl-6 space-y-1">
          <span className="text-xs font-semibold text-slate-400">Notice Period</span>
          <div className="text-base font-extrabold text-slate-100">{noticePeriod}</div>
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
              className={`text-xs font-bold transition-colors whitespace-nowrap relative pb-4 -mb-4 ${activeTab === tab ? "text-blue-400" : "text-slate-400 hover:text-slate-200"
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
        {activeTab === "Summary" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Professional Summary */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-100">Professional Summary</h3>
              <p className="text-xs text-slate-300 leading-relaxed font-normal">
                {summaryText}
              </p>
            </div>

            {/* Top Skills Badges */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-100">Top Skills</h3>
              <div className="flex flex-wrap gap-2.5">
                {skillsList.map((skill: string, i: number) => {
                  const isHighlighted = skill === "Microservices";
                  return (
                    <span
                      key={i}
                      className={`text-xs font-semibold px-3.5 py-1.5 rounded-lg transition-colors ${isHighlighted
                        ? "bg-blue-950/60 text-blue-400 border border-blue-800/60"
                        : "bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-800"
                        }`}
                    >
                      {skill}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === "Experience" && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-100">Work Experience</h3>
            <div className="space-y-4">
              {(candidate.experiences || []).map((exp: any, idx: number) => (
                <div key={idx} className="p-4 rounded-xl border border-slate-800 bg-[#030514] space-y-1">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold text-slate-100">{exp.role} - <span className="text-blue-400">{exp.company}</span></h4>
                    <span className="text-[11px] text-slate-400 font-medium">{exp.duration}</span>
                  </div>
                  <p className="text-xs text-slate-300">{exp.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "Education" && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-100">Education Details</h3>
            {(candidate.education || []).map((edu: any, idx: number) => (
              <div key={idx} className="p-4 rounded-xl border border-slate-800 bg-[#030514] flex justify-between items-center text-xs">
                <div>
                  <h4 className="font-bold text-slate-100">{edu.degree}</h4>
                  <p className="text-slate-400">{edu.institution}</p>
                </div>
                <span className="text-slate-400 font-medium">{edu.year}</span>
              </div>
            ))}
          </div>
        )}

        {activeTab === "Skills" && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-100">Extracted Skills Matrix</h3>
            <div className="flex flex-wrap gap-2">
              {skillsList.map((skill: string, idx: number) => (
                <span key={idx} className="bg-slate-900 border border-slate-800 text-slate-200 text-xs px-3 py-1.5 rounded-lg font-semibold">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {activeTab === "Projects" && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-100">Key Projects</h3>
            {(candidate.projects || []).map((proj: any, idx: number) => (
              <div key={idx} className="p-4 rounded-xl border border-slate-800 bg-[#030514] space-y-1">
                <h4 className="text-xs font-bold text-slate-100">{proj.name}</h4>
                <p className="text-xs text-slate-300">{proj.desc}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === "Certifications" && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-100">Certifications</h3>
            <ul className="space-y-2 text-xs text-slate-300">
              {(candidate.certifications || []).map((cert: string, idx: number) => (
                <li key={idx} className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-400" />
                  <span>{cert}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {activeTab === "Analysis" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/40 space-y-2">
              <h4 className="text-xs font-bold text-emerald-400">Strengths</h4>
              <ul className="space-y-1 text-xs text-emerald-300">
                {(candidate.analysis?.strengths || ["Backend Java expertise", "Microservices design"]).map((s: string, i: number) => (
                  <li key={i}>• {s}</li>
                ))}
              </ul>
            </div>
            <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-800/40 space-y-2">
              <h4 className="text-xs font-bold text-amber-400">Growth Areas / Gaps</h4>
              <ul className="space-y-1 text-xs text-amber-300">
                {(candidate.analysis?.gaps || ["Frontend framework depth"]).map((g: string, i: number) => (
                  <li key={i}>• {g}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {activeTab === "Documents" && (
          <div className="space-y-4 text-xs text-slate-400">
            <h3 className="text-sm font-bold text-slate-100">Uploaded Documents</h3>
            <p>Original resume file available for preview or download.</p>
          </div>
        )}
      </div>
    </div>
  );
}


