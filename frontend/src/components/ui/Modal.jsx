import React, { useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * Responsive Modal Component
 *
 * Mobile: bottom-sheet style — anchored at the bottom, max-h-[90vh] hard cap,
 *         internal scroll. This prevents any focus-induced viewport repaint
 *         (e.g. from radio inputs / Android Chrome virtual keyboard) from
 *         collapsing the modal height.
 * Desktop (sm+): centered card, max-h-[90vh], scrollable body.
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
     * Overlay: fixed inset-0 — exact visible viewport on every device.
     * Mobile: items-end → modal slides up from bottom as a bottom-sheet.
     * Desktop (sm+): items-center justify-center → centered dialog.
     * overflow-hidden on the overlay prevents any inner focus event from
     * causing the page underneath to scroll/repaint.
     */
    <div
      className="fixed inset-0 z-50 flex flex-col items-stretch sm:items-center sm:justify-center bg-black/90 sm:bg-black/70 backdrop-blur-sm overflow-hidden"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/*
       * The card itself:
       * Mobile:  full width, rounded top corners only, max-h-[90vh] hard cap,
       *          pushed to the bottom via mt-auto. The fixed max-h means Android
       *          Chrome viewport repaints (focus, keyboard) cannot shrink the card.
       * Desktop: centered, rounded all corners, max-h-[90vh].
       */}
      <div
        className={`w-full mt-auto sm:mt-0 sm:m-4 max-h-[90vh] ${maxWidth} bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden`}
        onClick={(e) => e.stopPropagation()}
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

        {/* Content area: flex col so GrievanceForm / StatusTracker can use flex-1 + overflow-y-auto */}
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
