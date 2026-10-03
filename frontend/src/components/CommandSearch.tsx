import React, { useState } from 'react';
import { Search, Sparkles, CornerDownLeft, X } from 'lucide-react';

interface CommandSearchProps {
  onExecuteCommand: (query: string) => void;
}

const PRESET_COMMANDS = [
  'Accident & Trauma hospitals near me',
  'Cardiac emergency with ICU available',
  'Pediatric emergency within 10 km',
  'Hospitals with 24x7 Ambulance in Bengaluru',
  'Level 1 Trauma center with low wait time',
];

export const CommandSearch: React.FC<CommandSearchProps> = ({ onExecuteCommand }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onExecuteCommand(query.trim());
    }
  };

  return (
    <div className="w-full max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-2 sm:p-3">
        <form onSubmit={handleSubmit} className="flex items-center space-x-2">
          <div className="pl-2 text-teal-600 dark:text-teal-400">
            <Search className="w-5 h-5" />
          </div>

          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Command Search (e.g., 'Accident hospitals near me', 'Cardiac ICU in Delhi', 'Lowest wait ER')..."
            className="w-full py-2.5 px-2 bg-transparent text-sm sm:text-base text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
          />

          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <button
            type="submit"
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-teal-600 dark:hover:bg-teal-700 text-white text-xs sm:text-sm font-semibold transition shrink-0"
          >
            <span>Search</span>
            <CornerDownLeft className="w-3.5 h-3.5 opacity-70" />
          </button>
        </form>

        {/* Quick Suggestion Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pt-2 mt-1 border-t border-slate-100 dark:border-slate-700/60 no-scrollbar">
          <span className="text-[11px] font-semibold text-slate-400 flex items-center shrink-0">
            <Sparkles className="w-3 h-3 mr-1 text-amber-500" />
            Try:
          </span>
          {PRESET_COMMANDS.map((cmd) => (
            <button
              key={cmd}
              type="button"
              onClick={() => {
                setQuery(cmd);
                onExecuteCommand(cmd);
              }}
              className="text-[11px] px-2.5 py-1 rounded-full bg-slate-100 hover:bg-teal-50 dark:bg-slate-700/60 dark:hover:bg-slate-700 text-slate-600 hover:text-teal-700 dark:text-slate-300 transition shrink-0 whitespace-nowrap"
            >
              {cmd}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
