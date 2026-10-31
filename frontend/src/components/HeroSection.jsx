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
 * Modern HeroSection component with bilingual support and fresh modern aesthetic
 *
 * @param {object} props
 * @param {Function} props.onOpenGrievance - opens complaint submission modal
 * @param {Function} props.onOpenTrack - opens status tracking modal
 */
const HeroSection = ({ onOpenGrievance, onOpenTrack }) => {
  const { lang, t } = useLang();
  const [resolvedCount, setResolvedCount] = useState(null);
  const [totalWards, setTotalWards] = useState(7);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchStats = async () => {
      try {
        const res = await getPublicStats();
        if (isMounted) {
          const count = res?.resolvedCount ?? res?.data?.resolvedCount ?? 0;
          setResolvedCount(count);
          if (res?.totalWards || res?.data?.totalWards) {
            setTotalWards(res?.totalWards || res?.data?.totalWards);
          }
        }
      } catch (err) {
        console.warn('Could not fetch public stats:', err);
        if (isMounted) {
          setResolvedCount(0);
        }
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

  const displayResolved = resolvedCount !== null
    ? (resolvedCount > 0 ? `${resolvedCount}+` : '0')
    : '...';

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-50 py-8 sm:py-16 lg:py-20 border-b border-slate-200/80">
      <div className="relative max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 text-center">
        {/* Crisp Gov-Tech Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-blue-50 border border-blue-200/90 text-blue-900 text-[11px] sm:text-sm font-semibold mb-4 sm:mb-6 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-blue-900" />
          <span>{t.heroBadge}</span>
        </div>

        {/* Dynamic Bilingual Headline */}
        <h1 className="text-2xl font-black sm:text-4xl lg:text-5xl text-center leading-tight sm:leading-tight px-2 text-slate-900 tracking-tight">
          {t.heroTitle1} <br className="hidden sm:inline" />
          <span className="text-blue-900">
            {t.heroTitle2}
          </span>
        </h1>

        {/* Subtitle & Description */}
        <p className="mt-2 text-sm sm:text-base text-slate-600 text-center px-3 max-w-2xl mx-auto leading-relaxed">
          {t.heroSubtitle}
        </p>
        <p className="mt-1 text-xs sm:text-sm text-slate-500 max-w-2xl mx-auto leading-relaxed hidden sm:block">
          {t.heroDesc}
        </p>

        {/* Structured Civic Feature Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-xs font-semibold text-slate-700">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-white border border-slate-200 text-slate-800 shadow-2xs">
            <Zap className="w-3.5 h-3.5 text-blue-900" />
            {t.featurePaperless}
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-white border border-slate-200 text-slate-800 shadow-2xs">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-900" />
            {t.featureDirect}
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-white border border-slate-200 text-slate-800 shadow-2xs">
            <MessageCircle className="w-3.5 h-3.5 text-blue-900" />
            {t.featureWhatsapp}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 sm:mt-10 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 max-w-md sm:max-w-xl mx-auto">
          {/* Button 1: File Grievance */}
          <button
            type="button"
            onClick={onOpenGrievance}
            className="group w-full sm:w-auto flex-1 min-h-[48px] sm:min-h-[52px] px-5 py-3 rounded-xl bg-blue-900 hover:bg-blue-950 active:scale-[0.98] text-white font-bold text-sm sm:text-base shadow-sm transition-all flex items-center justify-center gap-2 focus:outline-none focus:ring-4 focus:ring-blue-900/30"
          >
            <FilePlus2 className="w-5 h-5 sm:w-5 sm:h-5 stroke-[2.2]" />
            <span>{t.btnNewComplaint}</span>
          </button>

          {/* Button 2: Track Status */}
          <button
            type="button"
            onClick={onOpenTrack}
            className="group w-full sm:w-auto flex-1 min-h-[48px] sm:min-h-[52px] px-5 py-3 rounded-xl bg-white hover:bg-slate-50 active:scale-[0.98] text-slate-800 border-2 border-slate-300 hover:border-slate-400 font-bold text-sm sm:text-base shadow-2xs transition-all flex items-center justify-center gap-2 focus:outline-none focus:ring-4 focus:ring-slate-200"
          >
            <SearchCheck className="w-5 h-5 sm:w-5 sm:h-5 stroke-[2.2] text-slate-700" />
            <span>{t.btnTrackStatus}</span>
          </button>
        </div>

        {/* Structured Civic Metrics (Zero bubbly cards) */}
        <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-slate-200/80">
          <div className="grid grid-cols-3 gap-2 sm:gap-6 max-w-3xl mx-auto">
            {/* Metric 1 */}
            <div className="flex flex-col items-center justify-center p-3 sm:p-5 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight transition-all duration-300">
                {displayResolved}
              </span>
              <span className="text-[10px] sm:text-xs text-slate-500 font-semibold tracking-wider uppercase text-center mt-1 leading-tight">
                {t.statComplaints}
              </span>
            </div>

            {/* Metric 2 */}
            <div className="flex flex-col items-center justify-center p-3 sm:p-5 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {totalWards}
              </span>
              <span className="text-[10px] sm:text-xs text-slate-500 font-semibold tracking-wider uppercase text-center mt-1 leading-tight">
                {t.statWards}
              </span>
            </div>

            {/* Metric 3 */}
            <div className="flex flex-col items-center justify-center p-3 sm:p-5 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight">
                24×7
              </span>
              <span className="text-[10px] sm:text-xs text-slate-500 font-semibold tracking-wider uppercase text-center mt-1 leading-tight">
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
