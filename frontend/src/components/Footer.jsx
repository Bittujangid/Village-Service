import React from 'react';
import { Building2, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

export default function Footer({ onOpenGrievance, onOpenTracker, onOpenTrack, onOpenDirectory, onOpenLogin }) {
  const { language, lang } = useLanguage();
  const isHi = (language || lang) === 'hi';
  const navigate = useNavigate();

  const handleTrack = onOpenTracker || onOpenTrack;
  const handleDirectory = onOpenDirectory || (() => {
    const el = document.getElementById('directory');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  });
  const handleLogin = onOpenLogin || (() => navigate('/admin/login'));

  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-900 py-6 px-4">
      <div className="max-w-6xl mx-auto space-y-4">
        
        {/* Row 1: Brand & Status (Single Horizontal Flex Row) */}
        <div className="flex items-center justify-between gap-2 border-b border-slate-900 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/20">
              <Building2 className="w-3.5 h-3.5" />
            </div>
            <span className="text-sm font-semibold text-white tracking-tight">
              {isHi ? 'ग्राम पंचायत सहरी' : 'Gram Panchayat Sahari'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>{isHi ? 'सक्रिय' : 'Operational'}</span>
          </div>
        </div>

        {/* Row 2: Horizontal Navigation Links */}
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-slate-300">
          <button type="button" onClick={onOpenGrievance} className="hover:text-white transition cursor-pointer">
            {isHi ? 'शिकायत दर्ज करें' : 'File Grievance'}
          </button>
          <span className="text-slate-700">•</span>
          <button type="button" onClick={handleTrack} className="hover:text-white transition cursor-pointer">
            {isHi ? 'स्थिति जांचें' : 'Track Status'}
          </button>
          <span className="text-slate-700">•</span>
          <button type="button" onClick={handleDirectory} className="hover:text-white transition cursor-pointer">
            {isHi ? 'प्रतिनिधि सूची' : 'Directory'}
          </button>
          <span className="text-slate-700">•</span>
          <button type="button" onClick={handleLogin} className="hover:text-white inline-flex items-center gap-1 text-slate-400 hover:text-slate-200 transition cursor-pointer">
            <ShieldCheck className="w-3 h-3 text-blue-400" />
            <span>{isHi ? 'एडमिन' : 'Admin'}</span>
          </button>
        </div>

        {/* Row 3: Horizontal Emergency Helplines & Copyright */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 border-t border-slate-900 text-[11px] text-slate-500 text-center">
          <div className="flex items-center gap-3">
            <span className="text-slate-600 font-medium">{isHi ? 'हेल्पलाइन:' : 'Emergency:'}</span>
            <a href="tel:112" className="text-blue-400 hover:underline font-mono">112</a>
            <span className="text-slate-800">|</span>
            <a href="tel:108" className="text-amber-400 hover:underline font-mono">108</a>
            <span className="text-slate-800">|</span>
            <a href="tel:1090" className="text-rose-400 hover:underline font-mono">1090</a>
          </div>

          <div>
            © 2026 {isHi ? 'ग्राम पंचायत सहरी' : 'Gram Panchayat Sahari'}
          </div>
        </div>

      </div>
    </footer>
  );
}
