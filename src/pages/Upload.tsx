import { useState } from "react";
import { UploadCloud, File, CheckCircle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function Upload() {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parsed, setParsed] = useState(false);
  const [candidateId, setCandidateId] = useState<number | null>(null);
  const [pollingError, setPollingError] = useState<string | null>(null);
  const navigate = useNavigate();

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
      setCandidateId(newCandidateId);
      
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
    <div className="max-w-4xl mx-auto h-full flex flex-col">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Resume Upload & Parsing</h1>
        <p className="text-slate-400">Upload candidate resumes (PDF, DOCX) for AI-powered data extraction.</p>
      </div>

      {!parsed ? (
        <div className="flex-1 flex flex-col gap-6">
          <div
            className={`border-2 border-dashed rounded-3xl p-12 flex flex-col items-center justify-center transition-all duration-300 ${
              isDragging
                ? "border-indigo-400 bg-indigo-500/10"
                : "border-slate-700 hover:border-indigo-500/50 bg-slate-900/40"
            } glass-card`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="w-20 h-20 rounded-full bg-indigo-500/20 flex items-center justify-center mb-6">
              <UploadCloud className="text-indigo-400" size={40} />
            </div>
            <h3 className="text-xl font-medium mb-2">Drag & Drop your files here</h3>
            <p className="text-slate-400 mb-6 text-center max-w-md">
              Support for single or multiple uploads. Formats accepted: PDF, DOC, DOCX. Maximum file size: 5MB.
            </p>
            
            <label className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-medium cursor-pointer transition-colors shadow-lg shadow-indigo-500/20">
              Browse Files
              <input type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={handleFileInput} />
            </label>
          </div>

          {file && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6 rounded-2xl flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-slate-800 rounded-xl">
                  <File className="text-sky-400" size={24} />
                </div>
                <div>
                  <h4 className="font-medium text-slate-200">{file.name}</h4>
                  <p className="text-sm text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>

              <button
                onClick={handleParse}
                disabled={isParsing}
                className="flex items-center gap-2 bg-gradient-to-r from-sky-500 to-indigo-500 text-white px-6 py-2.5 rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isParsing ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Extracting AI Data...
                  </>
                ) : (
                  <>
                    <CheckCircle size={18} />
                    Run AI Parser
                  </>
                )}
              </button>
            </motion.div>
          )}

          {isParsing && (
            <div className="mt-8 space-y-4">
              <h3 className="text-lg font-medium text-slate-300 flex items-center gap-2">
                <Loader2 className="animate-spin text-indigo-400" size={20} />
                AI is analyzing the resume in the background...
              </h3>
              <div className="space-y-3">
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 3, ease: "linear" }}
                    className="h-full bg-gradient-to-r from-indigo-500 to-sky-400"
                  />
                </div>
                <div className="flex justify-between text-sm text-slate-400">
                  <span>Extracting Personal Info...</span>
                  <span>Identifying Skills...</span>
                </div>
              </div>
            </div>
          )}
          {pollingError && (
            <div className="mt-4 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-300">
              <p><strong>Error parsing resume:</strong> {pollingError}</p>
            </div>
          )}
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex-1"
        >
          <div className="glass-card p-8 rounded-3xl border border-green-500/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8">
              <div className="w-32 h-32 bg-green-500/10 rounded-full blur-3xl absolute top-0 right-0" />
              <CheckCircle className="text-green-400 relative z-10" size={60} />
            </div>
            
            <h2 className="text-2xl font-bold mb-2">Extraction Complete!</h2>
            <p className="text-slate-400 mb-8">AI successfully generated the candidate profile.</p>

            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Personal Info</h3>
                <div className="glass p-4 rounded-xl space-y-2">
                  <div className="flex justify-between"><span className="text-slate-400">Name:</span> <span className="font-medium">John Doe</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Email:</span> <span className="font-medium">john.doe@example.com</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Experience:</span> <span className="font-medium">8 Years</span></div>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Top Skills</h3>
                <div className="glass p-4 rounded-xl flex flex-wrap gap-2">
                  {['Java', 'Spring Boot', 'Microservices', 'AWS', 'Kafka'].map(skill => (
                    <span key={skill} className="bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full text-sm font-medium border border-indigo-500/20">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <button 
              onClick={() => navigate(`/evaluation/${candidateId}`)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-xl font-medium transition-colors w-full shadow-lg shadow-indigo-500/20"
            >
              View Full AI Evaluation Dashboard
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
