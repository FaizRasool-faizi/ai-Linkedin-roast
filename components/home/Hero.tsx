"use client";
import { motion } from "framer-motion";

export default function Hero() {
  return (
    <div className="text-center space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight">
          Get <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Roasted.</span> <br />
          Get <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Hired.</span>
        </h1>
      </motion.div>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed"
      >
        Paste your LinkedIn URL and let our AI analyze your profile. 
        Get a brutal roast, a professional score, and a 7-day action plan.
      </motion.p>
    </div>
  );
}