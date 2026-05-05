"use client";
import { motion } from "framer-motion";

interface Props {
  title: string;
  children: React.ReactNode;
  delay?: number;
  icon?: string;
}

export default function ResultCard({ title, children, delay = 0, icon }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="p-6 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-md hover:border-indigo-500/30 transition-colors h-full"
    >
      <div className="flex items-center gap-3 mb-4">
        {icon && <span className="text-2xl">{icon}</span>}
        <h3 className="text-xl font-bold text-white/90">{title}</h3>
      </div>
      <div className="text-gray-400 leading-relaxed">
        {children}
      </div>
    </motion.div>
  );
}