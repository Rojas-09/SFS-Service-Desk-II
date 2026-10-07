import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  return (
    <div className="fixed top-4 right-3 sm:top-5 sm:right-6 z-50 flex flex-col items-end gap-2.5 max-w-[calc(100vw-24px)] sm:max-w-sm w-full pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => {
          let accentBorder = 'border-l-4 border-l-blue-600';
          let progressBg = 'bg-blue-600';
          let icon = <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />;

          if (toast.tipo === 'exito') {
            accentBorder = 'border-l-4 border-l-emerald-600';
            progressBg = 'bg-emerald-600';
            icon = <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />;
          } else if (toast.tipo === 'advertencia') {
            accentBorder = 'border-l-4 border-l-amber-500';
            progressBg = 'bg-amber-500';
            icon = <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />;
          } else if (toast.tipo === 'error') {
            accentBorder = 'border-l-4 border-l-rose-600';
            progressBg = 'bg-rose-600';
            icon = <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />;
          }

          return (
            <motion.div
              key={toast.id}
              role="status"
              aria-live="polite"
              layout
              initial={{ opacity: 0, y: -16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 450, damping: 30 }}
              className={`pointer-events-auto relative overflow-hidden flex items-start gap-3 p-3.5 bg-white dark:bg-[#0D1E38] border border-slate-200 dark:border-[#1B2F52] ${accentBorder} rounded-xl shadow-xl w-full text-slate-800 dark:text-slate-100 backdrop-blur-md`}
            >
              {icon}
              <div className="flex-1 text-xs font-semibold leading-relaxed pr-1">
                {toast.mensaje}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 -mr-1 -mt-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition active:scale-90"
                aria-label="Cerrar notificación"
              >
                <X className="w-3.5 h-3.5" />
              </button>

              {/* Animated countdown line */}
              <motion.div
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: 4, ease: 'linear' }}
                className={`absolute bottom-0 left-0 h-[2px] ${progressBg} opacity-60`}
              />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
