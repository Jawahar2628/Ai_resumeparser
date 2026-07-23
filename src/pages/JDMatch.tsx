import { useState } from "react";
import { Check, X, ChevronDown, CheckCircle2 } from "lucide-react";

export default function JDMatch() {
  const [activeTab, setActiveTab] = useState("Skill Match");

  const navTabs = ["Skill Match", "Experience Match", "Domain Match", "Other Factors"];

  const matchSummary = [
    { label: "Skills Match", percentage: "95%" },
    { label: "Experience Match", percentage: "90%" },
    { label: "Domain Match", percentage: "90%" },
    { label: "Location Match", percentage: "100%" },
    { label: "Salary Match", percentage: "85%" },
  ];

  const skillTableData = [
    { skill: "Java", requirement: "Required", candidate: "Yes (8 Yrs)", match: true },
    { skill: "Spring Boot", requirement: "Required", candidate: "Yes (6 Yrs)", match: true },
    { skill: "Microservices", requirement: "Required", candidate: "Yes (3 Yrs)", match: true },
    { skill: "Kafka", requirement: "Required", candidate: "Yes (3 Yrs)", match: true },
    { skill: "Kubernetes", requirement: "Required", candidate: "No", match: false },
    { skill: "AWS", requirement: "Required", candidate: "Yes (4 Yrs)", match: true },
    { skill: "Docker", requirement: "Preferred", candidate: "Yes (3 Yrs)", match: true },
  ];

  return (
    <div className="bg-[#030514] text-slate-100 min-h-screen p-6 rounded-2xl space-y-6 font-sans">
      {/* Top Header Bar */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-slate-100">JD Matching</h1>
        </div>

        <button className="flex items-center gap-2 bg-[#030514] border border-blue-500/60 text-blue-400 px-4 py-1.5 rounded-xl text-xs font-bold hover:bg-blue-950/30 transition-colors shadow-sm">
          View JD
          <ChevronDown size={14} />
        </button>
      </div>

      {/* Top Row Overview Cards (3 Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Job Meta Info */}
        <div className="bg-[#030514] p-6 rounded-2xl border border-slate-800 shadow-sm space-y-4">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 block mb-1">Job Title</span>
            <h2 className="text-lg font-extrabold text-slate-100">Senior Java Developer</h2>
          </div>

          <div>
            <span className="text-[11px] font-semibold text-slate-400 block mb-0.5">Experience</span>
            <span className="text-xs font-bold text-slate-200">6-9 Years</span>
          </div>

          <div>
            <span className="text-[11px] font-semibold text-slate-400 block mb-0.5">Location</span>
            <span className="text-xs font-bold text-slate-200">Chennai</span>
          </div>

          <div>
            <span className="text-[11px] font-semibold text-slate-400 block mb-0.5">Employment Type</span>
            <span className="text-xs font-bold text-slate-200">Full Time</span>
          </div>
        </div>

        {/* Card 2: Overall Match Score */}
        <div className="bg-[#030514] p-6 rounded-2xl border border-slate-800 shadow-sm flex flex-col justify-between items-center text-center space-y-4">
          <span className="text-xs font-bold text-slate-300">Overall Match Score</span>

          <div className="space-y-1">
            <span className="text-4xl font-extrabold text-slate-100 block">92%</span>
            <span className="text-xs font-bold text-emerald-400 block">Excellent Match</span>
          </div>

          {/* Green Bar Indicator */}
          <div className="w-full max-w-xs h-2 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 w-[92%] rounded-full"></div>
          </div>
        </div>

        {/* Card 3: Match Summary List */}
        <div className="bg-[#030514] p-6 rounded-2xl border border-slate-800 shadow-sm space-y-3">
          <h3 className="text-xs font-bold text-slate-100 mb-2">Match Summary</h3>
          <div className="space-y-2.5">
            {matchSummary.map((item, i) => (
              <div key={i} className="flex justify-between items-center text-xs pb-1 border-b border-slate-800/60 last:border-0 last:pb-0">
                <span className="text-slate-400 font-medium">{item.label}</span>
                <span className="font-bold text-slate-100">{item.percentage}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid: Tabs Content Table (Left 2 cols) & AI Recommendation (Right 1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Section: Tabs & Table */}
        <div className="lg:col-span-2 bg-[#030514] p-6 rounded-2xl border border-slate-800 shadow-sm space-y-6">
          {/* Tabs Navigation Header */}
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

          {/* Skill Match Table */}
          {activeTab === "Skill Match" && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-[11px] text-slate-400 font-semibold">
                    <th className="py-2.5 px-2">Skill</th>
                    <th className="py-2.5 px-2">JD Requirement</th>
                    <th className="py-2.5 px-2">Candidate</th>
                    <th className="py-2.5 px-2 text-right">Match</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs">
                  {skillTableData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-3 px-2 font-bold text-slate-200">{row.skill}</td>
                      <td className="py-3 px-2 text-slate-400">{row.requirement}</td>
                      <td className={`py-3 px-2 font-semibold ${row.match ? 'text-slate-300' : 'text-rose-400'}`}>
                        {row.candidate}
                      </td>
                      <td className="py-3 px-2 text-right">
                        {row.match ? (
                          <Check className="text-emerald-400 ml-auto" size={16} />
                        ) : (
                          <X className="text-rose-500 ml-auto" size={16} />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab !== "Skill Match" && (
            <div className="py-8 text-center text-xs text-slate-400">
              Detailed matching insights for {activeTab} available.
            </div>
          )}
        </div>

        {/* Right Section: AI Recommendation & Missing Skills */}
        <div className="bg-[#030514] p-6 rounded-2xl border border-slate-800 shadow-sm space-y-6">
          {/* AI Recommendation */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-100">AI Recommendation</h3>

            <div className="bg-emerald-950/40 border border-emerald-800/50 p-3 rounded-xl flex items-center justify-center gap-2 text-emerald-400 text-xs font-bold">
              <CheckCircle2 size={16} />
              <span>Excellent Match</span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              This candidate is an excellent fit for this role.
            </p>
          </div>

          {/* Missing Skills Section */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <h3 className="text-xs font-bold text-slate-100">Missing Skills</h3>
            <div className="flex flex-wrap gap-2">
              <span className="bg-rose-950/40 border border-rose-800/50 text-rose-300 text-xs font-semibold px-3 py-1 rounded-lg">
                Kubernetes
              </span>
              <span className="bg-rose-950/40 border border-rose-800/50 text-rose-300 text-xs font-semibold px-3 py-1 rounded-lg">
                Helm
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

