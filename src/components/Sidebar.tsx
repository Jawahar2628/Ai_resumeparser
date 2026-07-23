import { NavLink } from "react-router-dom";
import { LayoutDashboard, UploadCloud, Users, CheckCircle, Settings, Briefcase, Calendar, Video, MessageSquare, BarChart3 } from "lucide-react";

export function Sidebar() {
  const navItems = [
    { name: "Dashboard", path: "/", icon: <LayoutDashboard size={20} /> },
    { name: "Upload Resume", path: "/upload", icon: <UploadCloud size={20} /> },
    { name: "Candidate Database", path: "/database", icon: <Users size={20} /> },
    { name: "Evaluation", path: "/evaluation", icon: <CheckCircle size={20} /> },
    { name: "JD Matching", path: "/jd-match", icon: <Briefcase size={20} /> },
    { name: "Interviews", path: "/interviews", icon: <Calendar size={20} /> },
    { name: "Interview Dashboard", path: "/interview-dashboard", icon: <Video size={20} /> },
    { name: "Client Feedback", path: "/client-feedback", icon: <MessageSquare size={20} /> },
    { name: "Analytics & Reports", path: "/analytics", icon: <BarChart3 size={20} /> },
  ];

  return (
    <aside className="w-64 glass border-r border-slate-800 flex flex-col h-full bg-slate-900/40">
      <div className="p-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-sky-400 bg-clip-text text-transparent">
          AI Recruiter
        </h2>
        <p className="text-xs text-slate-400 mt-1">Smart Hiring Platform</p>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto min-h-0">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                isActive
                  ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.2)]"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`
            }
          >
            {item.icon}
            <span className="font-medium">{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 cursor-pointer transition-colors">
          <Settings size={20} />
          <span className="font-medium">Settings</span>
        </div>
      </div>
    </aside>
  );
}
