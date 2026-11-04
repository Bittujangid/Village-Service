import React from 'react';
import { Building2, ShieldCheck, MapPin, Clock } from 'lucide-react';
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
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-900 py-6 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Top: Minimal Brand Header */}
        <div className="flex items-center gap-2.5 border-b border-slate-900 pb-4">
          <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-white text-sm font-semibold tracking-tight">
              {isHi ? 'ग्राम पंचायत सहरी' : 'Gram Panchayat Sahari'}
            </h3>
            <p className="text-[10px] text-slate-500">
              {isHi ? 'ई-शासन नागरिक मंच' : 'e-Governance Citizen Platform'}
            </p>
          </div>
        </div>

        {/* Middle: Clean Column-Wise Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-xs">
          
          {/* Column 1: Citizen Services */}
          <div className="space-y-2.5">
            <p className="text-[11px] font-semibold text-slate-200 tracking-wider uppercase">
              {isHi ? 'महत्वपूर्ण लिंक' : 'Quick Links'}
            </p>
            <ul className="space-y-1.5">
              <li>
                <button type="button" onClick={onOpenGrievance} className="hover:text-white transition cursor-pointer text-left">
                  {isHi ? 'शिकायत दर्ज करें' : 'File Grievance'}
                </button>
              </li>
              <li>
                <button type="button" onClick={handleTrack} className="hover:text-white transition cursor-pointer text-left">
                  {isHi ? 'स्थिति जांचें' : 'Track Status'}
                </button>
              </li>
              <li>
                <button type="button" onClick={handleDirectory} className="hover:text-white transition cursor-pointer text-left">
                  {isHi ? 'प्रतिनिधि सूची' : 'Directory'}
                </button>
              </li>
              <li>
                <button type="button" onClick={handleLogin} className="hover:text-white inline-flex items-center gap-1 text-slate-400 hover:text-slate-200 transition cursor-pointer text-left">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                  <span>{isHi ? 'प्रशासन लॉगिन' : 'Admin Login'}</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Column 2: Emergency Numbers */}
          <div className="space-y-2.5">
            <p className="text-[11px] font-semibold text-slate-200 tracking-wider uppercase">
              {isHi ? 'आपातकालीन नंबर' : 'Emergency Helplines'}
            </p>
            <ul className="space-y-1.5 font-mono text-[11px]">
              <li className="flex items-center justify-between pr-2">
                <span className="text-slate-400 font-sans">{isHi ? 'पुलिस:' : 'Police:'}</span>
                <a href="tel:112" className="text-blue-400 hover:underline">112</a>
              </li>
              <li className="flex items-center justify-between pr-2">
                <span className="text-slate-400 font-sans">{isHi ? 'एम्बुलेंस:' : 'Ambulance:'}</span>
                <a href="tel:108" className="text-amber-400 hover:underline">108</a>
              </li>
              <li className="flex items-center justify-between pr-2">
                <span className="text-slate-400 font-sans">{isHi ? 'महिला हेल्प:' : 'Women:'}</span>
                <a href="tel:1090" className="text-rose-400 hover:underline">1090</a>
              </li>
              <li className="flex items-center justify-between pr-2">
                <span className="text-slate-400 font-sans">{isHi ? 'अग्निशमन:' : 'Fire:'}</span>
                <a href="tel:101" className="text-orange-400 hover:underline">101</a>
              </li>
            </ul>
          </div>

          {/* Column 3: Office & Timings */}
          <div className="col-span-2 md:col-span-1 space-y-2.5 pt-2 md:pt-0 border-t md:border-t-0 border-slate-900">
            <p className="text-[11px] font-semibold text-slate-200 tracking-wider uppercase">
              {isHi ? 'कार्यालय एवं समय' : 'Office & Timings'}
            </p>
            <div className="flex items-start gap-2 text-[11px] text-slate-400">
              <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
              <span>{isHi ? 'ग्राम पंचायत भवन, सहरी' : 'Gram Panchayat Bhawan, Sahari'}</span>
            </div>
            <div className="flex items-start gap-2 text-[11px] text-slate-500">
              <Clock className="w-3.5 h-3.5 text-slate-600 shrink-0 mt-0.5" />
              <span>{isHi ? 'कार्य समय: 9:30 AM - 5:30 PM (सोम - शनि)' : 'Hours: 9:30 AM - 5:30 PM (Mon - Sat)'}</span>
            </div>
          </div>

        </div>

        {/* Bottom Sub-Bar */}
        <div className="border-t border-slate-900/80 pt-3 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500">
          <div>
            © 2026 {isHi ? 'ग्राम पंचायत सहरी. सर्वाधिकार सुरक्षित.' : 'Gram Panchayat Sahari. All rights reserved.'}
          </div>
          <div className="flex items-center gap-2 text-[10px] text-slate-600">
            <span>डिजिटल पंचायत</span>
            <span>•</span>
            <span>सत्यमेव जयते</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
