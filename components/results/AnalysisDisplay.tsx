"use client";
import { toPng } from "html-to-image";
import { useRef } from "react";
import ResultCard from "./ResultCard";

export default function AnalysisDisplay({ data }: { data: any }) {
  const resultRef = useRef<HTMLDivElement>(null);

  const downloadImage = async () => {
    if (resultRef.current === null) return;

    try {
      const dataUrl = await toPng(resultRef.current, {
        cacheBust: true,
        backgroundColor: "#000000",
        style: {
          padding: "30px",
        },
      });

      const link = document.createElement("a");
      link.download = `linkedin-roast-report.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Image generation failed:", err);
    }
  };

  if (!data || !data.headline_suggestions || !data.action_plan) {
    return (
      <div className="mt-12 p-8 border border-red-500/20 bg-red-500/5 rounded-3xl text-center">
        <p className="text-red-400">⚠️ Analysis incomplete. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 mt-12 animate-in fade-in duration-700">
      
      {/* 📸 Area to Capture */}
      <div ref={resultRef} className="p-2 rounded-3xl bg-black space-y-6">
        
        {/* Row 1: Roast & Score */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <ResultCard title="The Roast" icon="🔥">
              <p className="text-lg italic text-indigo-300 font-medium leading-relaxed">
                "{data.roast}"
              </p>
            </ResultCard>
          </div>

          <ResultCard title="Profile Score" icon="📊">
            <div className="flex flex-col items-center justify-center h-full py-2">
              <span className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-emerald-400 to-cyan-400">
                {data.score}
              </span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mt-2">
                Out of 100
              </span>
            </div>
          </ResultCard>
        </div>

        {/* Row 2: Skill Gap Analysis (Moved Up for better visibility) */}
        {(() => { 
            console.log("Full Data from AI:", data); 
            console.log("Skill Gap Check:", data?.skill_gap);
            return null; 
        })()}

        {data && data.skill_gap ? (
          <ResultCard title="Skill Gap Analysis" icon="🎯">
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white/5 p-5 rounded-2xl border border-white/10">
                <div>
                  <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Industry Match</p>
                  <p className="text-4xl font-black text-emerald-400">
                    {data.skill_gap.match_percentage || 0}%
                  </p>
                </div>
                <div className="md:text-right">
                  <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-2">Missing Keywords</p>
                  <div className="flex flex-wrap gap-2 md:justify-end">
                    {data.skill_gap.missing_keywords?.map((keyword: string, i: number) => (
                      <span key={i} className="text-[10px] px-2 py-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg">
                        {keyword}
                      </span>
                    )) || <span className="text-[10px] text-gray-600 italic">None detected</span>}
                  </div>
                </div>
              </div>
              <div className="p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl">
                <p className="text-sm font-bold text-indigo-300 mb-3 underline decoration-indigo-500/30">Priority to Learn:</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {data.skill_gap.recommended_skills?.map((skill: string, i: number) => (
                    <div key={i} className="flex items-center gap-2 text-[11px] text-gray-400">
                      <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full shrink-0" />
                      {skill}
                    </div>
                  )) || <div className="text-[11px] text-gray-600">No specific recommendations</div>}
                </div>
              </div>
            </div>
          </ResultCard>
        ) : (
          <div className="p-4 border border-dashed border-white/10 rounded-2xl text-center text-xs text-gray-600">
            Skill Gap data not provided by AI for this specific run.
          </div>
        )}

        {/* Row 3: Actionable Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ResultCard title="Better Headlines" icon="💡">
            <ul className="space-y-3">
              {data.headline_suggestions?.map((h: string, i: number) => (
                <li key={i} className="p-3 bg-white/5 rounded-xl text-sm border border-white/5 border-l-indigo-500 border-l-2">
                  {h}
                </li>
              ))}
            </ul>
          </ResultCard>

          <ResultCard title="About Section Rewrite" icon="✍️">
            <p className="text-sm leading-relaxed text-gray-300 italic whitespace-pre-wrap">
              {data.summary_rewrite}
            </p>
          </ResultCard>
        </div>

        {/* Row 4: Growth Plan (Timeline Style) */}
        <ResultCard title="7-Day Growth Plan" icon="📅">
          <div className="space-y-4 mt-2 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-indigo-500/50 before:to-transparent">
            {data.action_plan?.map((task: string, i: number) => (
              <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                {/* Dot */}
                <div className="flex items-center justify-center w-10 h-10 rounded-full border border-indigo-500/50 bg-black text-indigo-400 text-[10px] font-bold shadow-[0_0_15px_rgba(99,102,241,0.2)] z-10 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                  D{i + 1}
                </div>
                
                {/* Content Card */}
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-indigo-500/30 transition-colors">
                  <p className="text-sm text-gray-300 leading-relaxed">
                    {task}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ResultCard>

        {/* Row 5: Viral Post with Copy Feature */}
        <ResultCard title="Viral LinkedIn Post" icon="📱">
           <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-gray-500 uppercase tracking-widest">Ready to go viral</span>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(data.linkedin_post);
                    alert("Post copied! 🚀");
                  }}
                  className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[10px] font-bold transition-all"
                >
                  Copy Post
                </button>
              </div>
              <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                <p className="text-sm text-gray-300 italic whitespace-pre-wrap">
                  {data.linkedin_post}
                </p>
              </div>
           </div>
        </ResultCard>

        {/* Watermark for image only */}
        <div className="pt-4 text-center">
            <p className="text-[10px] text-gray-700 tracking-[0.4em] uppercase">Generated by AI Persona Roast</p>
        </div>
      </div>

      {/* 🚀 MAIN ACTION BUTTONS */}
      <div className="flex flex-wrap gap-4 justify-center mt-12 pb-20">
        <button
          onClick={downloadImage}
          className="flex items-center gap-2 px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full font-bold shadow-xl shadow-emerald-500/20 transition-all active:scale-95"
        >
          Download Report Image
        </button>
        
        <button
          onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent("Just got roasted! My profile score is " + data.score + "/100. Get yours at AI-Persona-Roast!")}`, "_blank")}
          className="px-8 py-4 bg-[#1DA1F2] text-white rounded-full font-bold"
        >
          Share on X
        </button>
      </div>
    </div>
  );
}