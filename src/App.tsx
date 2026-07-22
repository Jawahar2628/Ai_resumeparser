import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Sidebar } from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Upload from "./pages/Upload";
import Database from "./pages/Database";
import Evaluation from "./pages/Evaluation";
import JDMatch from "./pages/JDMatch";

export default function App() {
  return (
    <Router>
      <div className="flex h-screen overflow-hidden bg-[#020617] text-slate-50">
        <Sidebar />
        <main className="flex-1 overflow-y-auto relative">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/20 via-[#020617] to-[#020617] -z-10" />
          <div className="p-8 h-full">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/upload" element={<Upload />} />
              <Route path="/database" element={<Database />} />
              <Route path="/evaluation" element={<Evaluation />} />
              <Route path="/evaluation/:id" element={<Evaluation />} />
              <Route path="/jd-match" element={<JDMatch />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}
