import React, { useState, useEffect } from 'react';
import { MapPin, Moon, Sun, Database, Search, Building2, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';

interface NavbarProps {
  currentTab: 'finder' | 'results' | 'database' | 'analysis';
  setCurrentTab: (tab: 'finder' | 'results' | 'database' | 'analysis') => void;
  detectedLocality?: string | null;
  onDetectLocation?: () => void;
  isDatabaseReady: boolean;
  hasSearchResults?: boolean;
  searchResultCount?: number;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  detectedLocality,
  onDetectLocation,
  isDatabaseReady,
  hasSearchResults = false,
  searchResultCount,
  darkMode,
  setDarkMode,
}) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 8);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-200 ${
        scrolled
          ? 'bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/90 dark:border-slate-800 shadow-xs'
          : 'bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm border-b border-slate-200/60 dark:border-slate-800/60'
      }`}
    >
      <div className="w-full max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-3">
        


        {/* ================= CENTER: Clean Navigation Links ================= */}
        <nav className="flex items-center space-x-1 sm:space-x-1.5" aria-label="Main Navigation">
          <button
            type="button"
            onClick={() => setCurrentTab('finder')}
            className={`relative flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
              currentTab === 'finder'
                ? 'text-teal-700 dark:text-teal-300 bg-teal-50/80 dark:bg-teal-950/40 border border-teal-200/80 dark:border-teal-800/60 shadow-2xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/60'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Find Hospital</span>
          </button>

          {/* Hospitals Tab: Only visible when search results exist */}
          {hasSearchResults && (
            <button
              type="button"
              onClick={() => setCurrentTab('results')}
              className={`relative flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
                currentTab === 'results'
                  ? 'text-teal-700 dark:text-teal-300 bg-teal-50/80 dark:bg-teal-950/40 border border-teal-200/80 dark:border-teal-800/60 shadow-2xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/60'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Hospitals</span>
              {searchResultCount !== undefined && searchResultCount > 0 && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-teal-600 text-white dark:bg-teal-500 dark:text-slate-950">
                  {searchResultCount}
                </span>
              )}
            </button>
          )}

          {/* Database Tab */}
          <button
            type="button"
            onClick={() => setCurrentTab('database')}
            className={`relative flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
              currentTab === 'database'
                ? 'text-teal-700 dark:text-teal-300 bg-teal-50/80 dark:bg-teal-950/40 border border-teal-200/80 dark:border-teal-800/60 shadow-2xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/60'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Database</span>
            {!isDatabaseReady && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" title="Database requires initialization" />
            )}
          </button>

          {/* Data Analysis Tab: Immediately AFTER Database */}
          <button
            type="button"
            onClick={() => setCurrentTab('analysis')}
            className={`relative flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
              currentTab === 'analysis'
                ? 'text-teal-700 dark:text-teal-300 bg-teal-50/80 dark:bg-teal-950/40 border border-teal-200/80 dark:border-teal-800/60 shadow-2xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/60'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Data Analysis</span>
          </button>
        </nav>

        {/* ================= RIGHT: Emergency Callouts, Location & Theme ================= */}
        <div className="flex items-center space-x-2 sm:space-x-2.5">
          
          {/* Location Indicator & Trigger */}
          <button
            type="button"
            onClick={onDetectLocation}
            title={detectedLocality ? `Active Location: ${detectedLocality}` : 'Click to detect or configure incident location'}
            className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/80 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 transition-all duration-150 active:scale-95 cursor-pointer max-w-[130px] sm:max-w-[180px]"
          >
            <span className="relative flex h-2 w-2 shrink-0">
              {detectedLocality ? (
                <>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
                </>
              ) : (
                <span className="relative inline-flex rounded-full h-2 w-2 bg-slate-400"></span>
              )}
            </span>
            <MapPin className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
            <span className="font-medium truncate text-[11px] sm:text-xs">
              {detectedLocality || 'Detect Location'}
            </span>
          </button>

          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={() => setDarkMode(!darkMode)}
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all duration-200 active:scale-95 cursor-pointer"
          >
            <motion.div
              key={darkMode ? 'dark' : 'light'}
              initial={{ rotate: -45, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              {darkMode ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600" />
              )}
            </motion.div>
          </button>

        </div>

      </div>
    </header>
  );
};
