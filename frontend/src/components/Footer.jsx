import React from 'react';
import { Building2, Phone, MapPin, Clock, ShieldCheck } from 'lucide-react';
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
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800/80 text-sm">
      {/* Main Multi-Column Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Col 1: Brand & Gov Identity (Spans 4 cols on desktop) */}
          <div className="md:col-span-4 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                <Building2 className="w-5 h-5"/>
              </div>
              <div>
                <h3 className="text-white font-bold text-base tracking-tight">
                  {isHi ? 'ग्राम पंचायत सहरी' : 'Gram Panchayat Sahari'}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  {isHi ? 'ई-शासन एवं नागरिक सेवा पोर्टल' : 'Citizen Redressal & e-Governance'}
                </p>
              </div>
            </div>

            <p className="text-xs leading-relaxed text-slate-400 max-w-sm">
              {isHi 
                ? 'गाँव के समग्र विकास, पारदर्शी प्रशासन और नागरिकों की समस्याओं के त्वरित समाधान हेतु समर्पित डिजिटल मंच।'
                : 'Empowering rural citizens with direct digital governance, transparent grievance resolution, and community connectivity.'}
            </p>

            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>{isHi ? 'पोर्टल सक्रिय एवं सुरक्षित' : 'All Systems Operational'}</span>
            </div>
          </div>

          {/* Col 2: Citizen Services (Spans 3 cols) */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
              {isHi ? 'नागरिक सेवाएँ' : 'Citizen Services'}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button type="button" onClick={onOpenGrievance} className="hover:text-white transition-colors cursor-pointer text-left">
                  {isHi ? 'शिकायत दर्ज करें' : 'File Grievance'}
                </button>
              </li>
              <li>
                <button type="button" onClick={handleTrack} className="hover:text-white transition-colors cursor-pointer text-left">
                  {isHi ? 'स्थिति जांचें (Status Tracker)' : 'Track Grievance Status'}
                </button>
              </li>
              <li>
                <button type="button" onClick={handleDirectory} className="hover:text-white transition-colors cursor-pointer text-left">
                  {isHi ? 'पंचायत प्रतिनिधि सूची' : 'Representatives Directory'}
                </button>
              </li>
              <li>
                <button type="button" onClick={handleLogin} className="hover:text-white transition-colors flex items-center gap-1.5 text-slate-500 hover:text-slate-300 cursor-pointer text-left">
                  <ShieldCheck className="w-3.5 h-3.5"/>
                  {isHi ? 'प्रशासन लॉगिन (Admin)' : 'Panchayat Admin Login'}
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Emergency Helplines (Spans 2 cols) */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
              {isHi ? 'आपातकालीन नंबर' : 'Helplines'}
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center justify-between pr-4">
                <span className="text-slate-400">{isHi ? 'पुलिस' : 'Police'}</span>
                <a href="tel:112" className="text-blue-400 hover:underline font-mono font-medium">112</a>
              </li>
              <li className="flex items-center justify-between pr-4">
                <span className="text-slate-400">{isHi ? 'एम्बुलेंस' : 'Ambulance'}</span>
                <a href="tel:108" className="text-amber-400 hover:underline font-mono font-medium">108</a>
              </li>
              <li className="flex items-center justify-between pr-4">
                <span className="text-slate-400">{isHi ? 'महिला हेल्पलाइन' : 'Women'}</span>
                <a href="tel:1090" className="text-rose-400 hover:underline font-mono font-medium">1090</a>
              </li>
              <li className="flex items-center justify-between pr-4">
                <span className="text-slate-400">{isHi ? 'अग्निशमन' : 'Fire'}</span>
                <a href="tel:101" className="text-orange-400 hover:underline font-mono font-medium">101</a>
              </li>
            </ul>
          </div>

          {/* Col 4: Office Details (Spans 3 cols) */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
              {isHi ? 'कार्यालय पता' : 'Office Location'}
            </h4>
            <div className="space-y-2.5 text-xs text-slate-400">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-slate-500 shrink-0 mt-0.5"/>
                <span>{isHi ? 'ग्राम पंचायत भवन, सहरी (तहसील कार्यालय के पास)' : 'Gram Panchayat Bhawan, Sahari'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-500 shrink-0"/>
                <span>{isHi ? 'कार्य समय: 9:30 AM - 5:30 PM (सोम - शनि)' : 'Working Hours: 9:30 AM - 5:30 PM'}</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Sub-Bar */}
      <div className="border-t border-slate-900 bg-slate-950/80">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            © 2026 {isHi ? 'ग्राम पंचायत सहरी. सर्वाधिकार सुरक्षित.' : 'Gram Panchayat Sahari. All rights reserved.'}
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-500">
            <span>डिजिटल पंचायत पहल</span>
            <span>•</span>
            <span>सत्यमेव जयते</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
