/**
 * Toast Context for global notifications
 *
 * Mobile-friendly stacked toasts with dismiss button, icons and progress bar.
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoMdCheckmarkCircle, IoMdClose, IoMdInformationCircle, IoMdWarning, IoMdAlert } from 'react-icons/io';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

interface ToastContextType {
  showToast: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
}

const TOAST_DURATION_MS = 4200;
const MAX_TOASTS = 3;

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: 'success' | 'info' | 'warning' | 'error' = 'info') => {
    const id = Math.random().toString(36).substring(7);
    const newToast: Toast = { id, message, type };

    setToasts((prev) => [...prev.slice(-(MAX_TOASTS - 1)), newToast]);

    setTimeout(() => {
      dismissToast(id);
    }, TOAST_DURATION_MS);
  }, [dismissToast]);

  const getToastConfig = (type: Toast['type']) => {
    switch (type) {
      case 'success':
        return {
          wrapper: 'border-fifa-green/60 bg-[#0E2A1A]/95 text-white',
          iconWrap: 'bg-fifa-green/20 text-fifa-green',
          progress: 'bg-fifa-green',
          icon: <IoMdCheckmarkCircle className="text-xl" />,
          label: 'Succès',
        };
      case 'error':
        return {
          wrapper: 'border-red-500/60 bg-[#2C1114]/95 text-white',
          iconWrap: 'bg-red-500/20 text-red-400',
          progress: 'bg-red-500',
          icon: <IoMdAlert className="text-xl" />,
          label: 'Erreur',
        };
      case 'warning':
        return {
          wrapper: 'border-yellow-500/60 bg-[#2D2410]/95 text-white',
          iconWrap: 'bg-yellow-500/20 text-yellow-300',
          progress: 'bg-yellow-400',
          icon: <IoMdWarning className="text-xl" />,
          label: 'Attention',
        };
      default:
        return {
          wrapper: 'border-psg-blue/50 bg-[#10203A]/95 text-white',
          iconWrap: 'bg-psg-blue/20 text-psg-blue',
          progress: 'bg-psg-blue',
          icon: <IoMdInformationCircle className="text-xl" />,
          label: 'Info',
        };
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      <div
        className="pointer-events-none fixed inset-x-0 bottom-3 z-[100] flex flex-col items-center gap-2 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:top-24 sm:right-4 sm:bottom-auto sm:left-auto sm:w-[26rem] sm:items-stretch sm:px-0 sm:pb-0"
        aria-live="polite"
        aria-atomic="true"
      >
        <AnimatePresence initial={false}>
          {toasts.map((toast) => {
            const config = getToastConfig(toast.type);
            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: 16, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.96 }}
                className={`pointer-events-auto w-full overflow-hidden rounded-2xl border shadow-2xl backdrop-blur-xl ${config.wrapper}`}
              >
                <div className="flex items-start gap-3 p-4">
                  <div className={`mt-0.5 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl ${config.iconWrap}`}>
                    {config.icon}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/60">
                      {config.label}
                    </p>
                    <p className="mt-1 text-sm font-medium leading-5 text-white break-words">
                      {toast.message}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => dismissToast(toast.id)}
                    className="rounded-xl p-2 text-white/60 transition hover:bg-white/10 hover:text-white"
                    aria-label="Fermer la notification"
                  >
                    <IoMdClose className="text-lg" />
                  </button>
                </div>

                <motion.div
                  className={`h-1 ${config.progress}`}
                  initial={{ scaleX: 1 }}
                  animate={{ scaleX: 0 }}
                  transition={{ duration: TOAST_DURATION_MS / 1000, ease: 'linear' }}
                  style={{ originX: 0 }}
                />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};
