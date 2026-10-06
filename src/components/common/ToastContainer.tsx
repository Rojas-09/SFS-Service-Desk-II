import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 sm:top-5 sm:right-6 z-50 flex flex-col items-end gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        let accentBorder = 'border-l-4 border-l-blue-600';
        let icon = <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />;

        if (toast.tipo === 'exito') {
          accentBorder = 'border-l-4 border-l-emerald-600';
          icon = <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />;
        } else if (toast.tipo === 'advertencia') {
          accentBorder = 'border-l-4 border-l-amber-500';
          icon = <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />;
        } else if (toast.tipo === 'error') {
          accentBorder = 'border-l-4 border-l-rose-600';
          icon = <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />;
        }

        return (
          <div
            key={toast.id}
            role="status"
            aria-live="polite"
            className={`pointer-events-auto flex items-start gap-3 p-3.5 bg-white dark:bg-[#0D1E38] border border-slate-200 dark:border-[#1B2F52] ${accentBorder} rounded-xl shadow-xl transition-all animate-in fade-in slide-in-from-top-2 duration-200 w-full text-slate-800 dark:text-slate-100`}
          >
            {icon}
            <div className="flex-1 text-xs font-semibold leading-relaxed">
              {toast.mensaje}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 -mr-1 -mt-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              aria-label="Cerrar notificación"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
