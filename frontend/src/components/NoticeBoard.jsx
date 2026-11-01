import React, { useState, useEffect } from 'react';
import { Megaphone, ChevronLeft, ChevronRight, Share2, Sparkles, BellRing } from 'lucide-react';
import { getNotices } from '../api/notices';
import { useLang } from '../context/LanguageContext';

const CACHE_KEY = 'cached_public_notices';

const getDefaultFallbackNotices = (currentLang) => [
  {
    _id: 'default-welcome-notice',
    title: currentLang === 'hi'
      ? 'ग्राम पंचायत सहरी में आपका स्वागत है'
      : 'Welcome to Gram Panchayat Sahari',
    description: currentLang === 'hi'
      ? 'ग्राम पंचायत सहरी में आपका स्वागत है | किसी भी समस्या के समाधान हेतु नागरिक शिकायत दर्ज करें'
      : 'Welcome to Gram Panchayat Sahari | Submit your grievance online for quick resolution of civic issues',
    category: currentLang === 'hi' ? 'सामान्य सूचना' : 'General Notice',
    isImportant: false,
    priority: 'normal',
  }
];

const getInitialNotices = () => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to parse cached notices:', e);
  }
  return [];
};

const NoticeBoard = () => {
  const { lang, t } = useLang();
  const [notices, setNotices] = useState(getInitialNotices);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(() => getInitialNotices().length === 0);

  // Default fallback notice trigger after 1.5s if cache was empty and server response is still pending
  useEffect(() => {
    if (!loading || notices.length > 0) return;

    const fallbackTimer = setTimeout(() => {
      setNotices((current) => {
        if (current.length === 0) {
          return getDefaultFallbackNotices(lang);
        }
        return current;
      });
      setLoading(false);
    }, 1500);

    return () => clearTimeout(fallbackTimer);
  }, [loading, notices.length, lang]);

  // Sync fallback notice language when user switches language
  useEffect(() => {
    setNotices((prev) => {
      if (prev.length === 1 && prev[0]._id === 'default-welcome-notice') {
        return getDefaultFallbackNotices(lang);
      }
      return prev;
    });
  }, [lang]);

  // Stale-While-Revalidate: fetch fresh notices asynchronously
  useEffect(() => {
    let isMounted = true;
    const fetchNoticesData = async () => {
      try {
        const data = await getNotices();
        if (isMounted) {
          // Backend returns { success: true, count, notices, data: [...] }
          const list = Array.isArray(data)
            ? data
            : data?.notices || data?.data || [];

          if (list.length > 0) {
            setNotices(list);
            setCurrentIndex(0);
            try {
              localStorage.setItem(CACHE_KEY, JSON.stringify(list));
            } catch (err) {
              console.warn('Failed to cache notices in localStorage:', err);
            }
          } else if (notices.length === 0) {
            setNotices(getDefaultFallbackNotices(lang));
          }
        }
      } catch (err) {
        console.warn('Notice fetch error (maintaining cached/fallback notices):', err);
        if (isMounted) {
          // Maintain existing cached notices on error, fallback only if empty
          setNotices((prev) => {
            if (prev.length > 0) return prev;
            return getDefaultFallbackNotices(lang);
          });
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchNoticesData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Auto-advance carousel every 8 seconds if multiple notices exist
  useEffect(() => {
    if (notices.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % notices.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [notices.length]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-3 pb-1">
        <div className="bg-white border-l-4 border-l-blue-900 border border-slate-200 rounded-xl p-3 sm:p-4 flex items-center gap-3 sm:gap-4 animate-pulse shadow-2xs">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg bg-slate-200 shrink-0"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-slate-200 rounded w-1/4"></div>
            <div className="h-3 bg-slate-100 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  // If no notices exist in DB, show a clean, authentic fallback banner
  if (notices.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-3 pb-1">
        <div className="bg-white border-l-4 border-l-blue-900 border border-slate-200 rounded-xl shadow-2xs p-3 sm:p-4 flex items-center justify-between gap-3 text-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-900 flex items-center justify-center shrink-0 border border-blue-100">
              <Megaphone className="w-5 h-5 text-blue-900" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight">
                {t.noticeBoardSubtitle}
              </p>
              <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
                {t.noticePlaceholder}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const activeNotice = notices[currentIndex] || notices[0];
  const title = activeNotice?.title || (lang === 'hi' ? 'सार्वजनिक सूचना' : 'Public Notice');
  const description = activeNotice?.description || activeNotice?.content || '';
  const category = activeNotice?.category;

  const isHighPriority = Boolean(
    activeNotice?.isImportant ||
    activeNotice?.priority === 'high' ||
    activeNotice?.priority === 'urgent' ||
    activeNotice?.priority === 'अति आवश्यक'
  );

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % notices.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + notices.length) % notices.length);
  };

  const portalUrl = typeof window !== 'undefined' ? window.location.origin : 'https://gramseva.in';
  const priorityText = isHighPriority
    ? (lang === 'hi' ? 'अति आवश्यक' : 'High Priority')
    : (activeNotice?.priority || (lang === 'hi' ? 'सामान्य' : 'General'));

  const formattedWhatsAppText = lang === 'hi'
    ? `📢 *ग्राम पंचायत सहरी - आधिकारिक सूचना*
━━━━━━━━━━━━━━━━━━━━━
📌 *विषय:* ${title}
🏷️ *श्रेणी:* ${category || 'सामान्य सूचना'} | *प्राथमिकता:* ${priorityText}

📝 *विवरण:*
${description}

━━━━━━━━━━━━━━━━━━━━━
🌐 *ग्राम पंचायत पोर्टल:* ${portalUrl}
🏛️ *डिजिटल ग्राम पंचायत सहरी (GramSeva)*`
    : `📢 *Gram Panchayat Sahari - Official Notice*
━━━━━━━━━━━━━━━━━━━━━
📌 *Subject:* ${title}
🏷️ *Category:* ${category || 'General Notice'} | *Priority:* ${priorityText}

📝 *Details:*
${description}

━━━━━━━━━━━━━━━━━━━━━
🌐 *Gram Panchayat Portal:* ${portalUrl}
🏛️ *Digital Gram Panchayat Sahari (GramSeva)*`;

  const handleShareWhatsApp = (e) => {
    e?.preventDefault();
    const shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(formattedWhatsAppText)}`;
    window.open(shareUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-3 pb-1">
      <div className={`rounded-xl shadow-2xs p-3 sm:p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 sm:gap-4 border ${
        isHighPriority
          ? 'bg-rose-50/50 border-rose-200 border-l-4 border-l-rose-700'
          : 'bg-white border-slate-200 border-l-4 border-l-blue-900'
      }`}>
        
        {/* Notice Info */}
        <div className="flex items-start gap-2.5 sm:gap-3.5 flex-1 min-w-0 w-full">
          {/* Bell Icon Box */}
          {isHighPriority ? (
            <div className="relative w-10 h-10 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 border border-rose-200">
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-600"></span>
              </span>
              <BellRing className="w-5 h-5 text-rose-700" />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-900 flex items-center justify-center shrink-0 border border-blue-100">
              <BellRing className="w-5 h-5 text-blue-900" />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1">
              <span className={
                isHighPriority
                  ? 'bg-rose-700 text-white text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded uppercase tracking-wider'
                  : 'bg-blue-900 text-white text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded uppercase tracking-wider'
              }>
                {isHighPriority
                  ? (lang === 'hi' ? '🚨 अति आवश्यक' : '🚨 HIGH PRIORITY')
                  : (lang === 'hi' ? '📌 महत्वपूर्ण सूचना' : '📌 IMPORTANT NOTICE')}
              </span>
              {category && (
                <span className="bg-slate-100 text-slate-700 text-[10px] sm:text-xs font-medium px-2 py-0.5 rounded border border-slate-200">
                  {category}
                </span>
              )}
              {notices.length > 1 && (
                <span className="bg-slate-100 text-slate-700 text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded border border-slate-200">
                  {currentIndex + 1} / {notices.length}
                </span>
              )}
            </div>

            <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight leading-snug break-words">
              {title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 mt-0.5 leading-relaxed break-words">
              {description}
            </p>
          </div>
        </div>

        {/* Action & Nav Controls */}
        <div className="flex items-center justify-between md:justify-end gap-2 sm:gap-3 w-full md:w-auto pt-2.5 md:pt-0 border-t md:border-t-0 border-slate-200/60">
          {notices.length > 1 && (
            <div className="flex items-center gap-1 bg-slate-50/90 backdrop-blur-xs p-1 rounded-xl border border-slate-200/80 shadow-xs">
              <button
                type="button"
                onClick={handlePrev}
                className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg text-slate-700 hover:bg-slate-200/70 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500"
                aria-label={t.prevNotice}
                title={t.prevNotice}
              >
                <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg text-slate-700 hover:bg-slate-200/70 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500"
                aria-label={t.nextNotice}
                title={t.nextNotice}
              >
                <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={handleShareWhatsApp}
            className="flex-1 md:flex-initial inline-flex items-center justify-center gap-1.5 sm:gap-2 bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs sm:text-sm font-semibold px-3 sm:px-4 py-2 rounded-xl shadow-xs hover:shadow-md hover:shadow-green-500/20 active:scale-95 transition-all duration-200 shrink-0 cursor-pointer"
            aria-label={t.whatsappShare}
          >
            <svg
              viewBox="0 0 24 24"
              className="w-4 h-4 fill-current shrink-0"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            <span>{t.whatsappShare}</span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default NoticeBoard;
