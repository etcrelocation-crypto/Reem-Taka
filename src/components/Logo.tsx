import { motion } from "motion/react";

export default function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative">
        {/* Globe Grid background */}
        <svg 
          width="48" 
          height="48" 
          viewBox="0 0 48 48" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="absolute -right-2 -top-1 opacity-60"
        >
          <circle cx="24" cy="24" r="20" stroke="url(#globe-grad)" strokeWidth="0.5" />
          <ellipse cx="24" cy="24" rx="20" ry="8" stroke="url(#globe-grad)" strokeWidth="0.5" />
          <ellipse cx="24" cy="24" rx="8" ry="20" stroke="url(#globe-grad)" strokeWidth="0.5" />
          <line x1="4" y1="24" x2="44" y2="24" stroke="url(#globe-grad)" strokeWidth="0.5" />
          <line x1="24" y1="4" x2="24" y2="44" stroke="url(#globe-grad)" strokeWidth="0.5" />
          <defs>
            <linearGradient id="globe-grad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
              <stop stopColor="#c5a059" />
              <stop offset="1" stopColor="#c5a059" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>

        {/* ETC Text */}
        <motion.span 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-3xl font-serif font-black tracking-tighter relative z-10 leading-none block"
        >
          ETC
        </motion.span>
        <span className="text-[9px] uppercase tracking-[0.3em] font-medium opacity-70 block mt-0.5 whitespace-nowrap">
          Relocation Services
        </span>
      </div>
    </div>
  );
}
