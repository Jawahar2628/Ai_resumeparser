import { useState } from "react";
import { Calendar, Edit2, Trash2 } from "lucide-react";

export default function InterviewManagement() {
  const [activeTab, setActiveTab] = useState("All");

  const navTabs = ["All", "Technical", "Project", "HR", "Client"];

  const stats = [
    { label: "Technical Interviews", value: "23", status: "Pending" },
    { label: "Project Interviews", value: "15", status: "Pending" },
    { label: "HR Interviews", value: "18", status: "Pending" },
    { label: "Client Interviews", value: "10", status: "Scheduled" },
  ];

  const interviewData = [
    {
      candidate: "Arun Kumar",
      role: "Senior Java Developer",
      type: "Technical",
      dateTime: "20 May, 10:00 AM",
      interviewer: "Ravi Shankar",
      status: "Pending",
      statusBg: "bg-amber-950/40 border-amber-800/50 text-amber-400",
    },
    {
      candidate: "Priya S",
      role: "Full Stack Developer",
      type: "Project",
      dateTime: "20 May, 11:30 AM",
      interviewer: "Karthik",
      status: "Pending",
      statusBg: "bg-amber-950/40 border-amber-800/50 text-amber-400",
    },
    {
      candidate: "Vikram M",
      role: "DevOps Engineer",
      type: "HR",
      dateTime: "20 May, 02:00 PM",
      interviewer: "Deepa HR",
      status: "Pending",
      statusBg: "bg-amber-950/40 border-amber-800/50 text-amber-400",
    },
    {
      candidate: "Ramesh K",
      role: "Java Developer",
      type: "Technical",
      dateTime: "21 May, 10:00 AM",
      interviewer: "Ravi Shankar",
      status: "Scheduled",
      statusBg: "bg-emerald-950/40 border-emerald-800/50 text-emerald-400",
    },
    {
      candidate: "Swetha R",
      role: "QA Engineer",
      type: "Client",
      dateTime: "21 May, 03:00 PM",
      interviewer: "Client Panel",
      status: "Scheduled",
      statusBg: "bg-emerald-950/40 border-emerald-800/50 text-emerald-400",
    },
  ];

  const filteredInterviews = activeTab === "All"
    ? interviewData
    : interviewData.filter(i => i.type.toLowerCase() === activeTab.toLowerCase());

  return (
    <div className="bg-[#030514] text-slate-100 min-h-screen p-6 rounded-2xl space-y-6 font-sans">
      {/* Top Header Bar */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-slate-100">Interview Management</h1>
        </div>

        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-colors shadow-sm">
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

        {/* Interviews Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] text-slate-400 font-semibold">
                <th className="py-3 px-3">Candidate</th>
                <th className="py-3 px-3">Role</th>
                <th className="py-3 px-3">Interview Type</th>
                <th className="py-3 px-3">Date & Time</th>
                <th className="py-3 px-3">Interviewer</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {filteredInterviews.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-3.5 px-3 font-bold text-slate-100">{row.candidate}</td>
                  <td className="py-3.5 px-3 text-slate-300">{row.role}</td>
                  <td className="py-3.5 px-3 text-slate-400">{row.type}</td>
                  <td className="py-3.5 px-3 text-slate-300 font-medium">{row.dateTime}</td>
                  <td className="py-3.5 px-3 text-slate-400">{row.interviewer}</td>
                  <td className="py-3.5 px-3">
                    <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold border ${row.statusBg}`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    <div className="flex items-center justify-end gap-2 text-blue-400">
                      <button className="p-1.5 hover:bg-slate-900 rounded-md transition-colors border border-slate-800">
                        <Edit2 size={13} />
                      </button>
                      <button className="p-1.5 hover:bg-slate-900 rounded-md transition-colors border border-slate-800">
                        <Calendar size={13} />
                      </button>
                      <button className="p-1.5 hover:bg-slate-900 rounded-md transition-colors border border-slate-800">
                        <Trash2 size={13} />
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
