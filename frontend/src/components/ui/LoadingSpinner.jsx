import React from 'react';

/**
 * LoadingSpinner component
 *
 * @param {object} props
 * @param {'sm'|'md'|'lg'} [props.size='md']
 * @param {string} [props.label]
 * @param {string} [props.className]
 */
const LoadingSpinner = ({ size = 'md', label = 'कृपया प्रतीक्षा करें...', className = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div className={`flex flex-col items-center justify-center gap-3 p-4 ${className}`}>
      <div
        className={`${sizeClasses[size] || sizeClasses.md} border-emerald-200 border-t-emerald-700 rounded-full animate-spin`}
        role="status"
        aria-label={label}
      />
      {label && <p className="text-sm font-medium text-slate-600">{label}</p>}
    </div>
  );
};

export default LoadingSpinner;
