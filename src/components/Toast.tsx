import React from 'react';
import { CircleCheck, CircleAlert, Info, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-16 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-2">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between p-3.5 rounded-xl border shadow-xl backdrop-blur-md transition-all animate-fadeIn ${
              isSuccess
                ? 'bg-neutral-900/95 border-emerald-500/40 text-emerald-400'
                : isError
                ? 'bg-neutral-900/95 border-rose-500/40 text-rose-400'
                : 'bg-neutral-900/95 border-amber-500/40 text-amber-400'
            }`}
          >
            <div className="flex items-center gap-3 pr-2">
              {isSuccess && <CircleCheck className="w-5 h-5 shrink-0 text-emerald-400" />}
              {isError && <CircleAlert className="w-5 h-5 shrink-0 text-rose-400" />}
              {!isSuccess && !isError && <Info className="w-5 h-5 shrink-0 text-amber-400" />}
              <p className="text-sm font-medium text-gray-100">{toast.text}</p>
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 rounded-lg text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
