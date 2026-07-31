import React, { useEffect, useState } from "react";
import {
  X, UserCheck, Calendar, MapPin, ShieldCheck, DollarSign,
  TrendingUp, FileText, Building2, Layers, RefreshCw, AlertCircle, Video
} from "lucide-react";
import { getCandidateInterviewHistory, type InterviewItem } from "../utils/Api";

interface CandidateDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidateId: string | null;
  candidateName?: string;
  fallbackInterview?: InterviewItem | null;
}

export const CandidateDetailsModal: React.FC<CandidateDetailsModalProps> = ({
  isOpen,
  onClose,
  candidateId,
  candidateName,
  fallbackInterview,
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [historyData, setHistoryData] = useState<any>(null);

  useEffect(() => {
    if (isOpen && candidateId) {
      fetchCandidateHistory();
    } else if (isOpen && fallbackInterview) {
      // Fallback single record display if candidate_id is missing
      setHistoryData({
        candidate_id: fallbackInterview.candidate_id || "N/A",
        candidate_name: fallbackInterview.candidate_name,
        job_title: fallbackInterview.job_title,
        job_location: fallbackInterview.job_location,
        job_type: fallbackInterview.job_type,
        location: fallbackInterview.location || fallbackInterview.interview_location,
        interview_location: fallbackInterview.interview_location || fallbackInterview.location,
        hr_call_verification: fallbackInterview.hr_call_verification,
        candidate_requested_date: fallbackInterview.candidate_requested_date,
        candidate_requested_time: fallbackInterview.candidate_requested_time,
        candidate_requested_role: fallbackInterview.candidate_requested_role,
        salary_requested: fallbackInterview.salary_requested,
        final_fit_salary: fallbackInterview.final_fit_salary,
        joining_date: fallbackInterview.joining_date,
        interview_document_files: fallbackInterview.interview_document_files || [],
        total_rounds: 1,
        rounds: [fallbackInterview],
      });
    }
  }, [isOpen, candidateId, fallbackInterview]);

  const fetchCandidateHistory = async () => {
    if (!candidateId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await getCandidateInterviewHistory(candidateId);
      setHistoryData(data);
    } catch (err: any) {
      console.error("Failed to fetch candidate history:", err);
      setError(err.message || "Failed to load candidate details.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 font-sans animate-in fade-in duration-200">
      <div className="bg-gradient-to-b from-[#0b0e29] via-[#080a21] to-[#040514] border border-cyan-500/40 rounded-3xl w-full max-w-6xl w-[94vw] max-h-[92vh] overflow-y-auto p-6 md:p-8 space-y-6 shadow-[0_0_60px_rgba(6,182,212,0.2)] relative">
        
        {/* Header Bar */}
        <div className="flex justify-between items-start border-b border-cyan-500/20 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-tr from-cyan-600 to-blue-600 rounded-2xl shadow-lg shadow-cyan-500/30 text-white">
              <UserCheck size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white tracking-wide">
                  Candidate Full Interview & Evaluation Record
                </h2>
                {historyData?.total_rounds && (
                  <span className="bg-cyan-950/90 border border-cyan-700/60 text-cyan-300 text-xs font-bold px-2.5 py-0.5 rounded-full">
                    {historyData.total_rounds} Round(s) Completed/Scheduled
                  </span>
                )}
              </div>
              <p className="text-xs text-cyan-300/80 mt-0.5">
                Complete profile background, compensation requests, document files, and all round evaluations
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl bg-slate-900/60 hover:bg-slate-800 border border-slate-800 transition-all cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Loading / Error States */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16 space-y-3">
            <RefreshCw size={32} className="animate-spin text-cyan-400" />
            <p className="text-sm font-semibold text-slate-300">Fetching candidate complete interview details...</p>
          </div>
        )}

        {error && (
          <div className="bg-rose-950/50 border border-rose-800 text-rose-300 p-4 rounded-2xl flex items-center gap-3">
            <AlertCircle size={20} />
            <p className="text-xs font-semibold">{error}</p>
          </div>
        )}

        {!loading && historyData && (
          <div className="space-y-6 text-xs">
            {/* CANDIDATE SUMMARY BADGE & BACKGROUND CARD */}
            <div className="bg-[#0e163d]/70 border border-cyan-500/30 rounded-2xl p-5 space-y-4 shadow-inner">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-cyan-500/20 pb-3">
                <div>
                  <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">Candidate Name</span>
                  <div className="text-lg font-bold text-white flex items-center gap-2">
                    {historyData.candidate_name || candidateName}
                    <span className="text-xs font-semibold text-slate-400">({historyData.candidate_id})</span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">Target Job Position</span>
                  <div className="text-sm font-bold text-cyan-200">{historyData.job_title || "N/A"}</div>
                </div>

                <div>
                  <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">HR Verification</span>
                  <div>
                    <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                      historyData.hr_call_verification === "Verified"
                        ? "bg-emerald-950/80 border-emerald-700 text-emerald-300"
                        : "bg-amber-950/80 border-amber-700 text-amber-300"
                    }`}>
                      <ShieldCheck size={13} />
                      {historyData.hr_call_verification || "Pending"}
                    </span>
                  </div>
                </div>
              </div>

              {/* DETAILS GRID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
                <div className="bg-[#070a21] p-3 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                    <MapPin size={12} className="text-cyan-400" /> Location / Office
                  </span>
                  <div className="font-bold text-slate-200 truncate">{historyData.location || historyData.interview_location || "N/A"}</div>
                </div>

                <div className="bg-[#070a21] p-3 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                    <DollarSign size={12} className="text-amber-400" /> Salary Requested
                  </span>
                  <div className="font-bold text-amber-300">{historyData.salary_requested || "N/A"}</div>
                </div>

                <div className="bg-[#070a21] p-3 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                    <TrendingUp size={12} className="text-emerald-400" /> Final Fit Salary
                  </span>
                  <div className="font-bold text-emerald-400">{historyData.final_fit_salary || "N/A"}</div>
                </div>

                <div className="bg-[#070a21] p-3 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                    <Calendar size={12} className="text-indigo-400" /> Joining Date
                  </span>
                  <div className="font-bold text-indigo-300">{historyData.joining_date || "N/A"}</div>
                </div>
              </div>

              {/* ATTACHED DOCUMENTS & REQUESTED ROLE */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                {historyData.candidate_requested_role && (
                  <div className="bg-[#070a21] p-3 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 font-semibold">Candidate Requested Role</span>
                    <div className="font-semibold text-slate-200">{historyData.candidate_requested_role}</div>
                  </div>
                )}

                {historyData.interview_document_files && historyData.interview_document_files.length > 0 && (
                  <div className="bg-[#070a21] p-3 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                      <FileText size={12} className="text-rose-400" /> Attached Files ({historyData.interview_document_files.length})
                    </span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {historyData.interview_document_files.map((fileUrl: string, idx: number) => (
                        <a
                          key={idx}
                          href={fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="bg-slate-900 border border-slate-700 hover:border-cyan-500 text-cyan-300 text-[10px] px-2 py-0.5 rounded font-mono truncate max-w-[200px]"
                        >
                          {fileUrl}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* INTERVIEW ROUNDS CHRONOLOGICAL TIMELINE */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm border-b border-cyan-500/20 pb-2">
                <Layers size={18} />
                <span>Interview Rounds Evaluation Timeline ({historyData.rounds?.length || 0} Rounds)</span>
              </div>

              {historyData.rounds && historyData.rounds.length > 0 ? (
                historyData.rounds.map((round: InterviewItem, index: number) => (
                  <div
                    key={round.id || index}
                    className="bg-gradient-to-b from-[#0c1433]/90 to-[#070b1e]/90 border border-indigo-500/30 rounded-2xl p-5 space-y-4 shadow-md relative"
                  >
                    {/* Round Banner Header */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-indigo-500/20 pb-3">
                      <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-xs px-3 py-1 rounded-xl shadow-sm">
                          Round {round.round_number} ({round.interview_type})
                        </div>
                        <div className="text-slate-300 font-semibold flex items-center gap-1">
                          <Calendar size={13} className="text-cyan-400" /> {round.scheduled_date} at {round.scheduled_time} ({round.timezone})
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {round.meeting_link && (
                          <a
                            href={round.meeting_link}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-700/60 text-cyan-200 text-xs px-3 py-1 rounded-xl font-bold transition-all"
                          >
                            <Video size={13} />
                            <span>Join Meeting</span>
                          </a>
                        )}

                        <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold border ${
                          round.status === "COMPLETED"
                            ? "bg-emerald-950/70 border-emerald-800 text-emerald-400"
                            : "bg-cyan-950/70 border-cyan-800 text-cyan-400"
                        }`}>
                          {round.status}
                        </span>
                      </div>
                    </div>

                    {/* Interviewer Details & Round Feedback */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {/* Left Sub-Card: Interviewer Evaluation */}
                      <div className="bg-[#12193b]/60 border border-purple-500/30 rounded-xl p-4 space-y-3">
                        <div className="flex items-center justify-between border-b border-purple-500/20 pb-2">
                          <span className="font-bold text-purple-300 flex items-center gap-1 text-xs">
                            <UserCheck size={14} /> Interviewer Evaluation ({round.interviewer_name})
                          </span>
                          <span className="text-amber-400 font-bold text-xs">
                            ⭐ {round.rating ? `${round.rating} / 5` : "No Rating"}
                          </span>
                        </div>

                        {round.interviewer_email && (
                          <div className="text-slate-400 text-[11px]">Email: <span className="text-slate-200">{round.interviewer_email}</span></div>
                        )}

                        <div>
                          <span className="text-[10px] text-slate-400 font-semibold">Round Recommendation:</span>
                          <span className="ml-2 font-bold text-amber-300">{round.recommendation || "Pending"}</span>
                        </div>

                        {round.feedback && (
                          <div>
                            <span className="text-[10px] text-slate-400 font-semibold block">Round Feedback:</span>
                            <p className="text-slate-200 bg-[#070a21] p-2.5 rounded-lg border border-slate-800 mt-1 leading-relaxed">
                              {round.feedback}
                            </p>
                          </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                          {round.strengths && round.strengths.length > 0 && (
                            <div className="bg-emerald-950/40 border border-emerald-800/40 p-2 rounded-lg">
                              <span className="text-emerald-400 font-bold block mb-0.5">Strengths:</span>
                              <span className="text-slate-200">{Array.isArray(round.strengths) ? round.strengths.join(", ") : round.strengths}</span>
                            </div>
                          )}

                          {round.weaknesses && round.weaknesses.length > 0 && (
                            <div className="bg-rose-950/40 border border-rose-800/40 p-2 rounded-lg">
                              <span className="text-rose-400 font-bold block mb-0.5">Areas for Improvement:</span>
                              <span className="text-slate-200">{Array.isArray(round.weaknesses) ? round.weaknesses.join(", ") : round.weaknesses}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right Sub-Card: Client Feedback */}
                      <div className="bg-[#0d222b]/60 border border-teal-500/30 rounded-xl p-4 space-y-3">
                        <div className="flex items-center justify-between border-b border-teal-500/20 pb-2">
                          <span className="font-bold text-teal-300 flex items-center gap-1 text-xs">
                            <Building2 size={14} /> Client Feedback Option ({round.client_name || "Client"})
                          </span>
                          <span className="text-teal-200 font-bold text-xs">
                            ⭐ {round.client_rating ? `${round.client_rating} / 5` : "No Rating"}
                          </span>
                        </div>

                        {round.client_feedback_date && (
                          <div className="text-slate-400 text-[11px]">Date: <span className="text-teal-300">{round.client_feedback_date}</span></div>
                        )}

                        <div>
                          <span className="text-[10px] text-slate-400 font-semibold">Client Recommendation:</span>
                          <span className="ml-2 font-bold text-teal-300">{round.client_recommendation || "Pending"}</span>
                        </div>

                        {round.client_feedback && (
                          <div>
                            <span className="text-[10px] text-slate-400 font-semibold block">Client Feedback:</span>
                            <p className="text-slate-200 bg-[#070a21] p-2.5 rounded-lg border border-slate-800 mt-1 leading-relaxed">
                              {round.client_feedback}
                            </p>
                          </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                          {round.client_strengths && round.client_strengths.length > 0 && (
                            <div className="bg-teal-950/40 border border-teal-800/40 p-2 rounded-lg">
                              <span className="text-teal-300 font-bold block mb-0.5">Client Strengths:</span>
                              <span className="text-slate-200">{Array.isArray(round.client_strengths) ? round.client_strengths.join(", ") : round.client_strengths}</span>
                            </div>
                          )}

                          {round.client_weaknesses && round.client_weaknesses.length > 0 && (
                            <div className="bg-rose-950/40 border border-rose-800/40 p-2 rounded-lg">
                              <span className="text-rose-400 font-bold block mb-0.5">Client Weaknesses:</span>
                              <span className="text-slate-200">{Array.isArray(round.client_weaknesses) ? round.client_weaknesses.join(", ") : round.client_weaknesses}</span>
                            </div>
                          )}
                        </div>

                        {round.client_notes && (
                          <div>
                            <span className="text-[10px] text-slate-400 font-semibold block">Client Specific Notes:</span>
                            <p className="text-slate-300 bg-[#070a21] p-2 rounded-lg border border-slate-800 mt-0.5 font-medium">
                              {round.client_notes}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-slate-400 text-xs italic py-4 text-center">No interview rounds recorded yet.</div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end pt-3 border-t border-cyan-500/20">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-gradient-to-r from-slate-800 to-slate-900 border border-slate-700 text-white rounded-xl font-bold hover:bg-slate-700 transition-all cursor-pointer"
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
};
