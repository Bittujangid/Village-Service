import React, { useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * Responsive Modal Component
 * Fullscreen (100dvh) on mobile devices to prevent soft keyboard collapses,
 * centered card with controlled max-height on tablet/desktop.
 *
 * @param {object} props
 * @param {boolean} props.isOpen
 * @param {Function} props.onClose
 * @param {string} props.title
 * @param {React.ReactNode} props.children
 * @param {string} [props.maxWidth] - e.g. 'max-w-2xl' or 'max-w-3xl'
 */
const Modal = ({ isOpen, onClose, title, children, maxWidth = 'max-w-2xl' }) => {
  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
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

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col md:items-center md:justify-center bg-black/70 backdrop-blur-sm overflow-hidden animate-fadeIn"
      style={{ touchAction: 'pan-y' }}
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`w-full h-[100dvh] md:h-auto md:max-h-[90vh] ${maxWidth} bg-white md:rounded-2xl shadow-2xl flex flex-col overflow-hidden overflow-x-hidden transform transition-all duration-300 ease-out`}
        style={{ touchAction: 'pan-y' }}
      >
        {/* Modal Header (Sticky top) */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 sm:py-4 border-b border-slate-200 bg-white shrink-0">
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

        {/* Modal Content - Flex Column container for decoupled scrollable body & footer */}
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
