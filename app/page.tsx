import Hero from "@/components/home/Hero";
import InputForm from "@/components/home/InputForm";
import Background3D from "@/components/layout/Background3D";

export default function Home() {
  return (
    <main className="relative min-h-screen text-white selection:bg-indigo-500/30 overflow-x-hidden">
      {/* Three.js Background */}
      <Background3D />

      <div className="relative z-10 max-w-5xl mx-auto px-6 pt-24 pb-32">
        <Hero />
        <div className="mt-12 max-w-2xl mx-auto">
          <InputForm />
        </div>

        <div className="mt-16 max-w-2xl mx-auto">
          <div className="p-6 md:p-8 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-md">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-extrabold text-white/90">Chrome Extension</h2>
                <p className="text-gray-400 mt-1 text-sm leading-relaxed">
                  Avoid manual copy-pasting. Import your LinkedIn profile automatically 
                  while you’re logged in.
                </p>
              </div>
              <a
                href="/linkedin-roaster-extension.zip"
                className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
                download
              >
                Download Extension (.zip)
              </a>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-3 text-sm text-gray-300">
              <div className="p-4 rounded-2xl bg-black/30 border border-white/10">
                <p className="font-bold text-white/80 mb-1">Install Instructions</p>
                <ol className="list-decimal list-inside space-y-1 text-gray-400">
                  <li>Download and extract the zip file.</li>
                  <li>Go to <span className="text-white/80">chrome://extensions</span> and enable <span className="text-white/80">Developer mode</span>.</li>
                  <li>Click <span className="text-white/80">Load unpacked</span> and select the extracted folder.</li>
                </ol>
              </div>
              <div className="p-4 rounded-2xl bg-black/30 border border-white/10">
                <p className="font-bold text-white/80 mb-1">How to Use</p>
                <ol className="list-decimal list-inside space-y-1 text-gray-400">
                  <li>Open your LinkedIn profile page.</li>
                  <li>Click the extension icon and hit <span className="text-white/80">Extract Profile</span>.</li>
                  <li>Click <span className="text-white/80">Open App & Import</span> (it will auto-fill the form).</li>
                  <li>Click <span className="text-white/80">Roast My Profile</span> here to get your results.</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}