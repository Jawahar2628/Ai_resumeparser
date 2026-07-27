import { useState, useEffect } from "react";
import { Search, Filter, Download, Eye, FileText, X, User, Briefcase } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getResumes, getResumeById } from "../utils/Api";

export default function CandidateDatabase() {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Detailed candidate state for Modal when Eye icon is clicked
  const [selectedCandidateDetail, setSelectedCandidateDetail] = useState<any>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    setLoading(true);
    try {
      const resData = await getResumes();
      const items = Array.isArray(resData) ? resData : resData.resumes || [];

      const mapped = items.map((item: any, idx: number) => ({
        id: `CND${String(idx + 1).padStart(4, "0")}`,
        realId: item.id,
        name: item.parsed_data?.full_name || item.parsed_data?.name || item.original_filename || "Candidate",
        role: item.parsed_data?.designation || item.parsed_data?.experience?.[0]?.designation || "Software Professional",
        experience: item.parsed_data?.total_experience_years
          ? `${item.parsed_data.total_experience_years} Yrs`
          : item.parsed_data?.years_of_experience
            ? `${item.parsed_data.years_of_experience} Yrs`
            : "N/A",
        match: item.ai_evaluation?.ai_technical_score
          ? `${item.ai_evaluation.ai_technical_score}%`
          : "85%",
        status: item.status ? item.status.toUpperCase() : "PARSED",
        statusBg: "bg-emerald-950/60 border-emerald-800/50 text-emerald-400",
        s3Url: item.s3_url,
        lastUpdated: item.upload_date
          ? new Date(item.upload_date).toLocaleDateString()
          : new Date().toLocaleDateString(),
        rawData: item,
      }));

      setCandidates(mapped);
    } catch (err) {
      console.error("Failed to fetch candidates from backend API:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = async (realId: string) => {
    if (!realId) return;
    setLoadingDetail(true);
    setShowModal(true);
    try {
      const detail = await getResumeById(realId);
      setSelectedCandidateDetail(detail);
    } catch (err) {
      console.error("Failed to fetch candidate details:", err);
    } finally {
      setLoadingDetail(false);
    }
  };

  const filteredCandidates = candidates.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredCandidates.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredCandidates.map((c) => c.id));
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((i) => i !== id));
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
                    checked={selectedIds.length === filteredCandidates.length && filteredCandidates.length > 0}
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
                  <td colSpan={9} className="py-8 text-center text-slate-400">Loading candidates from database...</td>
                </tr>
              ) : filteredCandidates.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">No candidate records found.</td>
                </tr>
              ) : (
                filteredCandidates.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3.5 px-3 text-center">
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
                    <td className="py-3.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-2 text-blue-400">
                        <button
                          onClick={() => handleViewDetail(row.realId)}
                          className="p-1.5 hover:bg-slate-800 rounded-md transition-colors border border-slate-800 text-indigo-400 hover:text-indigo-300 cursor-pointer"
                          title="Quick Preview Modal"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => navigate(`/evaluation/${row.realId}`)}
                          className="p-1.5 hover:bg-slate-800 rounded-md transition-colors border border-slate-800 text-slate-300 hover:text-white cursor-pointer"
                          title="View Candidate Full Evaluation Page"
                        >
                          <User size={14} />
                        </button>
                        <button
                          onClick={() => {
                            if (row.s3Url) {
                              const newWindow = window.open();
                              if (newWindow) {
                                newWindow.document.write(`
                                  <!DOCTYPE html>
                                  <html>
                                    <head>
                                      <title>Resume Preview</title>
                                      <style>
                                        body, html { margin: 0; padding: 0; height: 100%; overflow: hidden; background: #020617; }
                                        iframe { width: 100%; height: 100%; border: none; }
                                      </style>
                                    </head>
                                    <body>
                                      <iframe src="${row.s3Url}"></iframe>
                                    </body>
                                  </html>
                                `);
                              } else {
                                window.location.href = row.s3Url;
                              }
                            } else {
                              alert("S3 Resume link is not available for this candidate.");
                            }
                          }}
                          className="p-1.5 hover:bg-slate-800 rounded-md transition-colors border border-slate-800 text-slate-400 hover:text-slate-200 cursor-pointer"
                          title="Open PDF Resume Document (New Tab)"
                        >
                          <FileText size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-slate-800/80 text-xs text-slate-400">
          <span>Showing 1 to {filteredCandidates.length} of {candidates.length} candidates</span>
        </div>
      </div>

      {/* Modal for Particular Candidate DB Entry Details */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#090d1f] border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[85vh] overflow-y-auto p-6 shadow-2xl relative space-y-6">
            <button
              onClick={() => {
                setShowModal(false);
                setSelectedCandidateDetail(null);
              }}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg bg-slate-900 border border-slate-800"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-xl text-indigo-400">
                <User size={24} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-100">
                  {loadingDetail
                    ? "Fetching Database Entry..."
                    : selectedCandidateDetail?.parsed_data?.full_name ||
                    selectedCandidateDetail?.parsed_data?.name ||
                    selectedCandidateDetail?.original_filename ||
                    "Candidate Details"}
                </h2>
                <p className="text-xs text-slate-400">ID: {selectedCandidateDetail?.id}</p>
              </div>
            </div>

            {loadingDetail ? (
              <div className="py-12 text-center text-slate-400 text-sm">
                Fetching candidate details from database...
              </div>
            ) : selectedCandidateDetail ? (
              <div className="space-y-6 text-sm">
                {/* Meta Summary Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                    <span className="text-xs text-slate-500 block">Status</span>
                    <span className="font-semibold text-emerald-400 text-xs">
                      {selectedCandidateDetail.status || "N/A"}
                    </span>
                  </div>
                  <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                    <span className="text-xs text-slate-500 block">Uploaded On</span>
                    <span className="font-semibold text-slate-300 text-xs">
                      {new Date(selectedCandidateDetail.upload_date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                    <span className="text-xs text-slate-500 block">File Name</span>
                    <span className="font-semibold text-slate-300 text-xs truncate block" title={selectedCandidateDetail.original_filename}>
                      {selectedCandidateDetail.original_filename}
                    </span>
                  </div>
                  <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                    <span className="text-xs text-slate-500 block">User ID</span>
                    <span className="font-semibold text-slate-300 text-xs truncate block">
                      {selectedCandidateDetail.user_id}
                    </span>
                  </div>
                </div>

                {/* Parsed JSON details */}
                {selectedCandidateDetail.parsed_data && (
                  <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800/80 space-y-3">
                    <h3 className="text-xs font-semibold text-indigo-400 uppercase tracking-wider flex items-center gap-2">
                      <Briefcase size={14} /> Parsed Resume Profile
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-slate-500">Email:</span>{" "}
                        <span className="text-slate-200">{selectedCandidateDetail.parsed_data.email || "N/A"}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Phone:</span>{" "}
                        <span className="text-slate-200">{selectedCandidateDetail.parsed_data.phone || "N/A"}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Designation:</span>{" "}
                        <span className="text-slate-200">{selectedCandidateDetail.parsed_data.designation || "N/A"}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Experience:</span>{" "}
                        <span className="text-slate-200">
                          {selectedCandidateDetail.parsed_data.total_experience_years || selectedCandidateDetail.parsed_data.years_of_experience || "N/A"} Yrs
                        </span>
                      </div>
                    </div>

                    {/* Skills */}
                    {selectedCandidateDetail.parsed_data.skills && Array.isArray(selectedCandidateDetail.parsed_data.skills) && (
                      <div className="pt-2">
                        <span className="text-xs text-slate-500 block mb-1.5">Skills:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedCandidateDetail.parsed_data.skills.map((skill: string, i: number) => (
                            <span key={i} className="px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 rounded text-[11px]">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* S3 URL Link */}
                {selectedCandidateDetail.s3_url && (
                  <div className="flex items-center justify-between p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                    <span className="text-xs text-slate-400">AWS S3 File Path</span>
                    <a
                      href={selectedCandidateDetail.s3_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-medium underline"
                    >
                      View Resume Document
                    </a>
                  </div>
                )}

                {/* Extracted Raw Text */}
                {selectedCandidateDetail.extracted_text && (
                  <div className="space-y-1.5">
                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Extracted Resume Text
                    </h3>
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 max-h-48 overflow-y-auto text-xs text-slate-300 font-mono whitespace-pre-wrap">
                      {selectedCandidateDetail.extracted_text}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-8 text-center text-red-400 text-sm">Could not load candidate details.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

