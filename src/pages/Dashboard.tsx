import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Briefcase, CheckCircle, Clock, FileText, TrendingUp, Users } from 'lucide-react';

export default function Dashboard() {
  const stats = [
    { label: "Total Resumes", value: "1,248", icon: <FileText size={20} />, color: "text-blue-400", bg: "bg-blue-400/10" },
    { label: "AI Parsed Today", value: "45", icon: <CheckCircle size={20} />, color: "text-green-400", bg: "bg-green-400/10" },
    { label: "Pending Interviews", value: "12", icon: <Clock size={20} />, color: "text-amber-400", bg: "bg-amber-400/10" },
    { label: "Offers Released", value: "8", icon: <Briefcase size={20} />, color: "text-purple-400", bg: "bg-purple-400/10" },
  ];

  const skillData = [
    { subject: 'Java', A: 120, fullMark: 150 },
    { subject: 'React', A: 98, fullMark: 150 },
    { subject: 'AWS', A: 86, fullMark: 150 },
    { subject: 'NodeJS', A: 99, fullMark: 150 },
    { subject: 'SQL', A: 85, fullMark: 150 },
    { subject: 'Python', A: 65, fullMark: 150 },
  ];

  const hiringPipeline = [
    { name: 'Sourced', candidates: 400 },
    { name: 'Screened', candidates: 300 },
    { name: 'Interviewed', candidates: 150 },
    { name: 'Offered', candidates: 50 },
    { name: 'Hired', candidates: 35 },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-1">Recruitment Overview</h1>
          <p className="text-slate-400">AI-powered insights across your hiring pipeline.</p>
        </div>
        <button className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-lg font-medium transition-colors border border-slate-700">
          Download Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="glass-card p-6 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color}`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-sm font-medium text-slate-400">{stat.label}</p>
              <h3 className="text-2xl font-bold text-slate-100">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-card p-6">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <TrendingUp className="text-indigo-400" size={20} />
            Hiring Pipeline
          </h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hiringPipeline} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                <XAxis type="number" stroke="#94a3b8" />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" width={80} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                  itemStyle={{ color: '#818cf8' }}
                />
                <Bar dataKey="candidates" fill="#6366f1" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-6">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <Users className="text-sky-400" size={20} />
            Candidate Skill Distribution
          </h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={skillData}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 150]} stroke="#334155" />
                <Radar name="Skills" dataKey="A" stroke="#38bdf8" fill="#38bdf8" fillOpacity={0.3} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
