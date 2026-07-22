import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Star, Shield, TrendingUp, AlertCircle, BookOpen, CheckCircle, Briefcase, GraduationCap, FolderGit2, Mail, Phone, MapPin, Link } from "lucide-react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";

export default function Evaluation() {
  const { id } = useParams();
  const [candidate, setCandidate] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
      setLoading(false);
    }
  }, [id]);

  if (loading) {
    return <div className="text-white p-8">Loading AI Evaluation...</div>;
  }
  
  if (!candidate || !candidate.evaluation) {
    return <div className="text-white p-8">Evaluation not found.</div>;
  }

  const evalData = candidate.evaluation;
  const parsed = candidate.parsed_resume;
  const techScore = evalData.ai_technical_score || 0;
  const personality = evalData.personality_analysis || {};
  const career = evalData.career_analysis || {};

  const technicalData = [
    { subject: 'Overall', A: techScore, fullMark: 100 }
  ];
  
  evalData.skill_strengths?.slice(0, 4).forEach((skill: string) => {
    technicalData.push({ subject: skill, A: Math.max(techScore, 85), fullMark: 100 });
  });
  evalData.skill_weaknesses?.slice(0, 3).forEach((skill: string) => {
    technicalData.push({ subject: skill, A: 40, fullMark: 100 });
  });

  const personalityData = [
    { subject: 'Leadership', A: personality.leadership || 0, fullMark: 100 },
    { subject: 'Team Player', A: personality.team_player || 0, fullMark: 100 },
    { subject: 'Communication', A: personality.communication || 0, fullMark: 100 },
    { subject: 'Problem Solving', A: personality.problem_solving || 0, fullMark: 100 },
  ];

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">AI Candidate Evaluation</h1>
          <p className="text-slate-400">Deep analysis of {candidate.full_name}'s profile and capabilities.</p>
        </div>
        
        {/* Contact Info */}
        <div className="flex flex-wrap gap-4 text-sm text-slate-300">
          {parsed.email && (
            <div className="flex items-center gap-1">
              <Mail size={16} className="text-indigo-400" />
              <span>{parsed.email}</span>
            </div>
          )}
          {parsed.phone && (
            <div className="flex items-center gap-1">
              <Phone size={16} className="text-indigo-400" />
              <span>{parsed.phone}</span>
            </div>
          )}
          {parsed.location && (
            <div className="flex items-center gap-1">
              <MapPin size={16} className="text-indigo-400" />
              <span>{parsed.location}</span>
            </div>
          )}
          {parsed.linkedin && (
            <div className="flex items-center gap-1">
              <Link size={16} className="text-indigo-400" />
              <span>{parsed.linkedin}</span>
            </div>
          )}
        </div>
      </div>

      {/* Top Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 flex items-center gap-4 border-l-4 border-indigo-500">
          <div className="w-12 h-12 bg-indigo-500/20 rounded-full flex items-center justify-center text-indigo-400">
            <Star size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-400">Experience Level</p>
            <h3 className="text-xl font-bold text-slate-100">{candidate.experience_level}</h3>
          </div>
        </div>
        
        <div className="glass-card p-6 flex items-center gap-4 border-l-4 border-sky-500">
          <div className="w-12 h-12 bg-sky-500/20 rounded-full flex items-center justify-center text-sky-400">
            <Shield size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-400">Domain Expertise</p>
            <h3 className="text-xl font-bold text-slate-100 truncate w-40" title={evalData.domain_expertise?.join(", ")}>
              {evalData.domain_expertise?.[0] || 'Unknown'}
            </h3>
          </div>
        </div>
        
        <div className="glass-card p-6 flex items-center gap-4 border-l-4 border-green-500">
          <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center text-green-400">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-400">Overall AI Score</p>
            <h3 className="text-xl font-bold text-slate-100">{techScore}%</h3>
          </div>
        </div>
      </div>

      {/* Radar Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-card p-6">
          <h3 className="text-lg font-bold mb-6 text-slate-200">Technical Strength</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={technicalData}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#334155" />
                <Radar name="Tech" dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.4} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-6">
          <h3 className="text-lg font-bold mb-6 text-slate-200">AI Personality Analysis</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={personalityData}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#334155" />
                <Radar name="Personality" dataKey="A" stroke="#38bdf8" fill="#38bdf8" fillOpacity={0.4} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Career Analysis & Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-card p-6 border border-slate-700/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <TrendingUp size={100} />
          </div>
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="text-indigo-400" size={20} />
            Career Analysis
          </h3>
          <div className="space-y-4 relative z-10">
            <div className="flex justify-between items-center bg-slate-900/50 p-3 rounded-lg">
              <span className="text-slate-400">Job Hopping Risk</span>
              <span className="text-slate-200 font-medium">{career.job_hopping_risk || 'Unknown'}</span>
            </div>
            <div className="flex justify-between items-center bg-slate-900/50 p-3 rounded-lg">
              <span className="text-slate-400">Career Stability</span>
              <span className="text-slate-200 font-medium">{career.career_stability || 'Unknown'}</span>
            </div>
            <div className="flex justify-between items-center bg-slate-900/50 p-3 rounded-lg">
              <span className="text-slate-400">Promotion Pattern</span>
              <span className="text-slate-200 font-medium">{career.promotion_pattern || 'Unknown'}</span>
            </div>
          </div>
        </div>

        <div className="glass-card p-6 border border-slate-700/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <BookOpen size={100} />
          </div>
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <BookOpen className="text-sky-400" size={20} />
            Skill Intelligence
          </h3>
          
          <div className="space-y-4 relative z-10">
            <div>
              <h4 className="text-sm font-semibold text-slate-500 mb-2">Strengths</h4>
              <div className="flex flex-wrap gap-2">
                {evalData.skill_strengths?.map((s: string) => (
                  <span key={s} className="bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded text-xs border border-indigo-500/20">{s}</span>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-500 mb-2 flex items-center gap-1">
                Weaknesses
              </h4>
              <div className="flex flex-wrap gap-2">
                {evalData.skill_weaknesses?.map((s: string) => (
                  <span key={s} className="bg-rose-500/20 text-rose-300 px-2 py-1 rounded text-xs border border-rose-500/20">{s}</span>
                ))}
              </div>
            </div>
            {career.recommended_upskilling && career.recommended_upskilling.length > 0 && (
              <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-start gap-3">
                <AlertCircle className="text-amber-400 shrink-0" size={18} />
                <p className="text-sm text-amber-200/80">
                  AI recommends upskilling in <strong className="text-amber-400">{career.recommended_upskilling.join(", ")}</strong> to improve career trajectory.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Full Resume Details (Experience, Education, Projects) */}
      <div className="space-y-8 mt-12">
        <h2 className="text-2xl font-bold border-b border-slate-700 pb-4">Parsed Resume Details</h2>

        {/* Experience */}
        {parsed.experience && parsed.experience.length > 0 && (
          <div className="glass-card p-6">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Briefcase className="text-indigo-400" size={24} />
              Professional Experience
            </h3>
            <div className="space-y-6">
              {parsed.experience.map((exp: any, i: number) => (
                <div key={i} className="relative pl-6 border-l-2 border-indigo-500/30">
                  <div className="absolute w-3 h-3 bg-indigo-500 rounded-full -left-[7px] top-1.5 ring-4 ring-[#0f172a]"></div>
                  <h4 className="text-lg font-bold text-slate-200">{exp.designation}</h4>
                  <div className="flex justify-between items-center text-sm mb-3">
                    <span className="text-indigo-300 font-medium">{exp.company}</span>
                    <span className="text-slate-400">{exp.duration}</span>
                  </div>
                  <p className="text-slate-400 text-sm leading-relaxed">{exp.responsibilities}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education & Projects */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Education */}
          {parsed.education && parsed.education.length > 0 && (
            <div className="glass-card p-6">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <GraduationCap className="text-sky-400" size={24} />
                Education
              </h3>
              <div className="space-y-4">
                {parsed.education.map((edu: any, i: number) => (
                  <div key={i} className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                    <h4 className="font-bold text-slate-200">{edu.degree}</h4>
                    <p className="text-sky-300 text-sm my-1">{edu.institution}</p>
                    <div className="flex justify-between text-xs text-slate-400 mt-2">
                      <span>{edu.year_of_passing}</span>
                      <span>Score: {edu.score}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Projects */}
          {parsed.projects && parsed.projects.length > 0 && (
            <div className="glass-card p-6">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <FolderGit2 className="text-green-400" size={24} />
                Projects
              </h3>
              <div className="space-y-4">
                {parsed.projects.map((proj: any, i: number) => (
                  <div key={i} className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-slate-200">{proj.name}</h4>
                      <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded">{proj.role}</span>
                    </div>
                    <p className="text-sm text-slate-400 mb-3">{proj.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {proj.tech_stack?.map((tech: string) => (
                        <span key={tech} className="text-[10px] uppercase tracking-wider bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
