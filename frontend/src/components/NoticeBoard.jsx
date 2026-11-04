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
      : 'Welcome to Gram Panchayat Sahari | Submit your complaint online for quick resolution of civic issues',
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
  const [notices, setNotices] = useState(() => {
    const cached = getInitialNotices();
    return cached.length > 0 ? cached : getDefaultFallbackNotices('hi');
  });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [slideDirection, setSlideDirection] = useState('right');
  const [isTransitioning, setIsTransitioning] = useState(false);

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
    setSlideDirection('right');
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % notices.length);
      setIsTransitioning(false);
    }, 120);
  };

  const handlePrev = () => {
    setSlideDirection('left');
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + notices.length) % notices.length);
      setIsTransitioning(false);
    }, 120);
  };

  const portalUrl = typeof window !== 'undefined' ? window.location.origin : 'https://gramseva.in';
  const priorityText = isHighPriority
    ? (lang === 'hi' ? 'अति आवश्यक' : 'High Priority')
    : (activeNotice?.priority || (lang === 'hi' ? 'सामान्य' : 'General'));

  const getCategoryDisplay = (cat) => {
    if (!cat) return lang === 'hi' ? 'सामान्य सूचना' : 'General Notice';
    if (cat === 'सामान्य सूचना' || cat === 'General Notice') {
      return lang === 'hi' ? 'सामान्य सूचना' : 'General Notice';
    }
    if (cat === 'पेयजल व जल आपूर्ति' || cat === 'Water Supply') {
      return lang === 'hi' ? 'पेयजल व जल आपूर्ति' : 'Water Supply';
    }
    if (cat === 'स्वच्छता अभियान' || cat === 'Sanitation') {
      return lang === 'hi' ? 'स्वच्छता अभियान' : 'Sanitation';
    }
    if (cat === 'विद्युत आपूर्ति' || cat === 'Electricity') {
      return lang === 'hi' ? 'विद्युत आपूर्ति' : 'Electricity';
    }
    if (cat === 'सड़क व निर्माण' || cat === 'Roads & Works') {
      return lang === 'hi' ? 'सड़क व निर्माण' : 'Roads & Works';
    }
    if (cat === 'कृषि व योजनाएं' || cat === 'Agriculture & Schemes') {
      return lang === 'hi' ? 'कृषि व योजनाएं' : 'Agriculture & Schemes';
    }
    return cat;
  };

  const formattedWhatsAppText = lang === 'hi'
    ? `📢 *ग्राम पंचायत सहरी - आधिकारिक सूचना*
━━━━━━━━━━━━━━━━━━━━━
📌 *विषय:* ${title}
🏷️ *श्रेणी:* ${getCategoryDisplay(category)} | *प्राथमिकता:* ${priorityText}

📝 *विवरण:*
${description}

━━━━━━━━━━━━━━━━━━━━━
🌐 *ग्राम पंचायत पोर्टल:* ${portalUrl}
🏛️ *डिजिटल ग्राम पंचायत सहरी (GramSeva)*`
    : `📢 *Gram Panchayat Sahari - Official Notice*
━━━━━━━━━━━━━━━━━━━━━
📌 *Subject:* ${title}
🏷️ *Category:* ${getCategoryDisplay(category)} | *Priority:* ${priorityText}

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

  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(formattedWhatsAppText)}`;

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-2.5 sm:pt-3 pb-1">
      <div className={`rounded-2xl p-4 shadow-xs flex flex-col gap-2.5 sm:gap-3 border ${
        isHighPriority
          ? 'bg-rose-50/70 border-rose-200 border-l-4 border-l-rose-500'
          : 'bg-sky-50/70 border-sky-200 border-l-4 border-l-blue-600'
      }`}>
        
        {/* Top: Badges on Left & Counter + Navigation Arrows on Top-Right */}
        <div className="flex items-center justify-between gap-2 w-full">
          <div className="flex items-center gap-2 min-w-0">
            {isHighPriority ? (
              <div className="relative w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 border border-rose-200">
                <span className="absolute -top-1 -right-1 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-600"></span>
                </span>
                <BellRing className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-600" />
              </div>
            ) : (
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 border border-blue-200">
                <BellRing className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" />
              </div>
            )}

            <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 min-w-0">
              <span className={`inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-md uppercase tracking-wider text-white ${
                isHighPriority
                  ? 'bg-rose-600'
                  : 'bg-blue-600'
              }`}>
                {isHighPriority ? (
                  <>
                    <span className="relative flex h-2 w-2 mr-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                    </span>
                    <span>{lang === 'hi' ? 'अति आवश्यक' : 'HIGH PRIORITY'}</span>
                  </>
                ) : (
                  <>
                    <span className="relative flex h-1.5 w-1.5 mr-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-300 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-blue-300"></span>
                    </span>
                    <span>{lang === 'hi' ? 'महत्वपूर्ण सूचना' : 'IMPORTANT NOTICE'}</span>
                  </>
                )}
              </span>
              {category && (
                <span className={`px-2 py-0.5 rounded-md text-xs font-medium truncate border ${
                  isHighPriority
                    ? 'bg-rose-100 text-rose-800 border-rose-200'
                    : 'bg-sky-100 text-sky-800 border-sky-200'
                }`}>
                  {getCategoryDisplay(category)}
                </span>
              )}
            </div>
          </div>

          {/* Top-Right: Pagination counter & Previous / Next navigation arrows */}
          {notices.length > 1 && (
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-[11px] sm:text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                {currentIndex + 1} / {notices.length}
              </span>
              <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5 shadow-2xs">
                <button
                  type="button"
                  onClick={handlePrev}
                  className="p-1 hover:bg-slate-100 rounded text-slate-600 transition-transform duration-150 active:scale-[0.92] select-none touch-manipulation cursor-pointer"
                  aria-label={t.prevNotice}
                  title={t.prevNotice}
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="p-1 hover:bg-slate-100 rounded text-slate-600 transition-transform duration-150 active:scale-[0.92] select-none touch-manipulation cursor-pointer"
                  aria-label={t.nextNotice}
                  title={t.nextNotice}
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Notice Info: Title & Description with Smooth Slide-Fade Transition */}
        <div
          className={`min-w-0 transition-all duration-200 ease-out transform transform-gpu ${
            isTransitioning
              ? slideDirection === 'right'
                ? '-translate-x-2 opacity-0'
                : 'translate-x-2 opacity-0'
              : 'translate-x-0 opacity-100'
          }`}
        >
          <h2 className="text-xs sm:text-sm md:text-base font-bold text-slate-900 tracking-tight leading-snug break-words">
            {title}
          </h2>
          <p className="text-[11px] sm:text-xs text-slate-600 line-clamp-2 sm:line-clamp-3 mt-1 leading-relaxed break-words">
            {description}
          </p>
        </div>

        {/* Bottom: WhatsApp Action Button (Full-width on mobile, auto/compact on desktop) */}
        <div className="pt-1 flex justify-start sm:justify-start">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 transition-transform duration-150 active:scale-[0.98] select-none touch-manipulation text-white font-medium text-xs shadow-xs cursor-pointer"
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
          </a>
        </div>

      </div>
    </div>
  );
};

export default NoticeBoard;
