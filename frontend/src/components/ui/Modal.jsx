import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, FileText } from 'lucide-react';

/**
 * Responsive Modal Component
 *
 * Mobile (<sm): Full-screen modal (w-full h-full) rendered via createPortal directly
 *               in document.body. This ensures the header is ALWAYS pinned at the top (y = 0),
 *               the sticky footer is pinned at the bottom, and virtual keyboard popups or
 *               focus changes NEVER shift the modal off-screen or leave blank dead zones.
 * Desktop (sm+): Centered floating dialog with max-h-[90vh], rounded-2xl, and backdrop blur.
 */
const Modal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  children,
  maxWidth = 'max-w-2xl',
}) => {
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
        {/* Sticky Civic Header */}
        <div className="shrink-0 px-4 sm:px-6 py-3.5 border-b border-slate-100 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shrink-0">
                {icon || <FileText className="w-4 h-4" />}
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-bold text-slate-900 tracking-tight truncate">
                  {title}
                </h3>
                {subtitle && (
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition active:scale-95 shrink-0 cursor-pointer"
              aria-label="बंद करें (Close modal)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
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
