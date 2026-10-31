import React from 'react';
import { 
  ShieldCheck, 
  MapPin, 
  Clock, 
  Landmark
} from 'lucide-react';
import { useLang } from '../context/LanguageContext';
import { Link } from 'react-router-dom';

const Footer = ({ onOpenGrievance, onOpenTrack }) => {
  const { lang, t } = useLang();

  return (
    <footer className="bg-slate-950 text-slate-300 border-t-4 border-blue-900 relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full bg-blue-950/30 blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10">
        
        {/* 1. Brand Section (Top) */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                <Landmark className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-white tracking-wide">
                  {t.navTitle}
                </h2>
                <span className="text-[10px] sm:text-[11px] text-blue-400 font-medium block">
                  {t.navSubtitle}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed max-w-xl">
              {t.footerTagline}
            </p>
          </div>

          <div className="shrink-0 self-start sm:self-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-semibold text-blue-300 shadow-2xs">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>{t.poweredBy}</span>
            </div>
          </div>
        </div>

        {/* 2. Responsive Columns: 2-Column on Mobile (< md), Clean 3-Column on Desktop (>= md) */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8 mt-5">
          
          {/* Column 1 (Left): QUICK LINKS */}
          <div className="space-y-2">
            <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
              {t.quickLinks}
            </h3>
            <ul className="text-xs space-y-1.5 text-slate-400">
              <li>
                {onOpenGrievance ? (
                  <button
                    type="button"
                    onClick={onOpenGrievance}
                    className="hover:text-blue-300 transition-colors flex items-center gap-1.5 text-left"
                  >
                    <span className="text-blue-400">•</span> {t.btnNewComplaint}
                  </button>
                ) : (
                  <a href="#top" className="hover:text-blue-300 transition-colors flex items-center gap-1.5">
                    <span className="text-blue-400">•</span> {t.btnNewComplaint}
                  </a>
                )}
              </li>
              <li>
                {onOpenTrack ? (
                  <button
                    type="button"
                    onClick={onOpenTrack}
                    className="hover:text-blue-300 transition-colors flex items-center gap-1.5 text-left"
                  >
                    <span className="text-blue-400">•</span> {t.btnTrackStatus}
                  </button>
                ) : (
                  <a href="#top" className="hover:text-blue-300 transition-colors flex items-center gap-1.5">
                    <span className="text-blue-400">•</span> {t.btnTrackStatus}
                  </a>
                )}
              </li>
              <li>
                <a href="#directory" className="hover:text-blue-300 transition-colors flex items-center gap-1.5">
                  <span className="text-blue-400">•</span> {lang === 'hi' ? 'प्रतिनिधि निर्देशिका' : 'Representatives Directory'}
                </a>
              </li>
              <li>
                <Link to="/admin/login" className="hover:text-blue-300 transition-colors flex items-center gap-1.5">
                  <span className="text-blue-400">•</span> {t.adminLogin}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2 (Center): EMERGENCY HELPLINES */}
          <div className="space-y-2">
            <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
              {t.helplineTitle}
            </h3>
            <div className="text-xs space-y-1.5 text-slate-400">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                <span>{t.policeHelpline}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                <span>{t.ambulanceHelpline}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0" />
                <span>{t.fireHelpline}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-pink-500 shrink-0" />
                <span>{t.womenHelpline}</span>
              </div>
            </div>
          </div>

          {/* Column 3 (Right - Desktop only): CONTACT DETAILS */}
          <div className="hidden md:block space-y-2">
            <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
              {t.contactUs}
            </h3>
            <div className="text-xs space-y-2 text-slate-400">
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                <span>{t.panchayatOffice}</span>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                <span>{t.helplineHours}</span>
              </div>
            </div>
          </div>

        </div>

        {/* 3. Mobile-Only Contact Strip (Hidden on Desktop) */}
        <div className="md:hidden mt-4 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs flex flex-col sm:flex-row items-center justify-around gap-2 text-slate-300">
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span>{t.panchayatOffice}</span>
          </div>
          <div className="hidden sm:block text-slate-700">•</div>
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span>{t.helplineHours}</span>
          </div>
        </div>

        {/* 4. Bottom Bar */}
        <div className="mt-6 sm:mt-8 pt-4 border-t border-slate-800/80 text-[11px] text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-center sm:text-left">
          <p>{t.footerCopyright}</p>
          <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-4 text-[11px] font-medium text-slate-400">
            {t.footerMottos.map((motto, idx) => (
              <React.Fragment key={idx}>
                <span>{motto}</span>
                {idx < t.footerMottos.length - 1 && <span className="text-slate-700">•</span>}
              </React.Fragment>
            ))}
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;