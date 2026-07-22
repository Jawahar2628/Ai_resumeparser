import { Check, X, Briefcase, MapPin, DollarSign, Target } from "lucide-react";

export default function JDMatch() {
  const skillMatch = [
    { skill: "Java", jd: true, resume: true, match: true },
    { skill: "Spring Boot", jd: true, resume: true, match: true },
    { skill: "Kafka", jd: true, resume: true, match: true },
    { skill: "Kubernetes", jd: true, resume: false, match: false },
    { skill: "AWS", jd: true, resume: true, match: true },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-10">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold mb-2">JD Matching Analysis</h1>
          <p className="text-slate-400">Comparing John Doe's profile against Job Description: "Senior Java Developer"</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-400 mb-1">Overall Match Score</p>
          <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500">
            92%
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-card p-4 flex flex-col items-center justify-center text-center">
          <Briefcase className="text-indigo-400 mb-2" size={24} />
          <p className="text-xs text-slate-400">Experience Match</p>
          <p className="font-bold">Required: 7 Yrs</p>
          <p className="text-green-400 text-sm mt-1 flex items-center gap-1"><Check size={14}/> Candidate: 8 Yrs</p>
        </div>
        <div className="glass-card p-4 flex flex-col items-center justify-center text-center">
          <Target className="text-sky-400 mb-2" size={24} />
          <p className="text-xs text-slate-400">Domain Match</p>
          <p className="font-bold">Required: Banking</p>
          <p className="text-green-400 text-sm mt-1 flex items-center gap-1"><Check size={14}/> FinTech Exp</p>
        </div>
        <div className="glass-card p-4 flex flex-col items-center justify-center text-center">
          <MapPin className="text-purple-400 mb-2" size={24} />
          <p className="text-xs text-slate-400">Location Match</p>
          <p className="font-bold">Chennai / Hybrid</p>
          <p className="text-green-400 text-sm mt-1 flex items-center gap-1"><Check size={14}/> Open to Relocate</p>
        </div>
        <div className="glass-card p-4 flex flex-col items-center justify-center text-center">
          <DollarSign className="text-amber-400 mb-2" size={24} />
          <p className="text-xs text-slate-400">Salary Match</p>
          <p className="font-bold">Budget: 20 LPA</p>
          <p className="text-green-400 text-sm mt-1 flex items-center gap-1"><Check size={14}/> Expected: 18 LPA</p>
        </div>
      </div>

      <div className="glass-card p-6 overflow-hidden">
        <h3 className="text-lg font-bold mb-6">Skills Matching Breakdown</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="py-3 px-4 font-semibold text-slate-300">Skill</th>
                <th className="py-3 px-4 font-semibold text-slate-300">Required in JD</th>
                <th className="py-3 px-4 font-semibold text-slate-300">Found in Resume</th>
                <th className="py-3 px-4 font-semibold text-slate-300">Match Status</th>
              </tr>
            </thead>
            <tbody>
              {skillMatch.map((row, idx) => (
                <tr key={idx} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                  <td className="py-4 px-4 font-medium">{row.skill}</td>
                  <td className="py-4 px-4">
                    {row.jd ? <span className="text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded text-sm">Yes</span> : "No"}
                  </td>
                  <td className="py-4 px-4">
                    {row.resume ? <span className="text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded text-sm">Yes</span> : "No"}
                  </td>
                  <td className="py-4 px-4">
                    {row.match ? (
                      <div className="flex items-center gap-2 text-green-400">
                        <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center">
                          <Check size={14} />
                        </div>
                        <span className="font-medium text-sm">Match</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-rose-400">
                        <div className="w-6 h-6 bg-rose-500/20 rounded-full flex items-center justify-center">
                          <X size={14} />
                        </div>
                        <span className="font-medium text-sm">Missing</span>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-gradient-to-r from-emerald-500/20 to-green-500/10 border border-emerald-500/30 p-6 rounded-2xl flex items-start gap-4">
        <div className="p-3 bg-emerald-500/20 rounded-xl">
          <Check className="text-emerald-400" size={24} />
        </div>
        <div>
          <h3 className="text-xl font-bold text-emerald-300 mb-1">Final Recommendation: Excellent Match</h3>
          <p className="text-emerald-200/70">
            The candidate meets 92% of the requirements. They fit the budget, have the required domain experience, and possess 4 out of 5 critical skills. Proceeding to Technical Interview is highly recommended.
          </p>
        </div>
      </div>
    </div>
  );
}
