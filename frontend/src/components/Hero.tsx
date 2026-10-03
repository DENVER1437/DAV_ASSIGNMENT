import React from 'react';
import {
  Compass,
  Database,
  ArrowRight,
  Zap,
  Loader2,
  CheckCircle2,
  Activity,
  Shield,
  Navigation,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface HeroProps {
  onStartSearch: () => void;
  onGoToDatabase: () => void;
  isDatabaseReady: boolean;
  totalHospitals: number;
  onLoadDemoDataset?: () => Promise<void>;
  isDemoLoading?: boolean;
  detectedLocality?: string | null;
  onDetectLocation?: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  onStartSearch,
  onGoToDatabase,
  isDatabaseReady,
  totalHospitals,
  onLoadDemoDataset,
  isDemoLoading = false,
  detectedLocality,
  onDetectLocation,
}) => {
  return (
    <section className="relative overflow-hidden pt-6 pb-8 sm:pt-10 sm:pb-12 border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      
      {/* ================= Subtle Medical Routing Network Canvas ================= */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none" aria-hidden="true">
        <svg
          className="absolute w-full h-full opacity-40 dark:opacity-25"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0d9488" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.1" />
            </linearGradient>
            <pattern id="dotGrid" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1" className="fill-slate-300 dark:fill-slate-700" opacity="0.6" />
            </pattern>
          </defs>

          {/* Minimal coordinate dot grid */}
          <rect width="100%" height="100%" fill="url(#dotGrid)" />

          {/* Abstract routing paths */}
          <path
            d="M 120 40 Q 320 120 540 80 T 960 140 T 1400 90"
            fill="none"
            stroke="url(#routeGradient)"
            strokeWidth="1.2"
            strokeDasharray="4 6"
          />
          <path
            d="M 200 180 Q 480 90 760 160 T 1250 110"
            fill="none"
            stroke="url(#routeGradient)"
            strokeWidth="1.2"
            strokeDasharray="6 8"
          />

          {/* Ambient Node 1: Left */}
          <circle cx="240" cy="95" r="3.5" className="fill-teal-500/70" />
          <circle cx="240" cy="95" r="9" className="stroke-teal-500/30 fill-none" strokeWidth="1" />

          {/* Ambient Node 2: Center (Incident origin) */}
          <circle cx="760" cy="160" r="4.5" className="fill-emerald-500/80" />
          <circle cx="760" cy="160" r="12" className="stroke-emerald-500/40 fill-none animate-ping" strokeWidth="1" style={{ animationDuration: '3s' }} />

          {/* Ambient Node 3: Right (Hospital destination) */}
          <circle cx="1180" cy="115" r="4" className="fill-teal-600/70" />
          <circle cx="1180" cy="115" r="10" className="stroke-teal-600/30 fill-none" strokeWidth="1" />
        </svg>

        {/* Soft centered ambient light */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[260px] bg-gradient-to-b from-teal-500/8 via-emerald-500/4 to-transparent rounded-full blur-3xl pointer-events-none" />
      </div>

      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 relative z-10 text-center space-y-4 sm:space-y-5">
        

        {/* ================= Main Headline & Concise Supporting Text ================= */}
        <div className="space-y-2.5">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.12]"
          >
            Emergency care,
            <br />
            <span className="text-teal-600 dark:text-teal-400">
              when every second matters.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-xl mx-auto leading-relaxed font-normal"
          >
            Precision clinical routing for acute emergencies. Matches real-time ICU vacancies, specialized emergency facilities, and travel distance across verified hospital centers.
          </motion.p>
        </div>

        {/* ================= 300ms & 400ms: Primary & Secondary CTAs ================= */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-wrap items-center justify-center gap-2.5 pt-1"
        >
          {!isDatabaseReady ? (
            <>
              <button
                type="button"
                onClick={onLoadDemoDataset}
                disabled={isDemoLoading}
                className="group relative flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-bold text-xs sm:text-sm shadow-md shadow-teal-600/20 transition-all duration-150 transform hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-60 cursor-pointer"
              >
                {isDemoLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Initializing Facilities...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
                    <span>Initialize 10,000 Hospitals</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={onGoToDatabase}
                className="flex items-center space-x-2 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/70 text-slate-800 dark:text-slate-200 font-semibold text-xs sm:text-sm transition-all duration-150 transform hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer"
              >
                <Database className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                <span>Upload Custom CSV</span>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={onStartSearch}
                className="group flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-bold text-xs sm:text-sm shadow-md shadow-teal-600/20 transition-all duration-150 transform hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer"
              >
                <Compass className="w-4 h-4" />
                <span>Find Emergency Hospital</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
              </button>

              <button
                type="button"
                onClick={onGoToDatabase}
                className="flex items-center space-x-2 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/70 text-slate-800 dark:text-slate-200 font-semibold text-xs sm:text-sm transition-all duration-150 transform hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer"
              >
                <Database className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                <span>Explore Hospital Network</span>
              </button>
            </>
          )}
        </motion.div>

        {/* ================= 500ms: Compact Operational Status Area ================= */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="pt-2 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-slate-600 dark:text-slate-400"
        >
          <div className="flex items-center space-x-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="font-medium text-slate-700 dark:text-slate-300">Live Hospital Availability</span>
          </div>

          <div className="flex items-center space-x-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
            <span className="font-medium text-slate-700 dark:text-slate-300">Location-Aware Routing</span>
          </div>

          <div className="flex items-center space-x-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
            <span className="font-medium text-slate-700 dark:text-slate-300">Emergency Facility Matching</span>
          </div>
        </motion.div>

      </div>
    </section>
  );
};
