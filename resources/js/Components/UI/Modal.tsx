import React, { useEffect, useRef } from 'react';
import { sound } from '@/Utils/sound';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  showCloseButton?: boolean;
}

const maxWidthMap = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  '2xl': 'max-w-5xl',
  full: 'max-w-[96vw]',
};

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  maxWidth = 'lg',
  showCloseButton = true,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        sound.playClick();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
      className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-6"
    >
      {/* Backdrop Gelap Tegas Kontras Tinggi */}
      <div
        className="fixed inset-0 bg-black/60 transition-opacity"
        onClick={() => {
          sound.playClick();
          onClose();
        }}
      />

      {/* Konten Modal - Tanpa Animasi Berputar/Pusing */}
      <div
        ref={modalRef}
        className={`
          relative bg-white rounded-3xl shadow-2xl w-full ${maxWidthMap[maxWidth]}
          border-4 border-gray-200 z-10 flex flex-col max-h-[92vh] overflow-hidden
        `}
      >
        {/* Header Modal */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between px-6 py-5 border-b-2 border-gray-100 bg-gray-50/70">
            {title ? (
              <h3 id="modal-title" className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                {title}
              </h3>
            ) : <div />}

            {showCloseButton && (
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  onClose();
                }}
                className="
                  p-2.5 rounded-2xl bg-gray-200 hover:bg-rose-100 hover:text-rose-700
                  text-gray-700 transition-colors focus:outline-none focus:ring-4 focus:ring-gray-300
                  touch-manipulation cursor-pointer
                "
                aria-label="Tutup Jendela"
              >
                <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Body Modal */}
        <div className="p-6 overflow-y-auto flex-1 text-gray-800 text-lg">
          {children}
        </div>

        {/* Footer Modal */}
        {footer && (
          <div className="px-6 py-4 border-t-2 border-gray-100 bg-gray-50 flex flex-col sm:flex-row items-center justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
