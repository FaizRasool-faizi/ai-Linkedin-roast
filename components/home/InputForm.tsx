"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AnalysisDisplay from "../results/AnalysisDisplay";
import confetti from "canvas-confetti";

export default function InputForm() {
  const [profileData, setProfileData] = useState("");
  const [targetJob, setTargetJob] = useState("Software Engineer (AI & Full-Stack Development)");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [statusIndex, setStatusIndex] = useState(0);
  const [importHint, setImportHint] = useState<string | null>(null);

  useEffect(() => {
    const importFromLocalStorage = () => {
      try {
        const importedData = localStorage.getItem("lr_import_profileData");
        const importedJob = localStorage.getItem("lr_import_targetJob");
        if (importedData?.trim()) {
          setProfileData(importedData);
          if (importedJob?.trim()) setTargetJob(importedJob);
          setImportHint("Profile data successfully imported from LinkedIn!");
          localStorage.removeItem("lr_import_profileData");
          localStorage.removeItem("lr_import_targetJob");
        }
      } catch (e) {}
    };
    importFromLocalStorage();
    window.addEventListener("storage", importFromLocalStorage);
    return () => window.removeEventListener("storage", importFromLocalStorage);
  }, []);

  const statuses = [
    "Waking up the AI...",
    "Reading your bio (yikes)...",
    "Finding the perfect roast...",
    "Generating your 7-day plan...",
    "Polishing the dashboard..."
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      interval = setInterval(() => {
        setStatusIndex((prev) => (prev + 1) % statuses.length);
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileData.trim()) {
      setError("Please paste your profile text first.");
      return;
    }

    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileData, targetJob }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "Request failed");

      setResult(data);
      const numericScore = typeof data.score === 'string' ? parseFloat(data.score) * 10 : data.score;
      if (numericScore >= 70) {
        setTimeout(() => {
          confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, zIndex: 999 });
        }, 300);
      }
    } catch (err: any) {
      setError(err.message || "Network error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-8">
      {importHint && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 border border-emerald-500/20 bg-emerald-500/5 rounded-xl text-center text-emerald-300 text-sm">
          {importHint}
        </motion.div>
      )}
      {error && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 border border-red-500/20 bg-red-500/5 rounded-xl text-center text-red-300">
          {error}
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-white/5 border border-white/10 rounded-[2rem] backdrop-blur-xl transition-all focus-within:border-indigo-500/50">
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold ml-2">Target Job Role</label>
          <input
            type="text"
            className="w-full bg-white/5 px-4 py-3 outline-none text-white placeholder:text-gray-600 border border-white/5 rounded-2xl focus:border-indigo-500/30 transition-all"
            value={targetJob}
            onChange={(e) => setTargetJob(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold ml-2">Profile Content (About + Experience)</label>
          <textarea
            placeholder="Paste your LinkedIn profile text here for a brutal roast... (No URLs please)"
            className="w-full h-40 bg-white/5 px-4 py-3 outline-none text-white placeholder:text-gray-600 border border-white/5 rounded-2xl focus:border-indigo-500/30 transition-all resize-none"
            value={profileData}
            onChange={(e) => setProfileData(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-900 text-white py-4 rounded-2xl font-black text-lg transition-all shadow-xl shadow-indigo-500/20 active:scale-[0.98]"
        >
          {loading ? (
            <div className="flex items-center justify-center gap-3">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span className="animate-pulse">{statuses[statusIndex]}</span>
            </div>
          ) : (
            "ANALYZE ME 🔥"
          )}
        </button>
      </form>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div key="loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="h-32 bg-white/5 rounded-3xl animate-pulse" />
            <div className="h-64 bg-white/5 rounded-3xl animate-pulse" />
          </motion.div>
        ) : result ? (
          <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <AnalysisDisplay data={result} />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}