import { Search, Filter, MoreVertical, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export default function Database() {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/candidates')
      .then(res => res.json())
      .then(data => {
        setCandidates(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-8 h-full flex flex-col">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold mb-2">Candidate Database & AI Search</h1>
          <p className="text-slate-400">Search using natural language or traditional filters.</p>
        </div>
      </div>

      <div className="glass-card p-2 flex items-center gap-2 max-w-2xl border border-indigo-500/30 shadow-[0_0_20px_rgba(99,102,241,0.1)]">
        <div className="p-3">
          <Search className="text-indigo-400" size={20} />
        </div>
        <input 
          type="text" 
          placeholder='e.g., "Find Java developers with 8+ years in Banking available in 30 days"'
          className="bg-transparent border-none outline-none text-slate-200 w-full placeholder-slate-500"
        />
        <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-lg font-medium transition-colors">
          AI Search
        </button>
      </div>

      <div className="flex-1 glass-card overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-800/50 flex justify-between items-center bg-slate-900/40">
          <h3 className="font-semibold text-lg">All Candidates</h3>
          <button className="flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-colors">
            <Filter size={18} />
            Filters
          </button>
        </div>
        
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-700/50 bg-slate-900/20">
                <th className="py-4 px-6 font-semibold text-slate-400 text-sm">Candidate</th>
                <th className="py-4 px-6 font-semibold text-slate-400 text-sm">Role & Exp</th>
                <th className="py-4 px-6 font-semibold text-slate-400 text-sm">AI Score</th>
                <th className="py-4 px-6 font-semibold text-slate-400 text-sm">Match</th>
                <th className="py-4 px-6 font-semibold text-slate-400 text-sm">Status</th>
                <th className="py-4 px-6 font-semibold text-slate-400 text-sm text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">Loading database...</td>
                </tr>
              ) : candidates.map((can, idx) => (
                <tr key={idx} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors group cursor-pointer" onClick={() => navigate(`/evaluation/${can.id}`)}>
                  <td className="py-4 px-6">
                    <div className="font-medium text-slate-200">{can.full_name || 'Unknown'}</div>
                    <div className="text-xs text-slate-500">ID: {can.id}</div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-slate-300 truncate max-w-[200px]" title={can.parsed_resume?.experience?.[0]?.designation || "Unknown"}>
                      {can.parsed_resume?.experience?.[0]?.designation || "Unknown Role"}
                    </div>
                    <div className="text-xs text-slate-500">{can.experience_level || "Unknown Exp"}</div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${(can.overall_score || 0) > 80 ? 'bg-green-500' : (can.overall_score || 0) > 60 ? 'bg-amber-500' : 'bg-rose-500'}`}
                          style={{ width: `${can.overall_score || 0}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{can.overall_score || 0}%</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                      (can.overall_score || 0) > 85 ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                      (can.overall_score || 0) > 70 ? 'bg-sky-500/10 text-sky-400 border-sky-500/20' :
                      'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    }`}>
                      {(can.overall_score || 0) > 85 ? 'Excellent' : (can.overall_score || 0) > 70 ? 'Good' : 'Average'}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`text-sm px-3 py-1 rounded-md ${can.status === 'completed' ? 'bg-green-500/20 text-green-300' : 'bg-slate-800 text-slate-300'}`}>
                      {can.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="text-slate-400 hover:text-indigo-400" onClick={(e) => { e.stopPropagation(); navigate(`/evaluation/${can.id}`); }}>
                        <Eye size={18} />
                      </button>
                      <button className="text-slate-400 hover:text-slate-200" onClick={(e) => e.stopPropagation()}>
                        <MoreVertical size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
