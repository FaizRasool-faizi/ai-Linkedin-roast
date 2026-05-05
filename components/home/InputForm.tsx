"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AnalysisDisplay from "../results/AnalysisDisplay";
import confetti from "canvas-confetti";

export default function InputForm() {
  const [url, setUrl] = useState("");
  const [targetJob, setTargetJob] = useState("Software Engineer (AI & Full-Stack Development)");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [statusIndex, setStatusIndex] = useState(0);
  const [importHint, setImportHint] = useState<string | null>(null);

  useEffect(() => {
    const importFromLocalStorage = () => {
      try {
        const importedProfileData = localStorage.getItem("lr_import_profileData");
        const importedTargetJob = localStorage.getItem("lr_import_targetJob");
        const importedAt = localStorage.getItem("lr_importedAt");

        if (importedProfileData && importedProfileData.trim()) {
          setUrl(importedProfileData);
          if (importedTargetJob && importedTargetJob.trim()) setTargetJob(importedTargetJob);
          setImportHint(
            `Imported from LinkedIn${importedAt ? ` (${new Date(importedAt).toLocaleString()})` : ""}.`
          );
          // one-time use so refresh doesn't keep overwriting
          localStorage.removeItem("lr_import_profileData");
          localStorage.removeItem("lr_import_targetJob");
          localStorage.removeItem("lr_importedAt");
        }
      } catch {
        // ignore storage errors (private mode, etc.)
      }
    };

    importFromLocalStorage();
    window.addEventListener("storage", importFromLocalStorage);

    const onImportEvent = (e: Event) => {
      const detail = (e as CustomEvent)?.detail as
        | { profileData?: string; targetJob?: string; importedAt?: string }
        | undefined;
      if (!detail?.profileData || !detail.profileData.trim()) return;
      setUrl(detail.profileData);
      if (detail.targetJob && detail.targetJob.trim()) setTargetJob(detail.targetJob);
      setImportHint(
        `Imported from LinkedIn${detail.importedAt ? ` (${new Date(detail.importedAt).toLocaleString()})` : ""}.`
      );
    };
    window.addEventListener("lr-import", onImportEvent as EventListener);

    // If the extension opened us with ?import=1, poll briefly for late-arriving imports.
    const shouldPoll =
      typeof window !== "undefined" &&
      new URLSearchParams(window.location.search).get("import") === "1";
    let poll: NodeJS.Timeout | undefined;
    let stop: NodeJS.Timeout | undefined;
    if (shouldPoll) {
      poll = setInterval(importFromLocalStorage, 500);
      stop = setTimeout(() => {
        if (poll) clearInterval(poll);
      }, 10000);
    }

    return () => {
      window.removeEventListener("storage", importFromLocalStorage);
      window.removeEventListener("lr-import", onImportEvent as EventListener);
      if (poll) clearInterval(poll);
      if (stop) clearTimeout(stop);
    };
  }, []);

  // Fun status messages to keep the user engaged during the "Groq" speed burst
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
    } else {
      setStatusIndex(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      setError("Paste your LinkedIn ‘About’/‘Experience’ text (or a URL) in the second box first.");
      return;
    }

    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileData: url, targetJob }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        setError(data?.error ?? "Request failed. Please try again.");
        return;
      }

      setResult(data);

      // 🔥 Fixed Confetti Logic
      // If score is a string like "8.5", we convert to number
      const numericScore = typeof data.score === 'string' ? parseFloat(data.score) * 10 : data.score;

      if (numericScore >= 70) {
        // We use a slight timeout to ensure the DOM is ready
        setTimeout(() => {
          confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            zIndex: 999, // Ensure it stays on top of the UI
            colors: ["#6366f1", "#a855f7", "#ec4899"],
          });
        }, 300);
      }

    } catch (error) {
      console.error("Error:", error);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-12">
      {importHint ? (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 border border-emerald-500/20 bg-emerald-500/5 rounded-2xl text-center text-emerald-300 text-sm"
        >
          {importHint}
        </motion.div>
      ) : null}
      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 border border-red-500/20 bg-red-500/5 rounded-2xl text-center text-red-300"
        >
          {error}
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="relative group">
        <div className="flex flex-col gap-3 p-2 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl transition-all duration-300 focus-within:border-indigo-500/50">
          <input
            type="text"
            placeholder="Target job (e.g., Product Designer, Data Analyst, Backend Engineer)..."
            className="w-full bg-transparent px-4 py-3 outline-none text-white placeholder:text-gray-500 border border-white/10 rounded-xl focus:border-indigo-500/40"
            value={targetJob}
            onChange={(e) => setTargetJob(e.target.value)}
          />
          <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="Paste LinkedIn URL or your About + Experience text..."
            className="flex-1 bg-transparent px-4 py-3 outline-none text-white placeholder:text-gray-500"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>{statuses[statusIndex]}</span>
              </div>
            ) : (
              "Analyze Me"
            )}
          </button>
          </div>
        </div>
      </form>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 h-40 bg-white/5 rounded-3xl animate-pulse" />
              <div className="h-40 bg-white/5 rounded-3xl animate-pulse" />
            </div>
            <div className="h-64 bg-white/5 rounded-3xl animate-pulse w-full" />
          </motion.div>
        ) : result ? (
          <motion.div
            key="results"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 100 }}
          >
            <AnalysisDisplay data={result} />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}