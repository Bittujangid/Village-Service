import React from 'react';
import { Clock, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { useLang } from '../../context/LanguageContext';

/**
 * StatusBadge component with modern styling and bilingual support
 *
 * @param {object} props
 * @param {'Pending'|'In Progress'|'Resolved'|string} props.status
 * @param {string} [props.className]
 */
const StatusBadge = ({ status, className = '' }) => {
  const { lang, t } = useLang();
  const normalized = (status || '').toString().toLowerCase().trim();

  if (normalized === 'resolved' || normalized === 'समाधान' || normalized === 'समाधान पूर्ण' || normalized === 'पूर्ण' || normalized === 'निस्तारित') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100/90 text-emerald-800 border border-emerald-300 shadow-2xs ${className}`}
      >
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
        {t.statusResolved}
      </span>
    );
  }

  if (normalized === 'in progress' || normalized === 'in_progress' || normalized === 'in-progress' || normalized === 'जारी' || normalized === 'प्रगति पर') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100/90 text-blue-800 border border-blue-300 shadow-2xs ${className}`}
      >
        <Loader2 className="w-3.5 h-3.5 text-blue-700 animate-spin" />
        {t.statusInProgress}
      </span>
    );
  }

  if (normalized === 'rejected' || normalized === 'अस्वीकृत') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100/90 text-rose-800 border border-rose-300 shadow-2xs ${className}`}
      >
        <XCircle className="w-3.5 h-3.5 text-rose-700" />
        {t.statusRejected}
      </span>
    );
  }

  // Default to Pending / लंबित
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100/90 text-amber-800 border border-amber-300 shadow-2xs ${className}`}
    >
      <Clock className="w-3.5 h-3.5 text-amber-700" />
      {t.statusPending}
    </span>
  );
};

export default StatusBadge;
