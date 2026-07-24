import { useState, useEffect } from "react";
import { Search, Filter, Download, Eye, FileText, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function CandidateDatabase() {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const mockCandidates = [
    {
      id: "CND1001",
      name: "Vijay",
      role: "Senior Java Developer",
      experience: "8.2 Yrs",
      match: "92%",
      status: "Client Interview",
      statusBg: "bg-emerald-950/60 border-emerald-800/50 text-emerald-400",
      lastUpdated: "20 May 2025",
    },
    {
      id: "CND1002",
      name: "Priya S",
      role: "Full Stack Developer",
      experience: "6.5 Yrs",
      match: "85%",
      status: "Project Interview",
      statusBg: "bg-blue-950/60 border-blue-800/50 text-blue-400",
    },
    {
      id: "CND1003",
      name: "Vikram M",
      role: "DevOps Engineer",
      experience: "7.8 Yrs",
      match: "88%",
      status: "HR Interview",
      statusBg: "bg-amber-950/60 border-amber-800/50 text-amber-400",
      lastUpdated: "19 May 2025",
    },
    {
      id: "CND1004",
      name: "Ramesh K",
      role: "Java Developer",
      experience: "5.5 Yrs",
      match: "78%",
      status: "Technical Interview",
      statusBg: "bg-purple-950/60 border-purple-800/50 text-purple-400",
      lastUpdated: "19 May 2025",
    },
    {
      id: "CND1005",
      name: "Swetha R",
      role: "QA Engineer",
      experience: "4.2 Yrs",
      match: "70%",
      status: "New",
      statusBg: "bg-slate-900 border-slate-800 text-slate-300",
      lastUpdated: "18 May 2025",
    },
    {
      id: "CND1006",
      name: "Karthik S",
      role: "React Developer",
      experience: "3.8 Yrs",
      match: "65%",
      status: "Shortlisted",
      statusBg: "bg-emerald-950/60 border-emerald-800/50 text-emerald-400",
      lastUpdated: "18 May 2025",
    },
  ];

  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    fetch('http://127.0.0.1:8000/api/candidates', { signal: controller.signal })
      .then(res => res.json())
      .then(data => {
        clearTimeout(timeoutId);
        if (Array.isArray(data) && data.length > 0) {
          const mapped = data.map((item: any, idx: number) => ({
            id: `CND100${idx + 1}`,
            name: item.full_name || item.parsed_resume?.name || "Vijay",
            role: item.parsed_resume?.experience?.[0]?.designation || "Senior Java Developer",
            experience: item.parsed_resume?.years_of_experience ? `${item.parsed_resume.years_of_experience} Yrs` : "8.2 Yrs",
            match: `${item.overall_score || 92}%`,
            status: item.status || "Client Interview",
            statusBg: "bg-emerald-950/60 border-emerald-800/50 text-emerald-400",
            lastUpdated: "20 May 2025",
            realId: item.id
          }));
          setCandidates(mapped);
        } else {
          setCandidates(mockCandidates);
        }
        setLoading(false);
      })
      .catch(() => {
        clearTimeout(timeoutId);
        setCandidates(mockCandidates);
        setLoading(false);
      });
  }, []);

  const toggleSelectAll = () => {
    if (selectedIds.length === candidates.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(candidates.map(c => c.id));
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  return (
    <div className="bg-[#030514] text-slate-100 min-h-screen p-6 rounded-2xl space-y-6 font-sans">
      {/* Top Header Bar */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-slate-100">Candidate Database</h1>
        </div>
      </div>

      {/* Main Table Card Wrapper */}
      <div className="bg-[#030514] rounded-2xl p-6 border border-slate-800 shadow-sm space-y-6">
        {/* Search Input Bar & Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search candidate..."
              className="w-full pl-10 pr-10 py-2 bg-[#030514] border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
            <button className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200">
              <Search size={14} />
            </button>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            <button className="flex items-center gap-2 bg-[#030514] border border-slate-800 text-slate-300 px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-900 transition-colors shadow-sm">
              <Filter size={14} />
              Filters
            </button>
            <button className="flex items-center gap-2 bg-[#030514] border border-slate-800 text-slate-300 px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-900 transition-colors shadow-sm">
              <Download size={14} />
              Export
            </button>
          </div>
        </div>

        {/* Database Candidates Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] text-slate-400 font-semibold">
                <th className="py-3 px-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === candidates.length && candidates.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded border-slate-700 bg-slate-900 accent-blue-600 cursor-pointer"
                  />
                </th>
                <th className="py-3 px-3">Candidate ID</th>
                <th className="py-3 px-3">Name</th>
                <th className="py-3 px-3">Role</th>
                <th className="py-3 px-3">Experience</th>
                <th className="py-3 px-3">Match %</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Last Updated</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">Loading candidate database...</td>
                </tr>
              ) : candidates.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-900/40 transition-colors cursor-pointer" onClick={() => navigate(`/evaluation/${row.realId || ''}`)}>
                  <td className="py-3.5 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(row.id)}
                      onChange={() => toggleSelect(row.id)}
                      className="rounded border-slate-700 bg-slate-900 accent-blue-600 cursor-pointer"
                    />
                  </td>
                  <td className="py-3.5 px-3 font-bold text-slate-200">{row.id}</td>
                  <td className="py-3.5 px-3 font-bold text-slate-100">{row.name}</td>
                  <td className="py-3.5 px-3 text-slate-300 font-medium">{row.role}</td>
                  <td className="py-3.5 px-3 text-slate-400">{row.experience}</td>
                  <td className="py-3.5 px-3 font-bold text-emerald-400">{row.match}</td>
                  <td className="py-3.5 px-3">
                    <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold border ${row.statusBg}`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-slate-400">{row.lastUpdated}</td>
                  <td className="py-3.5 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-2 text-blue-400">
                      <button
                        onClick={() => navigate(`/evaluation/${row.realId || ''}`)}
                        className="p-1.5 hover:bg-slate-900 rounded-md transition-colors border border-slate-800"
                        title="View Evaluation"
                      >
                        <Eye size={13} />
                      </button>
                      <button
                        onClick={() => navigate('/jd-match')}
                        className="p-1.5 hover:bg-slate-900 rounded-md transition-colors border border-slate-800"
                        title="JD Match"
                      >
                        <FileText size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-slate-800/80 text-xs text-slate-400">
          <span>Showing 1 to 6 of 2453 results</span>

          <div className="flex items-center gap-1.5 font-bold">
            <span className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center cursor-pointer">
              1
            </span>
            <span className="w-7 h-7 rounded-lg hover:bg-slate-900 flex items-center justify-center cursor-pointer text-slate-400">
              2
            </span>
            <span className="w-7 h-7 rounded-lg hover:bg-slate-900 flex items-center justify-center cursor-pointer text-slate-400">
              3
            </span>
            <span className="w-7 h-7 rounded-lg hover:bg-slate-900 flex items-center justify-center cursor-pointer text-slate-400">
              4
            </span>
            <span className="w-7 h-7 rounded-lg hover:bg-slate-900 flex items-center justify-center cursor-pointer text-slate-400">
              5
            </span>
            <span className="px-1 text-slate-500">...</span>
            <span className="w-7 h-7 rounded-lg hover:bg-slate-900 flex items-center justify-center cursor-pointer text-slate-400">
              409
            </span>
            <button className="flex items-center gap-1 text-slate-400 hover:text-slate-200 ml-2">
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

