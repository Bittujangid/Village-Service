import React from 'react';
import { Landmark } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLang } from '../context/LanguageContext';

const Footer = ({ onOpenGrievance, onOpenTrack }) => {
  const { lang } = useLang();

  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 py-6 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Top Row: Brand & Emergency Helplines */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          {/* Left: Branding & Subtitle */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
              <Landmark className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white tracking-tight">
                {lang === 'hi' ? 'ग्राम पंचायत सहरी' : 'Gram Panchayat Sahari'}
              </h3>
              <p className="text-[11px] text-slate-500">
                {lang === 'hi' ? 'ई-शासन नागरिक पोर्टल' : 'e-Governance Citizen Portal'}
              </p>
            </div>
          </div>

          {/* Right: Quick Emergency Helpline Badges */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] text-slate-500 font-medium mr-0.5">
              {lang === 'hi' ? 'हेल्पलाइन:' : 'Emergency:'}
            </span>
            <a
              href="tel:112"
              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-[11px] font-semibold transition-colors"
              title="Police & Emergency 112"
            >
              112
            </a>
            <span className="text-slate-700 text-xs">|</span>
            <a
              href="tel:108"
              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-[11px] font-semibold transition-colors"
              title="Ambulance 108"
            >
              108
            </a>
            <span className="text-slate-700 text-xs">|</span>
            <a
              href="tel:1090"
              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-[11px] font-semibold transition-colors"
              title="Women Helpline 1090"
            >
              1090
            </a>
          </div>
        </div>

        {/* Middle Row: Inline Quick Links */}
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-1.5 text-xs text-slate-400 my-4 pt-3 border-t border-slate-800/60">
          {onOpenGrievance ? (
            <button
              type="button"
              onClick={onOpenGrievance}
              className="hover:text-slate-200 transition-colors cursor-pointer"
            >
              {lang === 'hi' ? 'शिकायत दर्ज करें' : 'File Grievance'}
            </button>
          ) : (
            <a href="#top" className="hover:text-slate-200 transition-colors">
              {lang === 'hi' ? 'शिकायत दर्ज करें' : 'File Grievance'}
            </a>
          )}
          <span className="text-slate-700 select-none">•</span>
          {onOpenTrack ? (
            <button
              type="button"
              onClick={onOpenTrack}
              className="hover:text-slate-200 transition-colors cursor-pointer"
            >
              {lang === 'hi' ? 'स्थिति जांचें' : 'Track Status'}
            </button>
          ) : (
            <a href="#top" className="hover:text-slate-200 transition-colors">
              {lang === 'hi' ? 'स्थिति जांचें' : 'Track Status'}
            </a>
          )}
          <span className="text-slate-700 select-none">•</span>
          <a href="#directory" className="hover:text-slate-200 transition-colors">
            {lang === 'hi' ? 'संपर्क डायरेक्टरी' : 'Contact Directory'}
          </a>
          <span className="text-slate-700 select-none">•</span>
          <Link to="/admin/login" className="hover:text-slate-200 transition-colors">
            {lang === 'hi' ? 'प्रशासन लॉगिन' : 'Admin Login'}
          </Link>
        </div>

        {/* Bottom Row: Address & Minimal Copyright */}
        <div className="pt-3 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-1.5 text-center sm:text-left">
          <p className="text-[11px] text-slate-400">
            {lang === 'hi'
              ? '📍 ग्राम पंचायत भवन, सहरी | समय: 9:00 AM - 5:00 PM'
              : '📍 Gram Panchayat Bhawan, Sahari | Timings: 9:00 AM - 5:00 PM'}
          </p>
          <p className="text-[11px] text-slate-500">
            {lang === 'hi'
              ? '© 2026 ग्राम पंचायत सहरी. सर्वाधिकार सुरक्षित.'
              : '© 2026 Gram Panchayat Sahari. All rights reserved.'}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
