import React, { useState, useEffect } from 'react';
import { 
  FilePlus2, 
  SearchCheck, 
  ShieldCheck, 
  CheckCircle2, 
  Building2, 
  Clock, 
  Sparkles, 
  Zap, 
  Send,
  MessageCircle
} from 'lucide-react';
import { useLang } from '../context/LanguageContext';
import { getPublicStats } from '../api/complaints';

/**
 * Lightweight count-up hook using requestAnimationFrame
 * Runs smoothly at 60 FPS without heavy external animation libraries
 */
const useCountUp = (target, duration = 800) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const num = Number(target);
    if (isNaN(num) || num <= 0) {
      setCount(num || 0);
      return;
    }

    let startTimestamp = null;
    let animId;

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * num));

      if (progress < 1) {
        animId = requestAnimationFrame(step);
      } else {
        setCount(num);
      }
    };

    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [target, duration]);

  return count;
};

/**
 * Modern HeroSection component with bilingual support and fresh modern aesthetic
 *
 * @param {object} props
 * @param {Function} props.onOpenGrievance - opens complaint submission modal
 * @param {Function} props.onOpenTrack - opens status tracking modal
 */
const HeroSection = ({ onOpenGrievance, onOpenTrack }) => {
  const { lang, t } = useLang();
  const [resolvedCount, setResolvedCount] = useState(() => {
    try {
      const cached = localStorage.getItem('cached_resolved_count');
      return cached !== null ? Number(cached) : 48;
    } catch {
      return 48;
    }
  });
  const [totalWards, setTotalWards] = useState(7);
  const [loadingStats, setLoadingStats] = useState(false);

  // Animated Count-Up values for civic metrics
  const animatedResolved = useCountUp(resolvedCount, 800);
  const animatedWards = useCountUp(totalWards, 800);

  useEffect(() => {
    let isMounted = true;
    const fetchStats = async () => {
      try {
        const res = await getPublicStats();
        if (isMounted) {
          const count = res?.resolvedCount ?? res?.data?.resolvedCount ?? 0;
          setResolvedCount(count);
          try {
            localStorage.setItem('cached_resolved_count', count.toString());
          } catch {
            // ignore
          }
          if (res?.totalWards || res?.data?.totalWards) {
            setTotalWards(res?.totalWards || res?.data?.totalWards);
          }
        }
      } catch (err) {
        console.warn('Could not fetch public stats:', err);
      } finally {
        if (isMounted) {
          setLoadingStats(false);
        }
      }
    };

    fetchStats();
    return () => {
      isMounted = false;
    };
  }, []);

  const displayResolved = animatedResolved > 0 ? `${animatedResolved}+` : '0';

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-50 py-6 sm:py-12 lg:py-16 border-b border-slate-200/80">
      <div className="relative max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 text-center">
        {/* Crisp Gov-Tech Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200/90 text-blue-900 text-[10px] sm:text-xs font-bold mb-3 sm:mb-5 shadow-2xs">
          <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-blue-900" />
          <span>{t.heroBadge}</span>
        </div>

        {/* Dynamic Bilingual Headline */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-center leading-snug sm:leading-tight px-1 text-slate-900 tracking-tight">
          {t.heroTitle1} <br className="hidden sm:inline" />
          <span className="text-blue-900">
            {t.heroTitle2}
          </span>
        </h1>

        {/* Subtitle & Description */}
        <p className="mt-2 text-xs sm:text-sm md:text-base text-slate-600 text-center px-2 max-w-xl mx-auto leading-relaxed">
          {t.heroSubtitle}
        </p>
        <p className="mt-1 text-xs sm:text-sm text-slate-500 max-w-xl mx-auto leading-relaxed hidden sm:block">
          {t.heroDesc}
        </p>

        {/* Structured Civic Feature Badges with Staggered Entrance */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 mt-3.5 sm:mt-5 text-[11px] sm:text-xs font-semibold text-slate-700">
          <span
            className="animate-fadeUp inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-lg bg-white border border-slate-200 text-slate-800 shadow-2xs transform-gpu"
            style={{ animationDelay: '100ms' }}
          >
            <Zap className="w-3.5 h-3.5 text-blue-900 shrink-0" />
            <span>{t.featurePaperless}</span>
          </span>
          <span
            className="animate-fadeUp inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-lg bg-white border border-slate-200 text-slate-800 shadow-2xs transform-gpu"
            style={{ animationDelay: '200ms' }}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-blue-900 shrink-0" />
            <span>{t.featureDirect}</span>
          </span>
          <span
            className="animate-fadeUp inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-lg bg-white border border-slate-200 text-slate-800 shadow-2xs transform-gpu"
            style={{ animationDelay: '300ms' }}
          >
            <MessageCircle className="w-3.5 h-3.5 text-blue-900 shrink-0" />
            <span>{t.featureWhatsapp}</span>
          </span>
        </div>

        {/* Action Buttons with Native Mobile Tap Scale Feedback */}
        <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2.5 sm:gap-3.5 max-w-sm sm:max-w-md mx-auto">
          {/* Button 1: File Grievance */}
          <button
            type="button"
            onClick={onOpenGrievance}
            className="group w-full sm:w-auto flex-1 h-11 sm:h-12 px-5 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-950 transition-transform duration-150 active:scale-[0.98] select-none touch-manipulation text-white font-bold text-xs sm:text-sm shadow-xs flex items-center justify-center gap-2 focus:outline-none focus:ring-4 focus:ring-blue-900/30 cursor-pointer"
          >
            <FilePlus2 className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[2.2] shrink-0" />
            <span>{t.btnNewComplaint}</span>
          </button>

          {/* Button 2: Track Status */}
          <button
            type="button"
            onClick={onOpenTrack}
            className="group w-full sm:w-auto flex-1 h-11 sm:h-12 px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 transition-transform duration-150 active:scale-[0.98] select-none touch-manipulation text-slate-800 border border-slate-300 hover:border-slate-400 font-bold text-xs sm:text-sm shadow-2xs flex items-center justify-center gap-2 focus:outline-none focus:ring-4 focus:ring-slate-200 cursor-pointer"
          >
            <SearchCheck className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[2.2] text-slate-700 shrink-0" />
            <span>{t.btnTrackStatus}</span>
          </button>
        </div>

        {/* Structured Civic Metrics with Animated Count-Up */}
        <div className="mt-7 sm:mt-10 pt-5 sm:pt-7 border-t border-slate-200/80">
          <div className="grid grid-cols-3 gap-2 sm:gap-4 max-w-2xl mx-auto">
            {/* Metric 1: Resolved Count */}
            <div className="flex flex-col items-center justify-center p-2.5 sm:p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-lg sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight transition-all duration-300">
                {displayResolved}
              </span>
              <span className="text-[9px] sm:text-[11px] text-slate-500 font-semibold tracking-wider uppercase text-center mt-0.5 leading-tight">
                {t.statComplaints}
              </span>
            </div>

            {/* Metric 2: Wards */}
            <div className="flex flex-col items-center justify-center p-2.5 sm:p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-lg sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
                {animatedWards}
              </span>
              <span className="text-[9px] sm:text-[11px] text-slate-500 font-semibold tracking-wider uppercase text-center mt-0.5 leading-tight">
                {t.statWards}
              </span>
            </div>

            {/* Metric 3: 24x7 */}
            <div className="flex flex-col items-center justify-center p-2.5 sm:p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-lg sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
                24×7
              </span>
              <span className="text-[9px] sm:text-[11px] text-slate-500 font-semibold tracking-wider uppercase text-center mt-0.5 leading-tight">
                {t.statService}
              </span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default HeroSection;
