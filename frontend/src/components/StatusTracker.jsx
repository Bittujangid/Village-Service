import React, { useState } from 'react';
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
  SearchCheck
} from 'lucide-react';
import toast from 'react-hot-toast';
import { trackComplaint } from '../api/complaints';
import StepperStatus from './ui/StepperStatus';
import StatusBadge from './ui/StatusBadge';
import LoadingSpinner from './ui/LoadingSpinner';
import { useLang } from '../context/LanguageContext';

const StatusTracker = ({ initialQuery = '' }) => {
  const { lang, t } = useLang();
  const [query, setQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [complaint, setComplaint] = useState(null);
  const [complaintList, setComplaintList] = useState([]);
  const [searched, setSearched] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSearch = async (e) => {
    e?.preventDefault();
    // Sanitize query by removing all '#' and internal spaces
    const queryId = (query || '')
      .replace(/#/g, '')
      .replace(/\s+/g, '')
      .trim();

    if (!queryId) {
      toast.error(lang === 'hi' ? 'कृपया ट्रैकिंग ID या मोबाइल नंबर दर्ज करें' : 'Please enter Tracking ID or Mobile number');
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4 space-y-6">
      {/* Search Input Box */}
      <form onSubmit={handleSearch} className="space-y-3">
        <label htmlFor="track-query" className="block text-sm font-bold text-slate-800">
          {lang === 'hi' ? 'शिकायत खोजें' : 'Search Grievance'}
          <span className="text-xs font-normal text-slate-500 ml-2">
            ({lang === 'hi' ? 'ट्रैकिंग ID या मोबाइल' : 'Tracking ID or Phone'})
          </span>
        </label>
        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              id="track-query"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onBlur={handleInputBlur}
              placeholder={t.trackerPlaceholder}
              className="w-full min-h-[48px] pl-11 pr-4 py-3 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-900 focus:border-blue-900 text-sm sm:text-base transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="min-h-[48px] px-6 py-3 rounded-lg bg-blue-900 hover:bg-blue-950 active:bg-blue-950 text-white font-semibold text-sm sm:text-base shadow-sm flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-900 transition-all active:scale-[0.98]"
          >
            {loading ? (
              <span>{t.trackerSearching}</span>
            ) : (
              <>
                <SearchCheck className="w-5 h-5" />
                <span>{t.trackerBtn}</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Loading Spinner */}
      {loading && <LoadingSpinner label={lang === 'hi' ? 'शिकायत का विवरण खोजा जा रहा है...' : 'Searching grievance records...'} />}

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
              : `Found ${complaintList.length} grievances linked to this phone. Select to view:`}
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
              <span>{t.officerRemarks} (Panchayat Remarks):</span>
            </div>
            <p className="text-xs sm:text-sm text-amber-950 font-medium pl-6 leading-relaxed">
              {complaint.adminRemarks || (lang === 'hi'
                ? 'आपकी शिकायत संबंधित विभाग के संज्ञान में है। जल्द ही आवश्यक कार्रवाई की जाएगी।'
                : 'Your grievance is under review with the concerned authority. Necessary action will be taken shortly.')}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatusTracker;
