import React from 'react';
import { useSchoolData } from '../../context/SchoolDataContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useSchoolData();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full px-4 pointer-events-none">
      {toasts.map((toast) => {
        let bg = 'bg-emerald-600 text-white';
        let icon = <CheckCircle2 className="w-5 h-5 shrink-0" />;

        if (toast.type === 'error') {
          bg = 'bg-rose-600 text-white';
          icon = <AlertCircle className="w-5 h-5 shrink-0" />;
        } else if (toast.type === 'info') {
          bg = 'bg-sky-700 text-white';
          icon = <Info className="w-5 h-5 shrink-0" />;
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-xl shadow-xl backdrop-blur-md transition-all duration-300 animate-slide-in ${bg}`}
          >
            <div className="flex items-center gap-3">
              {icon}
              <p className="text-sm font-medium leading-snug">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 hover:bg-white/20 rounded-lg transition-colors"
              title="Tutup notifikasi"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
