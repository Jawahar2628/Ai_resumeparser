import { useState, useEffect, useRef } from "react";
import { Filter, Search, RefreshCw, UserCheck, X } from "lucide-react";
import { matchResumes, getParsedResumeSummary, type MatchFilterParams } from "../utils/Api";

type FilterCategory = "Job Title" | "Location" | "Skill" | "Year of Passing" | "Min Exp" | "Max Exp" | "Keyword";

interface FilterPill {
  id: string;
  category: FilterCategory;
  value: string | number;
}

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

  // Filter States (Unified)
  const [pills, setPills] = useState<FilterPill[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [matchedResumes, setMatchedResumes] = useState<any[]>([]);
  const [showFilters, setShowFilters] = useState(true);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
      const getValues = (cat: FilterCategory) => pills.filter((p) => p.category === cat).map((p) => String(p.value));

      const params: MatchFilterParams = {
        job_title: getValues("Job Title").length > 0 ? getValues("Job Title") : undefined,
        min_experience: pills.find(p => p.category === "Min Exp")?.value as number | undefined,
        max_experience: pills.find(p => p.category === "Max Exp")?.value as number | undefined,
        location: getValues("Location").length > 0 ? getValues("Location") : undefined,
        year_of_passing: getValues("Year of Passing").length > 0 ? getValues("Year of Passing") : undefined,
        skills: getValues("Skill").length > 0 ? getValues("Skill") : undefined,
        keywords: getValues("Keyword").length > 0 ? getValues("Keyword") : undefined,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Helper to add a pill and replace if singular category
  const addPill = (category: FilterCategory, value: string | number) => {
    setPills((prev) => {
      // Min Exp and Max Exp are singular
      if (category === "Min Exp" || category === "Max Exp") {
        const filtered = prev.filter((p) => p.category !== category);
        return [...filtered, { id: `${category}-${value}-${Date.now()}`, category, value }];
      }
      // For others, avoid duplicates
      if (prev.some((p) => p.category === category && p.value === value)) {
        return prev;
      }
      return [...prev, { id: `${category}-${value}-${Date.now()}`, category, value }];
    });
    setSearchInput("");
    setIsDropdownOpen(false);
  };

  const removePill = (id: string) => {
    setPills((prev) => prev.filter((p) => p.id !== id));
  };

  const clearAllPills = () => {
    setPills([]);
  };

  // Generate suggestions based on search input
  const getSuggestions = () => {
    const lowerInput = searchInput.toLowerCase().trim();
    
    // Helper to filter options
    const filterOpts = (opts: (string | number)[], category: FilterCategory) => {
      return Array.from(new Set(opts))
        .filter(opt => String(opt).toLowerCase().includes(lowerInput))
        .map(opt => ({ category, value: opt }));
    };

    const suggestions: { category: FilterCategory, value: string | number }[] = [
      ...filterOpts([...summaryOptions.roles, ...summaryOptions.designations], "Job Title"),
      ...filterOpts(summaryOptions.locations, "Location"),
      ...filterOpts([...summaryOptions.primary_skills, ...summaryOptions.frameworks, ...summaryOptions.databases], "Skill"),
      ...filterOpts(summaryOptions.year_of_passing, "Year of Passing"),
    ];

    // Smart Experience Parsing
    // If input contains a number, suggest it dynamically for Min/Max Experience
    const numMatch = lowerInput.match(/\d+(\.\d+)?/);
    if (numMatch) {
      const num = Number(numMatch[0]);
      if (lowerInput.includes("min") || lowerInput.includes(">")) {
        suggestions.push({ category: "Min Exp", value: num });
      } else if (lowerInput.includes("max") || lowerInput.includes("<")) {
        suggestions.push({ category: "Max Exp", value: num });
      } else {
        suggestions.push({ category: "Min Exp", value: num });
        suggestions.push({ category: "Max Exp", value: num });
      }
    } else {
      // Fallback to options from the database if they type something like "exp"
      suggestions.push(...filterOpts(summaryOptions.total_experience_years, "Min Exp"));
      suggestions.push(...filterOpts(summaryOptions.total_experience_years, "Max Exp"));
    }

    // Always offer a global keyword search option
    if (searchInput.trim().length > 0) {
      suggestions.push({ category: "Keyword", value: searchInput.trim() });
    }

    // Deduplicate suggestions just in case
    const uniqueSuggestions = suggestions.filter((v, i, a) => a.findIndex(t => (t.category === v.category && t.value === v.value)) === i);

    return uniqueSuggestions.slice(0, 15); // limit to 15 suggestions to prevent overflow
  };

  const suggestions = getSuggestions();

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
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-3">
            <h2 className="text-xs font-extrabold text-indigo-400 uppercase tracking-wider flex items-center gap-2">
              <Filter size={14} /> Unified JD Filter
            </h2>
            <button
              onClick={fetchMatchedCandidates}
              disabled={loading}
              className="flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-md disabled:opacity-50 w-full md:w-auto"
            >
              {loading ? <RefreshCw size={14} className="animate-spin" /> : <Search size={14} />}
              Apply & Search
            </button>
          </div>

          <div className="space-y-3">
            <label className="text-[11px] font-semibold text-slate-400 block">
              Search by Skills, Location, Role, Experience, or Year of Passing
            </label>
            
            <div className="relative" ref={dropdownRef}>
              <div className="flex items-center bg-[#030514] border border-slate-700 rounded-xl px-3 py-2 focus-within:ring-1 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition-all">
                <Search size={16} className="text-slate-500 mr-2" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => {
                    setSearchInput(e.target.value);
                    setIsDropdownOpen(true);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && searchInput.trim()) {
                      addPill("Keyword", searchInput.trim());
                    }
                  }}
                  onFocus={() => setIsDropdownOpen(true)}
                  placeholder="e.g. 'React', 'New York', 'Software Engineer'..."
                  className="w-full bg-transparent text-sm text-slate-200 focus:outline-none placeholder-slate-600"
                />
                {searchInput && (
                  <button onClick={() => setSearchInput("")} className="text-slate-500 hover:text-slate-300 transition-colors">
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Autocomplete Dropdown */}
              {isDropdownOpen && searchInput && (
                <div className="absolute z-10 w-full mt-1 bg-[#0a0f25] border border-slate-700 rounded-xl shadow-2xl max-h-64 overflow-y-auto">
                  {suggestions.length > 0 ? (
                    <ul className="py-2">
                      {suggestions.map((s, idx) => (
                        <li
                          key={idx}
                          onClick={() => addPill(s.category, s.value)}
                          className="px-4 py-2 hover:bg-indigo-600/20 cursor-pointer flex flex-col group transition-colors"
                        >
                          <span className="text-xs font-bold text-indigo-400 group-hover:text-indigo-300">
                            {s.category}
                          </span>
                          <span className="text-sm text-slate-200 group-hover:text-white">
                            {s.value} {s.category.includes("Exp") ? "Yrs" : ""}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="p-4 text-xs text-slate-500 text-center">
                      No matching options found.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Active Pills Display */}
            <div className="pt-3 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-400">Active Filters:</span>
                {pills.length > 0 && (
                  <button
                    onClick={clearAllPills}
                    className="text-[10px] text-rose-400 hover:underline font-semibold cursor-pointer"
                  >
                    Clear All
                  </button>
                )}
              </div>
              
              <div className="flex flex-wrap gap-2 min-h-[32px]">
                {pills.length > 0 ? (
                  pills.map((pill) => (
                    <span
                      key={pill.id}
                      className="bg-indigo-950/80 border border-indigo-700/60 text-indigo-200 text-xs px-3 py-1.5 rounded-xl font-semibold flex items-center gap-2 group hover:border-indigo-500 transition-colors"
                    >
                      <span className="opacity-70 text-[10px] uppercase tracking-wider">{pill.category}:</span>
                      <span>{pill.value} {pill.category.includes("Exp") ? "Yrs" : ""}</span>
                      <button
                        type="button"
                        onClick={() => removePill(pill.id)}
                        className="text-indigo-400 hover:text-white font-bold ml-1 flex items-center bg-indigo-900/50 rounded-full p-0.5 group-hover:bg-indigo-500/50 transition-colors"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-500 italic mt-1">No filters selected. All candidates will be shown.</span>
                )}
              </div>
            </div>
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


