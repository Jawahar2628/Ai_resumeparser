import { useEffect, useState } from "react";
import {
  Calendar, Edit2, Trash2, Plus, Star, Video, X, AlertCircle
} from "lucide-react";
import {
  getInterviews, createInterview, updateInterview, rescheduleInterview, submitInterviewFeedback, deleteInterview, getResumes,
  type InterviewItem, type InterviewTypeEnum, type InterviewStatusEnum
} from "../utils/Api";

export default function InterviewManagement() {
  const [activeTab, setActiveTab] = useState<string>("All");
  const [interviews, setInterviews] = useState<InterviewItem[]>([]);
  const [candidatesList, setCandidatesList] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [isScheduleOpen, setIsScheduleOpen] = useState<boolean>(false);
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false);
  const [isRescheduleOpen, setIsRescheduleOpen] = useState<boolean>(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState<boolean>(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);

  const [selectedInterview, setSelectedInterview] = useState<InterviewItem | null>(null);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  // Form states
  const [scheduleForm, setScheduleForm] = useState({
    candidate_id: "",
    candidate_name: "",
    resume_id: "",
    job_title: "",
    interview_type: "TECHNICAL" as InterviewTypeEnum,
    round_number: 1,
    scheduled_date: new Date().toISOString().split("T")[0],
    scheduled_time: "10:00",
    duration_minutes: 60,
    interviewer_name: "",
    interviewer_email: "",
    meeting_platform: "Google Meet",
    meeting_link: "",
    notes: "",
  });

  const [editForm, setEditForm] = useState({
    candidate_name: "",
    job_title: "",
    interview_type: "TECHNICAL" as InterviewTypeEnum,
    round_number: 1,
    scheduled_date: "",
    scheduled_time: "",
    interviewer_name: "",
    interviewer_email: "",
    meeting_platform: "Google Meet",
    meeting_link: "",
    status: "SCHEDULED" as InterviewStatusEnum,
    notes: "",
  });

  const [rescheduleForm, setRescheduleForm] = useState({
    scheduled_date: "",
    scheduled_time: "",
    reason: "",
  });

  const [feedbackForm, setFeedbackForm] = useState({
    rating: 4,
    feedback: "",
    strengths: "",
    weaknesses: "",
    recommendation: "Selected",
    notes: "",
  });

  const navTabs = ["All", "Technical", "HR", "Managerial", "Culture Fit", "Final Round", "Initial Screening"];

  // Fetch interviews & candidates list
  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [interviewData, resumesData] = await Promise.all([
        getInterviews(),
        getResumes().catch(() => []),
      ]);

      const items = Array.isArray(interviewData) ? interviewData : interviewData?.interviews || [];
      setInterviews(items);

      const resumes = Array.isArray(resumesData) ? resumesData : resumesData?.resumes || [];
      setCandidatesList(resumes);
    } catch (err: any) {
      console.error("Failed to load interview management data:", err);
      setError(err.message || "Failed to load interviews.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Filtered interviews according to activeTab
  const filteredInterviews = interviews.filter((item) => {
    if (activeTab === "All") return true;
    const tabNorm = activeTab.toUpperCase().replace(/\s+/g, "_");
    return item.interview_type === tabNorm || item.interview_type.includes(tabNorm);
  });

  // Calculate live stats
  const techCount = interviews.filter((i) => i.interview_type === "TECHNICAL").length;
  const hrCount = interviews.filter((i) => i.interview_type === "HR").length;
  const managerialCount = interviews.filter((i) => i.interview_type === "MANAGERIAL").length;
  const scheduledCount = interviews.filter((i) => i.status === "SCHEDULED" || i.status === "PENDING").length;

  const stats = [
    { label: "Technical Interviews", value: techCount, status: `${techCount} Active` },
    { label: "HR Interviews", value: hrCount, status: `${hrCount} Active` },
    { label: "Managerial Interviews", value: managerialCount, status: `${managerialCount} Active` },
    { label: "Scheduled / Pending", value: scheduledCount, status: `${scheduledCount} Upcoming` },
  ];

  // Helper for Status Badge Styling
  const getStatusBadge = (statusVal: InterviewStatusEnum) => {
    switch (statusVal) {
      case "COMPLETED":
        return "bg-emerald-950/50 border-emerald-800/60 text-emerald-400";
      case "SCHEDULED":
        return "bg-indigo-950/50 border-indigo-800/60 text-indigo-300";
      case "RESCHEDULED":
        return "bg-amber-950/50 border-amber-800/60 text-amber-400";
      case "CANCELLED":
        return "bg-rose-950/50 border-rose-800/60 text-rose-400";
      case "NO_SHOW":
        return "bg-slate-900 border-slate-800 text-slate-400";
      default:
        return "bg-amber-950/40 border-amber-800/50 text-amber-400";
    }
  };

  // Schedule Submit
  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleForm.candidate_name || !scheduleForm.job_title) {
      alert("Please provide candidate name and job title.");
      return;
    }
    try {
      setActionLoading(true);
      await createInterview({
        candidate_id: scheduleForm.candidate_id || `cand_${Date.now()}`,
        candidate_name: scheduleForm.candidate_name,
        resume_id: scheduleForm.resume_id || undefined,
        job_title: scheduleForm.job_title,
        interview_type: scheduleForm.interview_type,
        round_number: Number(scheduleForm.round_number),
        scheduled_date: scheduleForm.scheduled_date,
        scheduled_time: scheduleForm.scheduled_time,
        duration_minutes: Number(scheduleForm.duration_minutes),
        interviewer_name: scheduleForm.interviewer_name || "Hiring Manager",
        interviewer_email: scheduleForm.interviewer_email || undefined,
        meeting_platform: scheduleForm.meeting_platform,
        meeting_link: scheduleForm.meeting_link || undefined,
        notes: scheduleForm.notes || undefined,
      });

      setIsScheduleOpen(false);
      fetchAllData();
    } catch (err: any) {
      console.error("Failed to schedule interview:", err);
      alert(err.message || "Failed to schedule interview.");
    } finally {
      setActionLoading(false);
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (item: InterviewItem) => {
    setSelectedInterview(item);
    setEditForm({
      candidate_name: item.candidate_name || "",
      job_title: item.job_title || "",
      interview_type: item.interview_type || "TECHNICAL",
      round_number: item.round_number || 1,
      scheduled_date: item.scheduled_date || "",
      scheduled_time: item.scheduled_time || "",
      interviewer_name: item.interviewer_name || "",
      interviewer_email: item.interviewer_email || "",
      meeting_platform: item.meeting_platform || "Google Meet",
      meeting_link: item.meeting_link || "",
      status: item.status || "SCHEDULED",
      notes: item.notes || "",
    });
    setIsEditOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInterview) return;
    try {
      setActionLoading(true);
      await updateInterview(selectedInterview.id, {
        candidate_name: editForm.candidate_name,
        job_title: editForm.job_title,
        interview_type: editForm.interview_type,
        round_number: Number(editForm.round_number),
        scheduled_date: editForm.scheduled_date,
        scheduled_time: editForm.scheduled_time,
        interviewer_name: editForm.interviewer_name,
        interviewer_email: editForm.interviewer_email || undefined,
        meeting_platform: editForm.meeting_platform,
        meeting_link: editForm.meeting_link || undefined,
        status: editForm.status,
        notes: editForm.notes || undefined,
      });

      setIsEditOpen(false);
      fetchAllData();
    } catch (err: any) {
      console.error("Failed to update interview:", err);
      alert(err.message || "Failed to update interview.");
    } finally {
      setActionLoading(false);
    }
  };

  // Open Reschedule Modal
  const handleOpenReschedule = (item: InterviewItem) => {
    setSelectedInterview(item);
    setRescheduleForm({
      scheduled_date: item.scheduled_date || new Date().toISOString().split("T")[0],
      scheduled_time: item.scheduled_time || "10:00",
      reason: "",
    });
    setIsRescheduleOpen(true);
  };

  const handleRescheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInterview) return;
    try {
      setActionLoading(true);
      await rescheduleInterview(selectedInterview.id, {
        scheduled_date: rescheduleForm.scheduled_date,
        scheduled_time: rescheduleForm.scheduled_time,
        reason: rescheduleForm.reason || undefined,
      });

      setIsRescheduleOpen(false);
      fetchAllData();
    } catch (err: any) {
      console.error("Failed to reschedule interview:", err);
      alert(err.message || "Failed to reschedule interview.");
    } finally {
      setActionLoading(false);
    }
  };

  // Open Feedback Modal
  const handleOpenFeedback = (item: InterviewItem) => {
    setSelectedInterview(item);
    setFeedbackForm({
      rating: item.rating || 4,
      feedback: item.feedback || "",
      strengths: item.strengths ? item.strengths.join(", ") : "",
      weaknesses: item.weaknesses ? item.weaknesses.join(", ") : "",
      recommendation: item.recommendation || "Selected",
      notes: item.notes || "",
    });
    setIsFeedbackOpen(true);
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInterview) return;
    try {
      setActionLoading(true);
      await submitInterviewFeedback(selectedInterview.id, {
        rating: Number(feedbackForm.rating),
        feedback: feedbackForm.feedback,
        strengths: feedbackForm.strengths ? feedbackForm.strengths.split(",").map((s) => s.trim()).filter(Boolean) : [],
        weaknesses: feedbackForm.weaknesses ? feedbackForm.weaknesses.split(",").map((s) => s.trim()).filter(Boolean) : [],
        recommendation: feedbackForm.recommendation,
        notes: feedbackForm.notes || undefined,
      });

      setIsFeedbackOpen(false);
      fetchAllData();
    } catch (err: any) {
      console.error("Failed to submit feedback:", err);
      alert(err.message || "Failed to submit feedback.");
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Interview
  const handleOpenDelete = (item: InterviewItem) => {
    setSelectedInterview(item);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedInterview) return;
    try {
      setActionLoading(true);
      await deleteInterview(selectedInterview.id);
      setIsDeleteOpen(false);
      fetchAllData();
    } catch (err: any) {
      console.error("Failed to delete interview:", err);
      alert(err.message || "Failed to delete interview.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="bg-[#030514] text-slate-100 min-h-screen p-6 rounded-2xl space-y-6 font-sans relative">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-slate-100">Interview Management</h1>
        </div>

        <button
          onClick={() => setIsScheduleOpen(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-colors shadow-lg cursor-pointer"
        >
          <Plus size={16} />
          Schedule Interview
        </button>
      </div>

      {/* 4 Stat Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-[#030514] p-6 rounded-2xl border border-slate-800 shadow-sm space-y-3">
            <span className="text-xs font-semibold text-slate-400 block">{stat.label}</span>
            <div className="text-3xl font-extrabold text-slate-100">{stat.value}</div>
            <span className="text-xs font-medium text-slate-400 block">{stat.status}</span>
          </div>
        ))}
      </div>

      {/* Main Table Card Wrapper */}
      <div className="bg-[#030514] rounded-2xl p-6 border border-slate-800 shadow-sm space-y-6">
        {/* Navigation Filter Tabs Header */}
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

        {/* Interviews Data Table */}
        {loading ? (
          <div className="flex items-center justify-center py-12 text-slate-400 text-xs">
            <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mr-2" />
            Loading interviews...
          </div>
        ) : error ? (
          <div className="p-6 text-center text-red-400 bg-red-950/20 border border-red-900/40 rounded-xl text-xs">
            {error}
          </div>
        ) : filteredInterviews.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs space-y-2">
            <p>No interviews found for tab "{activeTab}".</p>
            <button
              onClick={() => setIsScheduleOpen(true)}
              className="text-indigo-400 hover:underline font-semibold cursor-pointer"
            >
              Schedule a new interview
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] text-slate-400 font-semibold">
                  <th className="py-3 px-3">Candidate</th>
                  <th className="py-3 px-3">Role / Job</th>
                  <th className="py-3 px-3">Type & Round</th>
                  <th className="py-3 px-3">Date & Time</th>
                  <th className="py-3 px-3">Interviewer</th>
                  <th className="py-3 px-3">Meeting</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {filteredInterviews.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3.5 px-3 font-bold text-slate-100">{row.candidate_name}</td>
                    <td className="py-3.5 px-3 text-slate-300">{row.job_title}</td>
                    <td className="py-3.5 px-3 text-slate-400">
                      <span className="font-semibold text-slate-200">{row.interview_type.replace("_", " ")}</span>
                      <span className="block text-[10px] text-slate-400">Round {row.round_number}</span>
                    </td>
                    <td className="py-3.5 px-3 text-slate-300 font-medium">
                      <div>{row.scheduled_date}</div>
                      <div className="text-[10px] text-slate-400">{row.scheduled_time} ({row.timezone || "IST"})</div>
                    </td>
                    <td className="py-3.5 px-3 text-slate-400">{row.interviewer_name}</td>
                    <td className="py-3.5 px-3">
                      {row.meeting_link ? (
                        <a
                          href={row.meeting_link.startsWith("http") ? row.meeting_link : `https://${row.meeting_link}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 text-indigo-400 hover:underline font-medium text-[11px]"
                        >
                          <Video size={13} />
                          {row.meeting_platform || "Join"}
                        </a>
                      ) : (
                        <span className="text-slate-400 text-[11px]">N/A</span>
                      )}
                    </td>
                    <td className="py-3.5 px-3">
                      <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold border ${getStatusBadge(row.status)}`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5 text-blue-400">
                        {/* Edit Button */}
                        <button
                          onClick={() => handleOpenEdit(row)}
                          title="Edit Interview"
                          className="p-1.5 hover:bg-slate-800 rounded-md transition-colors border border-slate-800 cursor-pointer"
                        >
                          <Edit2 size={13} />
                        </button>

                        {/* Reschedule Button */}
                        <button
                          onClick={() => handleOpenReschedule(row)}
                          title="Reschedule Date & Time"
                          className="p-1.5 hover:bg-slate-800 rounded-md transition-colors border border-slate-800 cursor-pointer text-amber-400"
                        >
                          <Calendar size={13} />
                        </button>

                        {/* Rating / Feedback Button */}
                        <button
                          onClick={() => handleOpenFeedback(row)}
                          title="Submit Feedback & Rating"
                          className="p-1.5 hover:bg-slate-800 rounded-md transition-colors border border-slate-800 cursor-pointer text-emerald-400"
                        >
                          <Star size={13} />
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => handleOpenDelete(row)}
                          title="Delete Interview"
                          className="p-1.5 hover:bg-slate-800 rounded-md transition-colors border border-slate-800 cursor-pointer text-rose-400"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* SCHEDULE INTERVIEW MODAL */}
      {isScheduleOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-sans">
          <div className="bg-[#090d28] border border-indigo-500/30 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Plus size={18} className="text-indigo-400" /> Schedule New Interview
              </h2>
              <button
                onClick={() => setIsScheduleOpen(false)}
                className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleScheduleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Select Candidate (or type name)</label>
                <select
                  value={scheduleForm.candidate_id}
                  onChange={(e) => {
                    const selId = e.target.value;
                    const found = candidatesList.find((c) => c.id === selId);
                    const parsed = found?.parsed_data || {};
                    const nameStr = parsed.full_name || parsed.name || found?.original_filename || "";
                    setScheduleForm({
                      ...scheduleForm,
                      candidate_id: selId,
                      candidate_name: nameStr,
                      resume_id: selId,
                    });
                  }}
                  className="w-full bg-[#030514] border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500 mb-2"
                >
                  <option value="">-- Choose Candidate from Parsed Resumes --</option>
                  {candidatesList.map((cand) => {
                    const parsed = cand.parsed_data || {};
                    const candName = parsed.full_name || parsed.name || cand.original_filename;
                    return (
                      <option key={cand.id} value={cand.id}>
                        {candName}
                      </option>
                    );
                  })}
                </select>

                <input
                  type="text"
                  placeholder="Candidate Name"
                  value={scheduleForm.candidate_name}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, candidate_name: e.target.value })}
                  className="w-full bg-[#030514] border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Job Title / Role</label>
                  <input
                    type="text"
                    placeholder="e.g. Senior Java Developer"
                    value={scheduleForm.job_title}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, job_title: e.target.value })}
                    className="w-full bg-[#030514] border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Interview Type</label>
                  <select
                    value={scheduleForm.interview_type}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, interview_type: e.target.value as InterviewTypeEnum })}
                    className="w-full bg-[#030514] border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="TECHNICAL">TECHNICAL</option>
                    <option value="HR">HR</option>
                    <option value="MANAGERIAL">MANAGERIAL</option>
                    <option value="CULTURE_FIT">CULTURE_FIT</option>
                    <option value="FINAL_ROUND">FINAL_ROUND</option>
                    <option value="INITIAL_SCREENING">INITIAL_SCREENING</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Round Number</label>
                  <input
                    type="number"
                    min="1"
                    value={scheduleForm.round_number}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, round_number: Number(e.target.value) })}
                    className="w-full bg-[#030514] border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Date</label>
                  <input
                    type="date"
                    value={scheduleForm.scheduled_date}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, scheduled_date: e.target.value })}
                    className="w-full bg-[#030514] border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Time</label>
                  <input
                    type="time"
                    value={scheduleForm.scheduled_time}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, scheduled_time: e.target.value })}
                    className="w-full bg-[#030514] border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Interviewer Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Ravi Shankar"
                    value={scheduleForm.interviewer_name}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, interviewer_name: e.target.value })}
                    className="w-full bg-[#030514] border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Interviewer Email</label>
                  <input
                    type="email"
                    placeholder="interviewer@company.com"
                    value={scheduleForm.interviewer_email}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, interviewer_email: e.target.value })}
                    className="w-full bg-[#030514] border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Platform</label>
                  <select
                    value={scheduleForm.meeting_platform}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, meeting_platform: e.target.value })}
                    className="w-full bg-[#030514] border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Google Meet">Google Meet</option>
                    <option value="Zoom">Zoom</option>
                    <option value="Microsoft Teams">Microsoft Teams</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Meeting Link</label>
                  <input
                    type="text"
                    placeholder="https://meet.google.com/..."
                    value={scheduleForm.meeting_link}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, meeting_link: e.target.value })}
                    className="w-full bg-[#030514] border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Notes / Agenda</label>
                <textarea
                  rows={2}
                  value={scheduleForm.notes}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, notes: e.target.value })}
                  className="w-full bg-[#030514] border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                  placeholder="Focus areas or instructions..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsScheduleOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-lg disabled:opacity-50"
                >
                  {actionLoading ? "Scheduling..." : "Schedule Interview"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT INTERVIEW MODAL */}
      {isEditOpen && selectedInterview && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-sans">
          <div className="bg-[#090d28] border border-indigo-500/30 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Edit2 size={18} className="text-indigo-400" /> Edit Interview Details
              </h2>
              <button
                onClick={() => setIsEditOpen(false)}
                className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Candidate Name</label>
                  <input
                    type="text"
                    value={editForm.candidate_name}
                    onChange={(e) => setEditForm({ ...editForm, candidate_name: e.target.value })}
                    className="w-full bg-[#030514] border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Job Title</label>
                  <input
                    type="text"
                    value={editForm.job_title}
                    onChange={(e) => setEditForm({ ...editForm, job_title: e.target.value })}
                    className="w-full bg-[#030514] border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Type</label>
                  <select
                    value={editForm.interview_type}
                    onChange={(e) => setEditForm({ ...editForm, interview_type: e.target.value as InterviewTypeEnum })}
                    className="w-full bg-[#030514] border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="TECHNICAL">TECHNICAL</option>
                    <option value="HR">HR</option>
                    <option value="MANAGERIAL">MANAGERIAL</option>
                    <option value="CULTURE_FIT">CULTURE_FIT</option>
                    <option value="FINAL_ROUND">FINAL_ROUND</option>
                    <option value="INITIAL_SCREENING">INITIAL_SCREENING</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Round</label>
                  <input
                    type="number"
                    min="1"
                    value={editForm.round_number}
                    onChange={(e) => setEditForm({ ...editForm, round_number: Number(e.target.value) })}
                    className="w-full bg-[#030514] border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Status</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value as InterviewStatusEnum })}
                    className="w-full bg-[#030514] border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500 font-bold text-indigo-300"
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="SCHEDULED">SCHEDULED</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="RESCHEDULED">RESCHEDULED</option>
                    <option value="CANCELLED">CANCELLED</option>
                    <option value="NO_SHOW">NO_SHOW</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Scheduled Date</label>
                  <input
                    type="date"
                    value={editForm.scheduled_date}
                    onChange={(e) => setEditForm({ ...editForm, scheduled_date: e.target.value })}
                    className="w-full bg-[#030514] border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Scheduled Time</label>
                  <input
                    type="time"
                    value={editForm.scheduled_time}
                    onChange={(e) => setEditForm({ ...editForm, scheduled_time: e.target.value })}
                    className="w-full bg-[#030514] border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Interviewer Name</label>
                  <input
                    type="text"
                    value={editForm.interviewer_name}
                    onChange={(e) => setEditForm({ ...editForm, interviewer_name: e.target.value })}
                    className="w-full bg-[#030514] border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Meeting Link</label>
                  <input
                    type="text"
                    value={editForm.meeting_link}
                    onChange={(e) => setEditForm({ ...editForm, meeting_link: e.target.value })}
                    className="w-full bg-[#030514] border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-lg disabled:opacity-50"
                >
                  {actionLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESCHEDULE MODAL */}
      {isRescheduleOpen && selectedInterview && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-sans">
          <div className="bg-[#090d28] border border-amber-500/30 rounded-2xl w-full max-w-md p-6 space-y-5 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Calendar size={18} className="text-amber-400" /> Reschedule Interview
              </h2>
              <button
                onClick={() => setIsRescheduleOpen(false)}
                className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="bg-amber-950/20 border border-amber-900/40 p-3 rounded-xl text-xs text-amber-300">
              Candidate: <span className="font-bold text-slate-100">{selectedInterview.candidate_name}</span> ({selectedInterview.job_title})
            </div>

            <form onSubmit={handleRescheduleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">New Scheduled Date</label>
                <input
                  type="date"
                  value={rescheduleForm.scheduled_date}
                  onChange={(e) => setRescheduleForm({ ...rescheduleForm, scheduled_date: e.target.value })}
                  className="w-full bg-[#030514] border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">New Scheduled Time</label>
                <input
                  type="time"
                  value={rescheduleForm.scheduled_time}
                  onChange={(e) => setRescheduleForm({ ...rescheduleForm, scheduled_time: e.target.value })}
                  className="w-full bg-[#030514] border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Reason for Rescheduling</label>
                <textarea
                  rows={3}
                  value={rescheduleForm.reason}
                  onChange={(e) => setRescheduleForm({ ...rescheduleForm, reason: e.target.value })}
                  placeholder="e.g. Candidate requested time change due to conflict..."
                  className="w-full bg-[#030514] border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsRescheduleOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-bold shadow-lg disabled:opacity-50"
                >
                  {actionLoading ? "Rescheduling..." : "Reschedule Interview"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RATING & FEEDBACK MODAL */}
      {isFeedbackOpen && selectedInterview && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-sans">
          <div className="bg-[#090d28] border border-emerald-500/30 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Star size={18} className="text-emerald-400" /> Submit Interview Rating & Feedback
              </h2>
              <button
                onClick={() => setIsFeedbackOpen(false)}
                className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleFeedbackSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Rating Score (1.0 to 5.0)</label>
                <input
                  type="number"
                  step="0.5"
                  min="1"
                  max="5"
                  value={feedbackForm.rating}
                  onChange={(e) => setFeedbackForm({ ...feedbackForm, rating: Number(e.target.value) })}
                  className="w-full bg-[#030514] border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500 font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Recommendation Status</label>
                <select
                  value={feedbackForm.recommendation}
                  onChange={(e) => setFeedbackForm({ ...feedbackForm, recommendation: e.target.value })}
                  className="w-full bg-[#030514] border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500 font-semibold"
                >
                  <option value="Selected">Selected</option>
                  <option value="Next Round">Next Round</option>
                  <option value="Hold">Hold</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Detailed Feedback</label>
                <textarea
                  rows={4}
                  value={feedbackForm.feedback}
                  onChange={(e) => setFeedbackForm({ ...feedbackForm, feedback: e.target.value })}
                  placeholder="Provide technical evaluation feedback, communication notes, and overall decision..."
                  className="w-full bg-[#030514] border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Candidate Strengths (Comma-separated)</label>
                <input
                  type="text"
                  placeholder="Java 17, System Design, Problem Solving"
                  value={feedbackForm.strengths}
                  onChange={(e) => setFeedbackForm({ ...feedbackForm, strengths: e.target.value })}
                  className="w-full bg-[#030514] border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Areas for Improvement (Comma-separated)</label>
                <input
                  type="text"
                  placeholder="GraphQL, Kafka"
                  value={feedbackForm.weaknesses}
                  onChange={(e) => setFeedbackForm({ ...feedbackForm, weaknesses: e.target.value })}
                  className="w-full bg-[#030514] border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsFeedbackOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-lg disabled:opacity-50"
                >
                  {actionLoading ? "Submitting..." : "Submit Feedback"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {isDeleteOpen && selectedInterview && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-sans">
          <div className="bg-[#090d28] border border-rose-500/30 rounded-2xl w-full max-w-md p-6 space-y-5 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-rose-400 flex items-center gap-2">
                <AlertCircle size={18} /> Delete Interview Record
              </h2>
              <button
                onClick={() => setIsDeleteOpen(false)}
                className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to delete the scheduled interview for{" "}
              <span className="font-bold text-slate-100">{selectedInterview.candidate_name}</span> ({selectedInterview.job_title})?
              This action cannot be undone.
            </p>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setIsDeleteOpen(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700 font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={actionLoading}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold shadow-lg disabled:opacity-50"
              >
                {actionLoading ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
