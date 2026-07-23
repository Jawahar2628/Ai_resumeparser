import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Star, Plus, ChevronDown } from "lucide-react";

export default function ClientFeedback() {
  const navigate = useNavigate();
  const [decision, setDecision] = useState("Selected");
  const [nextSteps, setNextSteps] = useState("Offer will be released");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const ratings = [
    { label: "Technical Rating", stars: 5 },
    { label: "Communication Rating", stars: 5 },
    { label: "Overall Rating", stars: 5 },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  return (
    <div className="bg-[#030514] text-slate-100 min-h-screen p-6 rounded-2xl space-y-6 font-sans">
      {/* Top Header Bar */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-slate-100">Client Interview & Feedback</h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 bg-[#030514] border border-slate-800 text-slate-300 px-4 py-1.5 rounded-xl text-xs font-bold hover:bg-slate-900 transition-colors shadow-sm"
          >
            <ArrowLeft size={14} />
            Back
          </button>

          <button className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-xl text-xs font-bold transition-colors shadow-sm">
            <Plus size={14} />
            Add Feedback
          </button>
        </div>
      </div>

      {/* Top Row Overview Cards (2 Cards) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Candidate Info Card (1 Col) */}
        <div className="bg-[#030514] p-6 rounded-2xl border border-slate-800 shadow-sm flex items-center gap-4">
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80"
            alt="Vijay"
            className="w-14 h-14 rounded-full object-cover border-2 border-slate-700 flex-shrink-0 shadow-sm"
          />
          <div className="space-y-1">
            <h2 className="text-base font-extrabold text-slate-100">Vijay</h2>
            <p className="text-xs text-slate-400 font-medium">Senior Java Developer</p>
            <span className="inline-block bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
              Shortlisted
            </span>
          </div>
        </div>

        {/* Client & Interview Meta Card (2 Cols) */}
        <div className="lg:col-span-2 bg-[#030514] p-6 rounded-2xl border border-slate-800 shadow-sm grid grid-cols-2 sm:grid-cols-4 gap-6 items-center">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 block mb-1">Client</span>
            <span className="text-xs font-bold text-slate-200">TechNova Solutions</span>
          </div>

          <div>
            <span className="text-[11px] font-semibold text-slate-400 block mb-1">Interview Date</span>
            <span className="text-xs font-bold text-slate-200">25 May 2025</span>
          </div>

          <div>
            <span className="text-[11px] font-semibold text-slate-400 block mb-1">Round</span>
            <span className="text-xs font-bold text-slate-200">Final Round</span>
          </div>

          <div>
            <span className="text-[11px] font-semibold text-slate-400 block mb-1">Interviewer</span>
            <span className="text-xs font-bold text-slate-200">Mr. Suresh CTO</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Client Feedback Ratings (Left 2 cols) & Interview Decision Form (Right 1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Client Feedback Ratings & Comments */}
        <div className="lg:col-span-2 bg-[#030514] p-6 rounded-2xl border border-slate-800 shadow-sm space-y-6">
          <h3 className="text-sm font-bold text-slate-100">Client Feedback</h3>

          {/* Star Ratings List */}
          <div className="space-y-4 max-w-lg">
            {ratings.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between gap-4">
                <span className="text-xs font-medium text-slate-300">{item.label}</span>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5, 6].map((starIndex) => (
                    <Star
                      key={starIndex}
                      size={18}
                      className={starIndex <= item.stars ? "text-blue-500 fill-blue-500" : "text-slate-800"}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Client Comments Text Area Box */}
          <div className="space-y-3 pt-4 border-t border-slate-800/80">
            <h4 className="text-xs font-bold text-slate-100">Client Comments</h4>
            <div className="p-4 rounded-xl border border-slate-800 bg-[#030514] text-xs text-slate-300 leading-relaxed min-h-[100px]">
              Good technical knowledge and communication.
              <br />
              Suitable for our team.
            </div>
          </div>
        </div>

        {/* Right Column: Interview Decision Form */}
        <div className="bg-[#030514] p-6 rounded-2xl border border-slate-800 shadow-sm space-y-5 flex flex-col justify-between">
          <div className="space-y-5">
            {/* Interview Decision Dropdown */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-100 block">Interview Decision</label>
              <div className="relative">
                <select
                  value={decision}
                  onChange={(e) => setDecision(e.target.value)}
                  className="w-full bg-[#030514] border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-bold text-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 appearance-none cursor-pointer"
                >
                  <option value="Selected" className="bg-[#030514] text-emerald-400">Selected</option>
                  <option value="Rejected" className="bg-[#030514] text-rose-400">Rejected</option>
                  <option value="On Hold" className="bg-[#030514] text-amber-400">On Hold</option>
                </select>
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
              </div>
            </div>

            {/* Next Steps Input */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-100 block">Next Steps</label>
              <input
                type="text"
                value={nextSteps}
                onChange={(e) => setNextSteps(e.target.value)}
                placeholder="Enter next steps..."
                className="w-full bg-[#030514] border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>

            {/* Attachment (Optional) Upload Field */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-100 block">Attachment (Optional)</label>
              <div className="flex items-center gap-3 p-1.5 rounded-xl border border-slate-800 bg-[#030514]">
                <label className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors border border-slate-700">
                  Choose File
                  <input type="file" className="hidden" onChange={handleFileChange} />
                </label>
                <span className="text-[11px] text-slate-400 truncate flex-1">
                  {selectedFile ? selectedFile.name : "No file chosen"}
                </span>
              </div>
            </div>
          </div>

          {/* Submit Feedback Button */}
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl text-xs font-bold transition-colors shadow-sm mt-4">
            Submit Feedback
          </button>
        </div>
      </div>
    </div>
  );
}
