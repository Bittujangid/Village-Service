import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Lock, 
  LayoutDashboard, 
  LogOut, 
  Languages, 
  Menu, 
  X, 
  RefreshCw, 
  FilePlus2, 
  SearchCheck, 
  ShieldCheck, 
  Users,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';
import toast from 'react-hot-toast';

const Navbar = ({ onOpenGrievance, onOpenTrack }) => {
  const { isAuthenticated, logout } = useAuth();
  const { lang, toggleLang, t } = useLang();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    toast.success(lang === 'hi' ? 'लॉगआउट सफल' : 'Logged out successfully');
    navigate('/');
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    toast.success(lang === 'hi' ? 'पोर्टल रीफ्रेश हो रहा है...' : 'Refreshing portal...');
    setTimeout(() => {
      window.location.reload();
    }, 400);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-2xs w-full transition-all">
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16 lg:h-18">
            
            {/* Left Brand: Ashok Chakra + Title */}
            <Link
              to="/"
              className="flex items-center gap-2 sm:gap-3 group focus:outline-none focus:ring-2 focus:ring-blue-900/30 rounded-xl p-1 min-w-0"
              aria-label={t.navTitle}
            >
              {/* Ashoka Chakra */}
              <div className="relative flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 shrink-0 rounded-full border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50/80 shadow-2xs group-hover:scale-105 transition-all duration-200">
                <svg viewBox="0 0 100 100" className="w-5 h-5 sm:w-7 sm:h-7 text-blue-900" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="4" />
                  <circle cx="50" cy="50" r="41" stroke="currentColor" strokeWidth="1.5" />
                  <circle cx="50" cy="50" r="10" stroke="currentColor" strokeWidth="4" fill="currentColor" />
                  {Array.from({ length: 24 }).map((_, i) => (
                    <line key={i} x1="50" y1="50"
                      x2={50 + 40 * Math.cos((i * 15 * Math.PI) / 180)}
                      y2={50 + 40 * Math.sin((i * 15 * Math.PI) / 180)}
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                    />
                  ))}
                </svg>
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm sm:text-lg lg:text-xl font-bold text-blue-900 tracking-tight group-hover:text-blue-950 transition-colors truncate">
                    {t.navTitle}
                  </span>
                  <span className="hidden sm:inline-flex px-1.5 py-0.2 rounded text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200/80">
                    Gov
                  </span>
                </div>
                <p className="hidden md:block text-[11px] font-medium text-slate-500 tracking-wide truncate">
                  {t.navSubtitle}
                </p>
              </div>
            </Link>

            {/* Desktop Actions (>= md) */}
            <div className="hidden md:flex items-center gap-2 lg:gap-3 shrink-0">
              {/* Refresh Utility Button */}
              <button
                type="button"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-900/30 cursor-pointer"
                title={lang === 'hi' ? 'पोर्टल रीफ्रेश करें' : 'Refresh portal'}
                aria-label="Refresh Portal"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>

              {/* Language Switcher */}
              <button
                type="button"
                onClick={toggleLang}
                className="bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-blue-900/30 cursor-pointer"
                title={lang === 'hi' ? 'Switch to English' : 'हिंदी में देखें'}
                aria-label="Toggle language"
              >
                <Languages className="w-3.5 h-3.5 text-blue-900" />
                <span>{lang === 'hi' ? 'English' : 'हिंदी'}</span>
              </button>

              {/* Admin Actions */}
              {isAuthenticated ? (
                <div className="flex items-center gap-2">
                  <Link
                    to="/admin/dashboard"
                    className="bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs sm:text-sm px-3.5 py-1.5 rounded-lg shadow-2xs transition-all flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-blue-900/40"
                  >
                    <LayoutDashboard className="w-4 h-4 text-blue-200" />
                    <span>{t.adminDashboard}</span>
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 text-xs sm:text-sm font-bold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>{t.logout}</span>
                  </button>
                </div>
              ) : (
                <Link
                  to="/admin/login"
                  className="bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs sm:text-sm px-3.5 py-1.5 rounded-lg shadow-2xs transition-all flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-blue-900/40"
                >
                  <Lock className="w-3.5 h-3.5 text-blue-200" />
                  <span>{t.adminLogin}</span>
                </Link>
              )}
            </div>

            {/* Mobile Controls (< md): Compact Language Toggle + Hamburger Button */}
            <div className="flex md:hidden items-center gap-1.5">
              {/* Quick Language Pill */}
              <button
                type="button"
                onClick={toggleLang}
                className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 transition-colors flex items-center gap-1"
                aria-label="Toggle language"
              >
                <Languages className="w-3.5 h-3.5 text-blue-900" />
                <span>{lang === 'hi' ? 'EN' : 'हि'}</span>
              </button>

              {/* Hamburger Button */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-slate-700 hover:bg-slate-100 border border-slate-200/90 focus:outline-none focus:ring-2 focus:ring-blue-900/30 transition-colors cursor-pointer"
                aria-label={mobileMenuOpen ? 'Close Menu' : 'Open Menu'}
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5 text-slate-900" />
                ) : (
                  <Menu className="w-5 h-5 text-slate-900" />
                )}
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Mobile Drawer Backdrop & Slide-out Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex justify-end">
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity animate-fadeIn"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Panel */}
          <div className="relative w-full max-w-xs sm:max-w-sm bg-white h-full shadow-2xl flex flex-col z-10 animate-slideLeft border-l border-slate-200">
            {/* Drawer Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full border border-blue-200 bg-blue-50 flex items-center justify-center text-blue-900 shrink-0">
                  <ShieldCheck className="w-4 h-4 text-blue-900" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-sm font-bold text-slate-900 leading-tight truncate">ग्राम पंचायत सहरी</h2>
                  <span className="text-[10px] text-slate-500 font-medium">ई-शासन नागरिक पोर्टल</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              
              {/* Language Segmented Toggle */}
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  भाषा चुनें / Language
                </p>
                <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200/80">
                  <button
                    type="button"
                    onClick={() => { if (lang !== 'hi') toggleLang(); }}
                    className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      lang === 'hi'
                        ? 'bg-white text-blue-900 shadow-2xs font-extrabold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span>🇮🇳</span>
                    <span>हिंदी</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { if (lang !== 'en') toggleLang(); }}
                    className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      lang === 'en'
                        ? 'bg-white text-blue-900 shadow-2xs font-extrabold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span>🌐</span>
                    <span>English</span>
                  </button>
                </div>
              </div>

              {/* Navigation Quick Links */}
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  {lang === 'hi' ? 'नागरिक सेवाएं' : 'Citizen Services'}
                </p>
                <div className="space-y-1.5">
                  {onOpenGrievance && (
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onOpenGrievance();
                      }}
                      className="w-full flex items-center justify-between p-3 rounded-xl bg-blue-50/70 hover:bg-blue-100/70 border border-blue-200/80 text-blue-950 font-bold text-xs transition-colors cursor-pointer"
                    >
                      <span className="flex items-center gap-2.5">
                        <FilePlus2 className="w-4 h-4 text-blue-900 shrink-0" />
                        <span>{t.btnNewComplaint}</span>
                      </span>
                      <ChevronRight className="w-4 h-4 text-blue-600 shrink-0" />
                    </button>
                  )}

                  {onOpenTrack && (
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onOpenTrack();
                      }}
                      className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 font-bold text-xs transition-colors cursor-pointer"
                    >
                      <span className="flex items-center gap-2.5">
                        <SearchCheck className="w-4 h-4 text-slate-700 shrink-0" />
                        <span>{t.btnTrackStatus}</span>
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                    </button>
                  )}

                  <a
                    href="#directory"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 font-semibold text-xs transition-colors"
                  >
                    <span className="flex items-center gap-2.5">
                      <Users className="w-4 h-4 text-slate-700 shrink-0" />
                      <span>{lang === 'hi' ? 'पंचायत प्रतिनिधि डायरेक्टरी' : 'Representatives Directory'}</span>
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                  </a>

                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleRefresh();
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 font-semibold text-xs transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2.5">
                      <RefreshCw className="w-4 h-4 text-slate-700 shrink-0" />
                      <span>{lang === 'hi' ? 'डेटा रीफ्रेश करें' : 'Refresh Portal Data'}</span>
                    </span>
                  </button>
                </div>
              </div>

              {/* Admin Actions in Drawer */}
              <div className="pt-2 border-t border-slate-200">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  {lang === 'hi' ? 'प्रशासनिक लॉगिन' : 'Administration'}
                </p>

                {isAuthenticated ? (
                  <div className="space-y-2">
                    <Link
                      to="/admin/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-blue-900 text-white font-bold text-xs shadow-2xs hover:bg-blue-950 transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4 text-blue-200" />
                      <span>{t.adminDashboard}</span>
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-red-50 text-red-700 border border-red-200 font-bold text-xs hover:bg-red-100 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>{t.logout}</span>
                    </button>
                  </div>
                ) : (
                  <Link
                    to="/admin/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-blue-900 text-white font-bold text-xs shadow-2xs hover:bg-blue-950 transition-colors"
                  >
                    <Lock className="w-4 h-4 text-blue-200" />
                    <span>{t.adminLogin}</span>
                  </Link>
                )}
              </div>

            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50/80 text-center">
              <p className="text-[10px] text-slate-500 font-medium">
                ग्राम पंचायत सहरी • डिजिटल पंचायत पहल
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
