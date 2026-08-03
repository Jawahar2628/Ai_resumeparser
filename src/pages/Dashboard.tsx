import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Search, Bell, Settings, FileText, Sparkles, CheckCircle2, Video, ChevronDown, Loader2 } from 'lucide-react';
import { getDashboardMetrics } from '../utils/Api';

export default function Dashboard() {
  const [userName, setUserName] = useState<string>("Senthil C");
  const [userRole, setUserRole] = useState<string>("Recruiter");
  
  const [loading, setLoading] = useState<boolean>(true);
  const [stats, setStats] = useState<any[]>([]);
  const [pipelineData, setPipelineData] = useState<any[]>([]);
  const [statusData, setStatusData] = useState<any[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [upcomingInterviews, setUpcomingInterviews] = useState<any[]>([]);
  const [totalPipeline, setTotalPipeline] = useState<number>(0);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser.full_name) {
          setUserName(parsedUser.full_name);
        }
        if (parsedUser.role) {
          setUserRole(parsedUser.role.charAt(0).toUpperCase() + parsedUser.role.slice(1));
        }
      } catch (e) {
        console.error("Failed to parse user data from localStorage", e);
      }
    }

    const fetchDashboard = async () => {
      try {
        const data = await getDashboardMetrics();
        setStats(data.stats || []);
        setPipelineData(data.pipelineData || []);
        setStatusData(data.statusData || []);
        setRecentActivities(data.recentActivities || []);
        setUpcomingInterviews(data.upcomingInterviews || []);
        
        let sum = 0;
        if (data.statusData) {
            data.statusData.forEach((s: any) => sum += s.count);
        }
        setTotalPipeline(sum);
      } catch (error) {
        console.error("Failed to load dashboard metrics", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboard();
  }, []);

  const getIcon = (type: string) => {
    switch(type) {
      case 'sparkles': return <Sparkles size={14} className="text-amber-500" />;
      case 'video': return <Video size={14} className="text-purple-500" />;
      case 'check': return <CheckCircle2 size={14} className="text-emerald-500" />;
      case 'file':
      default: return <FileText size={14} className="text-blue-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full bg-[#030514] text-white">
        <Loader2 className="animate-spin mr-2" /> Loading Dashboard...
      </div>
    );
  }

  return (
    <div className="bg-[#030514] text-slate-100 min-h-screen p-6 rounded-2xl space-y-6 font-sans">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search candidates, skills, position..."
            className="w-full bg-slate-900/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-4 self-end sm:self-auto">
          <button className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-900 rounded-lg transition-colors border border-slate-800">
            <Bell size={20} />
          </button>
          <button className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-900 rounded-lg transition-colors border border-slate-800">
            <Settings size={20} />
          </button>

          <div className="flex items-center gap-3 pl-2 border-l border-slate-800">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
              alt={userName}
              className="w-9 h-9 rounded-full object-cover border border-slate-700"
            />
            <div className="text-left leading-tight hidden sm:block">
              <div className="flex items-center gap-1">
                <span className="font-semibold text-slate-100 text-sm">{userName}</span>
                <ChevronDown size={14} className="text-slate-400" />
              </div>
              <span className="text-xs text-slate-400 font-medium">{userRole}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Dashboard</h1>
      </div>

      {/* 5 Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-[#030514] p-4 rounded-xl border border-slate-800 shadow-sm flex flex-col justify-between space-y-2">
            <span className="text-xs font-semibold text-slate-400">{stat.label}</span>
            <div className="text-2xl font-extrabold text-slate-100">{stat.value}</div>
            <span className={`text-xs font-semibold ${stat.changeColor}`}>{stat.change}</span>
          </div>
        ))}
      </div>

      {/* Middle Row: Pipeline & Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pipeline Overview */}
        <div className="bg-[#030514] p-6 rounded-xl border border-slate-800 shadow-sm">
          <h2 className="text-base font-bold text-slate-100 mb-6">Pipeline Overview</h2>
          <div className="flex items-center justify-between gap-6">
            {/* Funnel Visual */}
            <div className="w-1/2 flex flex-col items-center gap-1.5">
              <div className="w-full h-8 bg-blue-600 rounded-sm clip-funnel-1 shadow-sm"></div>
              <div className="w-[82%] h-8 bg-sky-400 rounded-sm clip-funnel-2 shadow-sm"></div>
              <div className="w-[64%] h-8 bg-emerald-300 rounded-sm clip-funnel-3 shadow-sm"></div>
              <div className="w-[46%] h-8 bg-emerald-500 rounded-sm clip-funnel-4 shadow-sm"></div>
              <div className="w-[28%] h-8 bg-teal-200/70 rounded-sm clip-funnel-5 shadow-sm"></div>
            </div>

            {/* Stage List */}
            <div className="w-1/2 space-y-3.5 text-xs font-medium">
              {pipelineData.map((item, i) => (
                <div key={i} className="flex justify-between items-center text-slate-300">
                  <span className="text-slate-400">{item.stage}</span>
                  <span className="font-bold text-slate-100">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Status Overview */}
        <div className="bg-[#030514] p-6 rounded-xl border border-slate-800 shadow-sm">
          <h2 className="text-base font-bold text-slate-100 mb-4">Status Overview</h2>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Donut Chart with Center Text */}
            <div className="relative w-48 h-48 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="count"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-lg font-bold text-slate-100">{totalPipeline.toLocaleString()}</span>
                <span className="text-xs text-slate-400 font-medium">Total</span>
              </div>
            </div>

            {/* Legend List */}
            <div className="space-y-2.5 w-full sm:w-auto">
              {statusData.map((item, i) => (
                <div key={i} className="flex items-center justify-between gap-6 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                    <span className="font-semibold text-slate-300">{item.name}</span>
                  </div>
                  <span className="text-slate-400 font-medium">{item.percentage} ({item.count})</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Recent Activities & Upcoming Interviews */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <div className="bg-[#030514] p-6 rounded-xl border border-slate-800 shadow-sm">
          <h2 className="text-base font-bold text-slate-100 mb-4">Recent Activities</h2>
          <div className="space-y-3.5">
            {recentActivities.map((act, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-lg border border-slate-800 bg-[#030514]`}>
                    {getIcon(act.icon_type)}
                  </div>
                  <span className="font-semibold text-slate-200">{act.title}</span>
                </div>
                <span className="text-slate-400">{act.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Interviews */}
        <div className="bg-[#030514] p-6 rounded-xl border border-slate-800 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-base font-bold text-slate-100">Upcoming Interviews</h2>
            <button className="text-xs font-bold text-blue-400 hover:text-blue-300">View All</button>
          </div>
          <div className="space-y-4">
            {upcomingInterviews.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-xs py-1">
                <span className="font-bold text-slate-100 w-20">{item.time}</span>
                <span className="font-semibold text-slate-300 flex-1">{item.role}</span>
                <span className="text-slate-400 font-medium">{item.candidate}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

