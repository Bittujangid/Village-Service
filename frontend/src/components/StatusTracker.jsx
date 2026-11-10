import React, { useState, useEffect } from 'react';
import { 
  Search, 
  AlertCircle, 
  Clock, 
  MapPin, 
  Tag, 
  MessageSquare, 
  Calendar, 
  User, 
  ExternalLink,
  ShieldCheck,
  SearchCheck,
  Hash,
  Phone,
  Info,
  RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';
import { trackComplaint } from '../api/complaints';
import StepperStatus from './ui/StepperStatus';
import StatusBadge from './ui/StatusBadge';
import LoadingSpinner from './ui/LoadingSpinner';
import { useLang } from '../context/LanguageContext';

const StatusTracker = ({ initialQuery = '' }) => {
  const { lang, t } = useLang();
  const [lookupMode, setLookupMode] = useState('trackingId'); // 'trackingId' | 'phone'
  const [query, setQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [complaint, setComplaint] = useState(null);
  const [complaintList, setComplaintList] = useState([]);
  const [searched, setSearched] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleModeChange = (mode) => {
    if (mode === lookupMode) return;
    setLookupMode(mode);
    setQuery('');
    setSearched(false);
    setErrorMessage('');
    setComplaint(null);
    setComplaintList([]);
  };

  const handleSearch = async (e, directQuery) => {
    e?.preventDefault?.();
    // Sanitize query by removing all '#' and internal spaces
    const queryId = ((directQuery !== undefined ? directQuery : query) || '')
      .replace(/#/g, '')
      .replace(/\s+/g, '')
      .trim();

    if (!queryId) {
      toast.error(
        lookupMode === 'trackingId'
          ? (lang === 'hi' ? 'कृपया मान्य ट्रैकिंग ID दर्ज करें' : 'Please enter a valid Tracking ID')
          : (lang === 'hi' ? 'कृपया 10 अंकों का मोबाइल नंबर दर्ज करें' : 'Please enter 10-digit mobile number')
      );
      return;
    }

    if (lookupMode === 'phone' && !/^[6-9]\d{9}$/.test(queryId)) {
      toast.error(
        lang === 'hi'
          ? 'कृपया 10 अंकों का वैध मोबाइल नंबर दर्ज करें'
          : 'Please enter a valid 10-digit mobile number'
      );
      return;
    }

    setLoading(true);
    setErrorMessage('');
    setComplaint(null);
    setComplaintList([]);
    setSearched(true);

    try {
      const res = await trackComplaint(queryId);
      
      // Handle both nested data ({ success: true, data: ... }) and direct payloads
      const payload = res?.data !== undefined ? res.data : res;

      if (Array.isArray(payload) && payload.length > 0) {
        setComplaintList(payload);
        setComplaint(payload[0]);
      } else if (res?.complaints && Array.isArray(res.complaints) && res.complaints.length > 0) {
        setComplaintList(res.complaints);
        setComplaint(res.complaints[0]);
      } else if (payload && (payload.trackingId || payload._id || payload.id)) {
        setComplaint(payload);
      } else if (res?.complaint && (res.complaint.trackingId || res.complaint._id)) {
        setComplaint(res.complaint);
      } else if (res?.trackingId) {
        setComplaint(res);
      } else {
        setErrorMessage(t.trackerNotFoundDesc);
      }
    } catch (err) {
      // Surface the real error from the backend — no demo/mock fallback
      const serverMessage =
        err?.response?.data?.message ||
        err?.message ||
        (lang === 'hi' ? 'सर्वर से कनेक्ट नहीं हो सका। कृपया पुनः प्रयास करें।' : 'Could not connect to server. Please try again.');

      const isNotFound = err?.response?.status === 404;
      setErrorMessage(
        isNotFound
          ? t.trackerNotFoundDesc
          : serverMessage
      );
    } finally {
      setLoading(false);
    }
  };

  // Auto-trigger search when initialQuery is provided (e.g., from QR code or deep link)
  useEffect(() => {
    if (initialQuery && initialQuery.trim()) {
      const clean = initialQuery.trim();
      setQuery(clean);
      if (/^[6-9]\d{9}$/.test(clean)) {
        setLookupMode('phone');
      } else {
        setLookupMode('trackingId');
      }
      handleSearch(null, clean);
    }
  }, [initialQuery]);

  const formatDate = (dateString) => {
    if (!dateString) return lang === 'hi' ? 'उपलब्ध नहीं' : 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  const handleInputBlur = () => {
    // No-op: do not call window.scrollTo inside fixed modals to avoid mobile viewport collapse
  };

  return (
    <div className="flex-1 overflow-y-auto overscroll-contain px-4 sm:px-6 py-4 space-y-4 sm:space-y-5">
      {/* 1. Segmented Pill Switcher */}
      <div className="p-1 bg-slate-100 rounded-xl flex items-center gap-1">
        <button
          type="button"
          onClick={() => handleModeChange('trackingId')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs sm:text-sm transition-all duration-200 select-none cursor-pointer ${
            lookupMode === 'trackingId'
              ? 'bg-white text-slate-900 font-bold shadow-xs'
              : 'text-slate-600 hover:text-slate-900 font-medium hover:bg-slate-200/50'
          }`}
        >
          <Hash className="w-3.5 h-3.5 text-blue-600" />
          <span>{lang === 'hi' ? 'ट्रैकिंग आईडी द्वारा' : 'By Tracking ID'}</span>
        </button>

        <button
          type="button"
          onClick={() => handleModeChange('phone')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs sm:text-sm transition-all duration-200 select-none cursor-pointer ${
            lookupMode === 'phone'
              ? 'bg-white text-slate-900 font-bold shadow-xs'
              : 'text-slate-600 hover:text-slate-900 font-medium hover:bg-slate-200/50'
          }`}
        >
          <Phone className="w-3.5 h-3.5 text-blue-600" />
          <span>{lang === 'hi' ? 'मोबाइल नंबर द्वारा' : 'By Mobile Number'}</span>
        </button>
      </div>

      {/* 2. Input & Unique Rounded Action Button */}
      <form onSubmit={handleSearch} className="space-y-2">
        <div className="flex flex-col sm:flex-row items-stretch gap-2.5">
          <div className="relative flex-1">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none flex items-center">
              {lookupMode === 'trackingId' ? (
                <Hash className="w-4 h-4 text-slate-400" />
              ) : (
                <Phone className="w-4 h-4 text-slate-400" />
              )}
            </div>

            <input
              id="track-query"
              type={lookupMode === 'phone' ? 'tel' : 'text'}
              inputMode={lookupMode === 'phone' ? 'numeric' : 'text'}
              maxLength={lookupMode === 'phone' ? 10 : 25}
              value={query}
              onChange={(e) => {
                const val = lookupMode === 'phone' ? e.target.value.replace(/\D/g, '') : e.target.value;
                setQuery(val);
              }}
              onBlur={handleInputBlur}
              placeholder={
                lookupMode === 'trackingId'
                  ? (lang === 'hi' ? 'ट्रैकिंग आईडी दर्ज करें (उदा. GR-JZ11)' : 'Enter Tracking ID (e.g. GR-JZ11)')
                  : (lang === 'hi' ? '10 अंकों का मोबाइल नंबर दर्ज करें' : 'Enter 10-digit mobile number')
              }
              className="w-full min-h-[46px] pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 bg-slate-50/60 hover:bg-white focus:bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition text-sm sm:text-base font-medium"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="group w-full sm:w-auto min-h-[46px] px-6 py-2.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-[0.97] text-white font-bold text-sm sm:text-base shadow-[0_4px_14px_0_rgba(37,99,235,0.35)] flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed select-none"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin shrink-0" />
                <span>{lang === 'hi' ? 'खोज रहे हैं...' : 'Searching...'}</span>
              </>
            ) : (
              <>
                <SearchCheck className="w-4 h-4 shrink-0 group-hover:scale-110 transition-transform duration-200" />
                <span>{lang === 'hi' ? 'स्थिति जांचें' : 'Check Status'}</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* 3. Helper Tip Card */}
      <div className="flex items-start gap-2.5 p-3 rounded-xl bg-blue-50/70 border border-blue-100 text-blue-950 text-xs">
        <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          {lookupMode === 'trackingId' ? (
            <span>
              {lang === 'hi'
                ? 'SMS द्वारा प्राप्त 6-अक्षरों की संदर्भ आईडी दर्ज करें जैसे GR-JZ11 या GR-1024।'
                : 'Enter the 6-character reference ID received via SMS like GR-JZ11 or tracking number like GR-1024.'}
            </span>
          ) : (
            <span>
              {lang === 'hi'
                ? 'शिकायत दर्ज करते समय उपयोग किया गया 10 अंकों का पंजीकृत मोबाइल नंबर दर्ज करें।'
                : 'Enter the 10-digit registered mobile number used while filing the complaint to view all linked complaints.'}
            </span>
          )}
        </div>
      </div>

      {/* Loading Spinner */}
      {loading && <LoadingSpinner label={lang === 'hi' ? 'शिकायत का विवरण खोजा जा रहा है...' : 'Searching complaint records...'} />}

      {/* Error Message Card */}
      {!loading && searched && errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-600" />
          <div className="text-sm">
            <p className="font-bold">{t.trackerNotFound}</p>
            <p className="mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Multiple Complaints Selector (if searching by phone number returned multiple) */}
      {!loading && complaintList.length > 1 && (
        <div className="p-3.5 bg-slate-100 rounded-xl border border-slate-200">
          <p className="text-xs font-bold text-slate-700 mb-2">
            {lang === 'hi'
              ? `इस नंबर से ${complaintList.length} शिकायतें दर्ज मिली हैं। देखने के लिए चुनें:`
              : `Found ${complaintList.length} complaints linked to this phone. Select to view:`}
          </p>
          <div className="flex flex-wrap gap-2">
            {complaintList.map((c, idx) => (
              <button
                key={c.trackingId || idx}
                type="button"
                onClick={() => setComplaint(c)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  complaint?.trackingId === c.trackingId
                    ? 'bg-blue-900 text-white shadow-xs'
                    : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
                }`}
              >
                #{c.trackingId} ({c.category})
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Complaint Detail Card */}
      {!loading && complaint && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-4 sm:p-6 space-y-5">
          {/* Header Info */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-extrabold text-slate-400">
                  {lang === 'hi' ? 'ट्रैकिंग ID:' : 'Tracking ID:'}
                </span>
                <span className="text-lg sm:text-xl font-black text-blue-900 font-mono">
                  #{complaint.trackingId || complaint.id}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {t.filedOn}: {formatDate(complaint.createdAt)}
              </p>
            </div>

            <StatusBadge status={complaint.status} />
          </div>

          {/* Stepper Visualizer */}
          <div className="px-1 sm:px-4">
            <h4 className="text-xs uppercase font-bold text-slate-500 tracking-wider mb-2">
              {t.statusHistory}
            </h4>
            <StepperStatus currentStatus={complaint.status} />
          </div>

          {/* Citizen & Issue Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 sm:p-4 bg-slate-50 rounded-xl text-sm border border-slate-200/80">
            <div className="flex items-center gap-2 text-slate-700">
              <User className="w-4 h-4 text-blue-900 flex-shrink-0" />
              <span>
                <strong>{t.filedBy}:</strong> {complaint.citizenName || complaint.name || (lang === 'hi' ? 'गोपनीय' : 'Confidential')}
              </span>
            </div>

            <div className="flex items-center gap-2 text-slate-700">
              <MapPin className="w-4 h-4 text-blue-900 flex-shrink-0" />
              <span>
                <strong>{t.wardNum}:</strong> {lang === 'hi' ? 'वार्ड' : 'Ward'} {complaint.wardNumber ?? complaint.ward ?? (lang === 'hi' ? 'अस्पष्ट' : 'N/A')}
              </span>
            </div>

            <div className="flex items-center gap-2 text-slate-700">
              <Tag className="w-4 h-4 text-blue-900 flex-shrink-0" />
              <span>
                <strong>{t.labelCategory}:</strong> {complaint.category || (lang === 'hi' ? 'सामान्य' : 'General')}
              </span>
            </div>

            <div className="flex items-center gap-2 text-slate-700">
              <Clock className="w-4 h-4 text-blue-900 flex-shrink-0" />
              <span>
                <strong>{lang === 'hi' ? 'अंतिम अपडेट:' : 'Last Update:'}</strong> {formatDate(complaint.updatedAt || complaint.createdAt)}
              </span>
            </div>
          </div>

          {/* Complaint Description */}
          <div>
            <h4 className="text-xs uppercase font-bold text-slate-500 tracking-wider mb-1.5">
              {t.labelDescription}
            </h4>
            <p className="text-sm text-slate-800 bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/80 leading-relaxed">
              {complaint.description}
            </p>
          </div>

          {/* Optional Complaint Photo */}
          {(complaint.imageUrl || complaint.image) && (
            <div>
              <h4 className="text-xs uppercase font-bold text-slate-500 tracking-wider mb-2">
                {lang === 'hi' ? 'संलग्न फोटो' : 'Attached Photo'}
              </h4>
              <a
                href={complaint.imageUrl || complaint.image}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block group"
              >
                <img
                  src={complaint.imageUrl || complaint.image}
                  alt={lang === 'hi' ? 'समस्या फोटो' : 'Complaint Photo'}
                  className="w-32 h-24 object-cover rounded-xl border border-slate-200 group-hover:opacity-90 shadow-sm"
                />
                <span className="text-[11px] text-emerald-700 underline flex items-center gap-1 mt-1">
                  <span>{lang === 'hi' ? 'बड़ी फोटो देखें' : 'View Full Image'}</span>
                  <ExternalLink className="w-3 h-3" />
                </span>
              </a>
            </div>
          )}

          {/* Admin Remarks Box */}
          <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200 text-amber-900">
            <div className="flex items-center gap-2 font-bold text-sm mb-1 text-amber-900">
              <MessageSquare className="w-4 h-4 text-amber-700" />
              <span>{t.officerRemarks}:</span>
            </div>
            <p className="text-xs sm:text-sm text-amber-950 font-medium pl-6 leading-relaxed">
              {complaint.adminRemarks || (lang === 'hi'
                ? 'आपकी शिकायत संबंधित विभाग के संज्ञान में है। जल्द ही आवश्यक कार्रवाई की जाएगी।'
                : 'Your complaint is under review with the concerned authority. Necessary action will be taken shortly.')}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatusTracker;
