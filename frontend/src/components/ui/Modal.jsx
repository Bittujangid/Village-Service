import React, { useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * Responsive Modal Component
 * On mobile: fills the overlay (fixed inset-0) via flex-1 — avoids dvh/svh
 * mismatch with Android Chrome's collapsible address + nav bars.
 * On tablet/desktop: centered card with max-height cap.
 */
const Modal = ({ isOpen, onClose, title, children, maxWidth = 'max-w-2xl' }) => {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && isOpen) onClose();
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    /*
     * Overlay: fixed inset-0 means it's exactly the visible viewport on every
     * browser/device — no viewport-unit tricks needed.
     * flex flex-col so the inner card can use flex-1 to fill it.
     */
    <div
      className="fixed inset-0 z-50 flex flex-col md:items-center md:justify-center bg-black/70 backdrop-blur-sm overflow-hidden"
      style={{ touchAction: 'pan-y' }}
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/*
       * Mobile: flex-1 fills the overlay height exactly (safe on all Android/iOS).
       * Desktop (md+): auto height capped at 90vh, centered by parent's justify-center.
       * We deliberately avoid h-[100dvh] / h-screen because Android Chrome's
       * collapsible bottom nav bar makes dvh > actual usable height → white gap.
       */}
      <div
        className={`w-full flex-1 md:flex-none md:h-auto md:max-h-[90vh] ${maxWidth} bg-white md:rounded-2xl shadow-2xl flex flex-col overflow-hidden`}
        style={{ touchAction: 'pan-y' }}
      >
        {/* Sticky Modal Header */}
        <div className="shrink-0 flex items-center justify-between px-4 sm:px-5 py-3.5 border-b border-slate-200 bg-white">
          <h2 className="text-base sm:text-xl font-bold text-slate-800 leading-tight truncate pr-2">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center w-9 h-9 rounded-full text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-900 shrink-0 cursor-pointer"
            aria-label="बंद करें (Close modal)"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Content area: flex col so GrievanceForm / StatusTracker can use flex-1 */}
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
