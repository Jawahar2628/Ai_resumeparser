import { useState } from "react";
import { UploadCloud, FileText, CheckCircle2, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Upload() {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [pollingError, setPollingError] = useState<string | null>(null);
  const navigate = useNavigate();

  const steps = [
    { number: 1, title: "Upload", active: true },
    { number: 2, title: "Parse & Extract", active: false },
    { number: 3, title: "AI Analysis", active: false },
    { number: 4, title: "Complete", active: false },
  ];

  const recentUploads = [
    { name: "John_Doe_Resume.pdf", time: "2 mins ago", type: "pdf", status: "completed" },
    { name: "Priya_S_Resume.docx", time: "15 mins ago", type: "docx", status: "completed" },
    { name: "Ramesh_K_Resume.pdf", time: "1 hour ago", type: "pdf", status: "completed" },
  ];

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleParse = async () => {
    if (!file) return;
    setIsParsing(true);
    setPollingError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('http://127.0.0.1:8000/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed. Ensure backend is running.');
      }

      const data = await response.json();
      const newCandidateId = data.candidate_id;

      // Start polling
      const pollInterval = setInterval(async () => {
        try {
          const statusRes = await fetch(`http://127.0.0.1:8000/api/candidates/${newCandidateId}`);
          if (statusRes.ok) {
            const statusData = await statusRes.json();
            if (statusData.status === 'completed') {
              clearInterval(pollInterval);
              setIsParsing(false);
              navigate(`/evaluation/${newCandidateId}`);
            } else if (statusData.status && statusData.status.startsWith('error')) {
              clearInterval(pollInterval);
              setIsParsing(false);
              setPollingError(statusData.status);
            }
          }
        } catch (e) {
          console.error("Polling error", e);
        }
      }, 2000);
    } catch (e: any) {
      setIsParsing(false);
      setPollingError(e.message || "Failed to start upload");
    }
  };

  return (
    <div className="bg-[#030514] text-slate-100 min-h-screen p-6 rounded-2xl space-y-6 font-sans">
      {/* Title Header */}
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-bold text-slate-100">Resume Upload</h1>
      </div>

      {/* Main Container Card Wrapper */}
      <div className="bg-[#030514] rounded-2xl p-8 border border-slate-800 shadow-sm space-y-8">
        {/* Step Wizard Header */}
        <div className="flex items-center justify-between max-w-3xl mx-auto px-4 py-2 border-b border-slate-800 pb-6">
          {steps.map((step, idx) => (
            <div key={step.number} className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${step.active ? "bg-blue-600 text-white" : "bg-slate-900 text-slate-400 border border-slate-800"
                  }`}>
                  {step.number}
                </span>
                <span className={`text-xs font-bold ${step.active ? "text-blue-400" : "text-slate-400"}`}>
                  {step.title}
                </span>
              </div>
              {idx < steps.length - 1 && (
                <span className="text-slate-600 mx-4 font-light text-sm">→</span>
              )}
            </div>
          ))}
        </div>

        {/* Content Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left / Drag & Drop Upload Zone (2 cols) */}
          <div className="lg:col-span-2">
            <div
              className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center transition-all duration-300 ${isDragging ? "border-blue-500 bg-blue-950/20" : "border-slate-800 bg-[#030514] hover:border-blue-500/50"
                }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {/* Cloud Icon */}
              <div className="relative mb-4 flex items-center justify-center">
                <UploadCloud className="text-slate-600 w-24 h-24 stroke-1" />
                <span className="absolute text-blue-500 text-xl font-bold">↑</span>
              </div>

              <h3 className="text-base font-bold text-slate-100 mb-4">
                Drag & Drop your resume here
              </h3>

              <span className="text-xs text-slate-400 mb-4">or</span>

              <label className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold cursor-pointer transition-colors shadow-sm mb-6">
                Browse Files
                <input type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={handleFileInput} />
              </label>

              <span className="text-xs text-slate-400 mb-8">
                Supports PDF, DOC, DOCX (Max 20MB)
              </span>

              {/* Divider */}
              <div className="w-full flex items-center gap-4 mb-6">
                <div className="h-px bg-slate-800 flex-1"></div>
                <span className="text-xs text-slate-400 font-medium">or</span>
                <div className="h-px bg-slate-800 flex-1"></div>
              </div>

              {/* LinkedIn Import Button */}
              <button className="flex items-center justify-center gap-2 border border-slate-800 hover:bg-slate-900 text-slate-200 px-6 py-2.5 rounded-xl text-xs font-bold transition-colors w-full max-w-xs shadow-sm bg-[#030514]">
                <span className="bg-[#0a66c2] text-white w-4 h-4 rounded-xs flex items-center justify-center text-[10px] font-bold">
                  in
                </span>
                Import from LinkedIn
              </button>
            </div>

            {/* Selected File & Actions */}
            {file && (
              <div className="mt-4 p-4 rounded-xl border border-slate-800 bg-[#030514] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="text-blue-400" size={20} />
                  <div>
                    <p className="text-xs font-bold text-slate-100">{file.name}</p>
                    <p className="text-[11px] text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>

                <button
                  onClick={handleParse}
                  disabled={isParsing}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
                >
                  {isParsing ? (
                    <>
                      <Loader2 className="animate-spin" size={14} />
                      Parsing...
                    </>
                  ) : (
                    <>
                      Start Parsing
                    </>
                  )}
                </button>
              </div>
            )}

            {pollingError && (
              <div className="mt-4 p-3 bg-red-950/30 border border-red-800/40 rounded-xl text-xs text-red-400">
                <strong>Error:</strong> {pollingError}
              </div>
            )}
          </div>

          {/* Right Column: Tips & Recent Uploads */}
          <div className="space-y-6">
            {/* Upload Tips Box */}
            <div className="bg-[#030514] p-6 rounded-2xl border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-slate-100">Upload Tips</h3>
              <ul className="space-y-3 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-slate-500 text-base leading-none">◇</span>
                  <span>Upload latest resume</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-slate-500 text-base leading-none">◇</span>
                  <span>Ensure all sections are clear</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-slate-500 text-base leading-none">◇</span>
                  <span>Supported formats: PDF, DOC, DOCX</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-slate-500 text-base leading-none">◇</span>
                  <span>Max file size: 20MB</span>
                </li>
              </ul>
            </div>

            {/* Recent Uploads Box */}
            <div className="bg-[#030514] p-6 rounded-2xl border border-slate-800 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-100">Recent Uploads</h3>
              <div className="space-y-3">
                {recentUploads.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-1.5 rounded-lg ${item.type === 'pdf' ? 'bg-slate-900 border border-slate-800 text-white' : 'bg-blue-600 text-white'}`}>
                        <FileText size={14} />
                      </div>
                      <span className="font-bold text-slate-200">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 text-[11px]">{item.time}</span>
                      <CheckCircle2 size={16} className="text-emerald-500" />
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2 text-right">
                <button className="text-xs font-bold text-blue-400 hover:text-blue-300">
                  View All
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


