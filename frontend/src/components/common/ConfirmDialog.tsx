import React, { type MouseEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { IoMdAlert, IoMdClose } from 'react-icons/io';
import { Button } from './Button';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: 'primary' | 'danger' | 'success';
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirmer',
  cancelLabel = 'Annuler',
  confirmVariant = 'danger',
  onConfirm,
  onCancel,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[10000] flex items-end sm:items-center justify-center bg-black/70 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-[max(0.75rem,env(safe-area-inset-top))] sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onCancel}
        >
          <motion.div
            className="w-full max-w-md rounded-t-3xl sm:rounded-3xl border border-white/10 bg-[#10203A]/95 p-5 shadow-2xl backdrop-blur-xl"
            initial={{ opacity: 0, y: 32, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            onClick={(e: MouseEvent<HTMLDivElement>) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl bg-psg-red/15 text-psg-red">
                  <IoMdAlert className="text-2xl" />
                </div>
                <div>
                  <h3 className="font-display text-xl font-bold uppercase tracking-wide text-white">
                    {title}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-text-secondary">{message}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onCancel}
                className="rounded-xl p-2 text-text-tertiary transition hover:bg-white/10 hover:text-white"
                aria-label="Fermer"
              >
                <IoMdClose className="text-xl" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Button type="button" variant="secondary" className="w-full" onClick={onCancel}>
                {cancelLabel}
              </Button>
              <Button type="button" variant={confirmVariant} className="w-full" onClick={onConfirm}>
                {confirmLabel}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
