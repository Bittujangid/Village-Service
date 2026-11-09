import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

/**
 * Responsive Modal Component
 *
 * Mobile (<sm): Full-screen modal (w-full h-full) rendered via createPortal directly
 *               in document.body. This ensures the header is ALWAYS pinned at the top (y = 0),
 *               the sticky footer is pinned at the bottom, and virtual keyboard popups or
 *               focus changes NEVER shift the modal off-screen or leave blank dead zones.
 * Desktop (sm+): Centered floating dialog with max-h-[90vh], rounded-2xl, and backdrop blur.
 */
const Modal = ({ isOpen, onClose, title, children, maxWidth = 'max-w-2xl' }) => {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && isOpen) onClose();
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex flex-col sm:items-center sm:justify-center bg-black/60 backdrop-blur-xs sm:p-4 overflow-hidden"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`w-full h-full sm:h-auto sm:max-h-[90vh] ${maxWidth} bg-white sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden`}
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

        {/* Content area: flex-1 flex flex-col min-h-0 so child form can scroll independently */}
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;
