import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title?: string;
  message: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div
      aria-live="polite"
      aria-label="Notifications"
      className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0"
    >
      <AnimatePresence>
        {toasts.map((toast) => {
          let Icon = Info;
          let borderClass = 'border-slate-200 dark:border-slate-800';
          let iconColor = 'text-teal-600 dark:text-teal-400';
          let bgClass = 'bg-white/95 dark:bg-slate-900/95';

          if (toast.type === 'success') {
            Icon = CheckCircle2;
            iconColor = 'text-emerald-500';
            borderClass = 'border-emerald-200 dark:border-emerald-900/50';
          } else if (toast.type === 'error') {
            Icon = AlertCircle;
            iconColor = 'text-rose-500';
            borderClass = 'border-rose-200 dark:border-rose-900/50';
          } else if (toast.type === 'warning') {
            Icon = AlertTriangle;
            iconColor = 'text-amber-500';
            borderClass = 'border-amber-200 dark:border-amber-900/50';
          }

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className={`pointer-events-auto p-3.5 rounded-xl border ${borderClass} ${bgClass} shadow-lg backdrop-blur-md flex items-start gap-3 text-xs`}
            >
              <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${iconColor}`} />
              <div className="flex-1 min-w-0">
                {toast.title && (
                  <p className="font-bold text-slate-900 dark:text-white leading-tight">
                    {toast.title}
                  </p>
                )}
                <p className="text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                  {toast.message}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onDismiss(toast.id)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 -mr-1 -mt-1 rounded-lg transition"
                aria-label="Close notification"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
