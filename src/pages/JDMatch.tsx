import { useState, useEffect } from "react";
import { Filter, Search, RefreshCw, UserCheck } from "lucide-react";
import { matchResumes, getParsedResumeSummary, type MatchFilterParams } from "../utils/Api";

export default function JDMatch() {
  const [loading, setLoading] = useState(false);

  // Dynamic dropdown options state fetched from /api/v1/resumes/parsed-summary
  const [summaryOptions, setSummaryOptions] = useState<{
    locations: string[];
    total_experience_years: number[];
    primary_skills: string[];
    frameworks: string[];
    databases: string[];
    designations: string[];
    roles: string[];
    year_of_passing: string[];
    experience_levels: string[];
    ai_technical_scores: number[];
  }>({
    locations: [],
    total_experience_years: [],
    primary_skills: [],
    frameworks: [],
    databases: [],
    designations: [],
    roles: [],
    year_of_passing: [],
    experience_levels: [],
    ai_technical_scores: [],
  });

  // Filter States
  const [jobTitle, setJobTitle] = useState("");
  const [minExp, setMinExp] = useState<number | "">("");
  const [maxExp, setMaxExp] = useState<number | "">("");
  const [location, setLocation] = useState("");
  const [yearOfPassing, setYearOfPassing] = useState("");
  const [skillInput, setSkillInput] = useState("");

  const [matchedResumes, setMatchedResumes] = useState<any[]>([]);
  const [showFilters, setShowFilters] = useState(true);

  // Fetch parsed resume summary dropdown values
  useEffect(() => {
    const fetchSummaryDropdowns = async () => {
      try {
        const res = await getParsedResumeSummary();
        
        if (res) {
          setSummaryOptions({
            locations: res.locations || [],
            total_experience_years: res.total_experience_years || [],
            primary_skills: res.primary_skills || [],
            frameworks: res.frameworks || [],
            databases: res.databases || [],
            designations: res.designations || [],
            roles: res.roles || [],
            year_of_passing: res.year_of_passing || [],
            experience_levels: res.experience_levels || [],
            ai_technical_scores: res.ai_technical_scores || [],
          });
        }
      } catch (err) {
        console.error("Failed to load parsed resume summary options:", err);
      }
    };

    fetchSummaryDropdowns();
  }, []);

  // Fetch matched resumes whenever search button is clicked or initial load
  const fetchMatchedCandidates = async () => {
    setLoading(true);
    try {
      const skillsArray = skillInput
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const params: MatchFilterParams = {
        job_title: jobTitle || undefined,
        min_experience: minExp !== "" ? Number(minExp) : undefined,
        max_experience: maxExp !== "" ? Number(maxExp) : undefined,
        location: location || undefined,
        year_of_passing: yearOfPassing || undefined,
        skills: skillsArray.length > 0 ? skillsArray : undefined,
      };

      const res = await matchResumes(params);
      const items = Array.isArray(res) ? res : res.resumes || [];
      setMatchedResumes(items);
    } catch (err) {
      console.error("Error matching resumes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatchedCandidates();
  }, []);

  return (
    <div className="bg-[#030514] text-slate-100 min-h-screen p-6 rounded-2xl space-y-6 font-sans">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100">JD Matching & Candidate Filter</h1>
          <p className="text-xs text-slate-400">Match resume documents in MongoDB against Job Description parameters</p>
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 bg-[#030514] border border-blue-500/60 text-blue-400 px-4 py-2 rounded-xl text-xs font-bold hover:bg-blue-950/30 transition-colors shadow-sm"
        >
          <Filter size={14} />
          {showFilters ? "Hide Filter Panel" : "Show Filter Panel"}
        </button>
      </div>

      {/* Multi-Filter Input Card Panel */}
      {showFilters && (
        <div className="bg-[#090d21] p-5 rounded-2xl border border-slate-800 space-y-4 shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <h2 className="text-xs font-extrabold text-indigo-400 uppercase tracking-wider flex items-center gap-2">
              <Filter size={14} /> JD Filter Parameters
            </h2>
            <button
              onClick={fetchMatchedCandidates}
              disabled={loading}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-md disabled:opacity-50"
            >
              {loading ? <RefreshCw size={14} className="animate-spin" /> : <Search size={14} />}
              Apply & Search Params
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
            {/* Filter 1: Job Title / Role Dropdown */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-400 block">Job Title / Role</label>
              <select
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="w-full bg-[#030514] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="">All Job Titles / Roles</option>
                {summaryOptions.roles.length > 0 && (
                  <optgroup label="Roles">
                    {summaryOptions.roles.map((r, i) => (
                      <option key={`role-${i}`} value={r}>{r}</option>
                    ))}
                  </optgroup>
                )}
                {summaryOptions.designations.length > 0 && (
                  <optgroup label="Designations">
                    {summaryOptions.designations.map((d, i) => (
                      <option key={`desg-${i}`} value={d}>{d}</option>
                    ))}
                  </optgroup>
                )}
              </select>
            </div>

            {/* Filter 2: Min & Max Experience Dropdowns */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-400 block">Experience Range (Years)</label>
              <div className="flex items-center gap-2">
                <select
                  value={minExp}
                  onChange={(e) => setMinExp(e.target.value !== "" ? Number(e.target.value) : "")}
                  className="w-1/2 bg-[#030514] border border-slate-800 rounded-xl px-2 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="">Min Exp</option>
                  {summaryOptions.total_experience_years.map((y, i) => (
                    <option key={`min-${i}`} value={y}>{y} Yrs</option>
                  ))}
                </select>
                <span className="text-slate-500 text-xs">-</span>
                <select
                  value={maxExp}
                  onChange={(e) => setMaxExp(e.target.value !== "" ? Number(e.target.value) : "")}
                  className="w-1/2 bg-[#030514] border border-slate-800 rounded-xl px-2 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="">Max Exp</option>
                  {summaryOptions.total_experience_years.map((y, i) => (
                    <option key={`max-${i}`} value={y}>{y} Yrs</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Filter 3: Location Dropdown */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-400 block">Location</label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-[#030514] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="">All Locations</option>
                {summaryOptions.locations.map((loc, i) => (
                  <option key={`loc-${i}`} value={loc}>{loc}</option>
                ))}
              </select>
            </div>

            {/* Filter 4: Year of Passing Dropdown */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-400 block">Year of Passing</label>
              <select
                value={yearOfPassing}
                onChange={(e) => setYearOfPassing(e.target.value)}
                className="w-full bg-[#030514] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="">All Years of Passing</option>
                {summaryOptions.year_of_passing.map((y, i) => (
                  <option key={`yop-${i}`} value={y}>{y}</option>
                ))}
              </select>
            </div>

            {/* Filter 5: Required Skills Checkbox Selection Popover / Grid */}
            <div className="space-y-1 md:col-span-5 pt-2 border-t border-slate-800/60">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider block">
                  Select Skills (Checkboxes)
                </label>
                {skillInput && (
                  <button
                    onClick={() => setSkillInput("")}
                    className="text-[10px] text-rose-400 hover:underline font-semibold cursor-pointer"
                  >
                    Clear All Selected Skills
                  </button>
                )}
              </div>

              {/* Skills Checkboxes Categories */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-[#030514] p-3.5 rounded-xl border border-slate-800 max-h-48 overflow-y-auto">
                {/* Primary Skills */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block border-b border-slate-800 pb-1">
                    Primary Skills
                  </span>
                  {summaryOptions.primary_skills.length > 0 ? (
                    summaryOptions.primary_skills.map((s, i) => {
                      const selectedList = skillInput.split(",").map((item) => item.trim()).filter(Boolean);
                      const isChecked = selectedList.includes(s);

                      return (
                        <label key={`ps-chk-${i}`} className="flex items-center gap-2 text-xs text-slate-300 hover:text-white cursor-pointer select-none py-0.5">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSkillInput((prev) => {
                                  const list = prev.split(",").map((item) => item.trim()).filter(Boolean);
                                  return [...list, s].join(", ");
                                });
                              } else {
                                setSkillInput((prev) => {
                                  const list = prev.split(",").map((item) => item.trim()).filter(Boolean);
                                  return list.filter((item) => item !== s).join(", ");
                                });
                              }
                            }}
                            className="rounded border-slate-700 bg-slate-900 accent-indigo-600 w-3.5 h-3.5 cursor-pointer"
                          />
                          <span className="truncate">{s}</span>
                        </label>
                      );
                    })
                  ) : (
                    <span className="text-[11px] text-slate-500 block">No skills parsed.</span>
                  )}
                </div>

                {/* Frameworks */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block border-b border-slate-800 pb-1">
                    Frameworks
                  </span>
                  {summaryOptions.frameworks.length > 0 ? (
                    summaryOptions.frameworks.map((f, i) => {
                      const selectedList = skillInput.split(",").map((item) => item.trim()).filter(Boolean);
                      const isChecked = selectedList.includes(f);

                      return (
                        <label key={`fw-chk-${i}`} className="flex items-center gap-2 text-xs text-slate-300 hover:text-white cursor-pointer select-none py-0.5">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSkillInput((prev) => {
                                  const list = prev.split(",").map((item) => item.trim()).filter(Boolean);
                                  return [...list, f].join(", ");
                                });
                              } else {
                                setSkillInput((prev) => {
                                  const list = prev.split(",").map((item) => item.trim()).filter(Boolean);
                                  return list.filter((item) => item !== f).join(", ");
                                });
                              }
                            }}
                            className="rounded border-slate-700 bg-slate-900 accent-indigo-600 w-3.5 h-3.5 cursor-pointer"
                          />
                          <span className="truncate">{f}</span>
                        </label>
                      );
                    })
                  ) : (
                    <span className="text-[11px] text-slate-500 block">No frameworks parsed.</span>
                  )}
                </div>

                {/* Databases */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block border-b border-slate-800 pb-1">
                    Databases
                  </span>
                  {summaryOptions.databases.length > 0 ? (
                    summaryOptions.databases.map((db, i) => {
                      const selectedList = skillInput.split(",").map((item) => item.trim()).filter(Boolean);
                      const isChecked = selectedList.includes(db);

                      return (
                        <label key={`db-chk-${i}`} className="flex items-center gap-2 text-xs text-slate-300 hover:text-white cursor-pointer select-none py-0.5">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSkillInput((prev) => {
                                  const list = prev.split(",").map((item) => item.trim()).filter(Boolean);
                                  return [...list, db].join(", ");
                                });
                              } else {
                                setSkillInput((prev) => {
                                  const list = prev.split(",").map((item) => item.trim()).filter(Boolean);
                                  return list.filter((item) => item !== db).join(", ");
                                });
                              }
                            }}
                            className="rounded border-slate-700 bg-slate-900 accent-indigo-600 w-3.5 h-3.5 cursor-pointer"
                          />
                          <span className="truncate">{db}</span>
                        </label>
                      );
                    })
                  ) : (
                    <span className="text-[11px] text-slate-500 block">No databases parsed.</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Active Filter Skills Tags Bar */}
          <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold text-slate-400 mr-1">Active Filter Skills:</span>
            {skillInput ? (
              <div className="flex flex-wrap gap-1.5 flex-1">
                {skillInput
                  .split(",")
                  .map((item) => item.trim())
                  .filter(Boolean)
                  .map((sk, idx) => (
                    <span
                      key={idx}
                      className="bg-indigo-950/80 border border-indigo-700/60 text-indigo-200 text-xs px-2.5 py-0.5 rounded-lg font-semibold flex items-center gap-1.5"
                    >
                      {sk}
                      <button
                        type="button"
                        onClick={() => {
                          setSkillInput((prev) => {
                            const list = prev.split(",").map((item) => item.trim()).filter(Boolean);
                            return list.filter((item) => item !== sk).join(", ");
                          });
                        }}
                        className="text-indigo-400 hover:text-white font-bold ml-0.5"
                      >
                        ×
                      </button>
                    </span>
                  ))}
              </div>
            ) : (
              <span className="text-xs text-slate-500 italic">No skill checkboxes selected.</span>
            )}
          </div>
        </div>
      )}

      {/* Matched Results Table Section */}
      <div className="bg-[#030514] rounded-2xl p-6 border border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <UserCheck size={18} className="text-emerald-400" />
            <h2 className="text-sm font-bold text-slate-100">
              Matched Candidates ({matchedResumes.length})
            </h2>
          </div>
          <span className="text-xs text-slate-400">
            Results from <code className="text-indigo-400 font-mono">/api/v1/resumes/match</code>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                <th className="py-3 px-3">Candidate Name</th>
                <th className="py-3 px-3">Designation / Role</th>
                <th className="py-3 px-3">Experience</th>
                <th className="py-3 px-3">Location</th>
                <th className="py-3 px-3">Primary Skills</th>
                <th className="py-3 px-3">AI Tech Score</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw size={16} className="animate-spin text-indigo-500" />
                      <span>Fetching matched candidates from backend API...</span>
                    </div>
                  </td>
                </tr>
              ) : matchedResumes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No matching candidate records found. Try adjusting filter parameters.
                  </td>
                </tr>
              ) : (
                matchedResumes.map((row) => {
                  const p = row.parsed_data || {};
                  const evalInfo = row.ai_evaluation || {};
                  const name = p.full_name || p.name || row.original_filename || "Candidate";
                  const role = p.designation || p.role || "Software Professional";
                  const exp = p.total_experience_years !== undefined && p.total_experience_years !== null
                    ? `${p.total_experience_years} Yrs`
                    : p.years_of_experience !== undefined
                    ? `${p.years_of_experience} Yrs`
                    : "N/A";
                  const loc = p.location || "N/A";
                  const skillsList: string[] = p.primary_skills || p.skills || [];
                  const score = evalInfo.ai_technical_score ?? 0;

                  return (
                    <tr key={row.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-3.5 px-3 font-bold text-slate-100">{name}</td>
                      <td className="py-3.5 px-3 text-slate-300 font-medium">{role}</td>
                      <td className="py-3.5 px-3 text-slate-400">{exp}</td>
                      <td className="py-3.5 px-3 text-slate-400">{loc}</td>
                      <td className="py-3.5 px-3">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {skillsList.slice(0, 4).map((s, idx) => (
                            <span key={idx} className="bg-indigo-950/60 border border-indigo-800/40 text-indigo-300 text-[10px] px-2 py-0.5 rounded">
                              {s}
                            </span>
                          ))}
                          {skillsList.length > 4 && (
                            <span className="text-[10px] text-slate-500 font-semibold self-center">
                              +{skillsList.length - 4} more
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="font-bold text-emerald-400 text-xs">
                          {score}%
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        {row.s3_url ? (
                          <a
                            href={row.s3_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 bg-indigo-600/20 border border-indigo-500/40 text-indigo-300 hover:bg-indigo-600/40 px-3 py-1 rounded-lg text-xs font-semibold transition-colors"
                          >
                            View Resume
                          </a>
                        ) : (
                          <span className="text-slate-500 text-xs">No File</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


