import React, { createContext, useContext, useState, useCallback } from 'react';
import { sound } from '@/Utils/sound';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType = 'info', duration: number = 4000) => {
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newToast: ToastMessage = { id, type, message, duration };

    // Umpan Balik Suara Sesuai Jenis Notifikasi
    if (type === 'success') sound.playChime();
    else if (type === 'error') sound.playError();
    else sound.playBeep();

    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  const success = useCallback((msg: string) => showToast(msg, 'success'), [showToast]);
  const error = useCallback((msg: string) => showToast(msg, 'error'), [showToast]);
  const warning = useCallback((msg: string) => showToast(msg, 'warning'), [showToast]);
  const info = useCallback((msg: string) => showToast(msg, 'info'), [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, success, error, warning, info }}>
      {children}
      {/* Toast Container di Pojok Kanan Atas / Atas Tengah di Mobile */}
      <div className="fixed top-5 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-50 flex flex-col gap-3 pointer-events-none">
        {toasts.map((toast) => {
          const typeConfig: Record<ToastType, { bg: string; border: string; text: string; icon: React.ReactNode }> = {
            success: {
              bg: 'bg-emerald-50',
              border: 'border-emerald-600',
              text: 'text-emerald-950',
              icon: (
                <svg className="w-8 h-8 text-emerald-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ),
            },
            error: {
              bg: 'bg-rose-50',
              border: 'border-rose-600',
              text: 'text-rose-950',
              icon: (
                <svg className="w-8 h-8 text-rose-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ),
            },
            warning: {
              bg: 'bg-amber-50',
              border: 'border-amber-500',
              text: 'text-amber-950',
              icon: (
                <svg className="w-8 h-8 text-amber-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              ),
            },
            info: {
              bg: 'bg-blue-50',
              border: 'border-blue-600',
              text: 'text-blue-950',
              icon: (
                <svg className="w-8 h-8 text-blue-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ),
            },
          };

          const cur = typeConfig[toast.type];

          return (
            <div
              key={toast.id}
              role="alert"
              className={`
                pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border-4 shadow-xl
                ${cur.bg} ${cur.border} ${cur.text} select-none
              `}
            >
              {cur.icon}
              <div className="flex-1 text-base sm:text-lg font-bold leading-snug">
                {toast.message}
              </div>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="p-1 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-black/5"
                aria-label="Tutup Notifikasi"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast harus digunakan di dalam ToastProvider');
  }
  return context;
};
