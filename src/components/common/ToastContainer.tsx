import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-0 sm:right-6 left-0 sm:left-auto z-50 flex flex-col items-center sm:items-end gap-2 max-w-sm sm:max-w-md mx-auto sm:mx-0 w-full px-4 sm:px-0 pointer-events-none">
      {toasts.map((toast) => {
        let bg = 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100';
        let icon = <Info className="w-5 h-5 text-blue-500 shrink-0" />;

        if (toast.tipo === 'exito') {
          bg = 'bg-emerald-50 dark:bg-emerald-950/90 border-emerald-200 dark:border-emerald-800 text-emerald-950 dark:text-emerald-100';
          icon = <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />;
        } else if (toast.tipo === 'advertencia') {
          bg = 'bg-amber-50 dark:bg-amber-950/90 border-amber-200 dark:border-amber-800 text-amber-950 dark:text-amber-100';
          icon = <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />;
        } else if (toast.tipo === 'error') {
          bg = 'bg-red-50 dark:bg-red-950/90 border-red-200 dark:border-red-800 text-red-950 dark:text-red-100';
          icon = <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />;
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 sm:p-4 rounded-2xl border shadow-xl transition-all animate-in fade-in slide-in-from-top-3 duration-250 w-full ${bg}`}
          >
            {icon}
            <div className="flex-1 text-xs sm:text-sm font-semibold leading-snug">
              {toast.mensaje}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded transition"
              aria-label="Cerrar notificación"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
