import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, LayoutDashboard, LogOut, Languages } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';
import toast from 'react-hot-toast';

const Navbar = () => {
  const { isAuthenticated, logout } = useAuth();
  const { lang, toggleLang, t } = useLang();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success(lang === 'hi' ? 'लॉगआउट सफल' : 'Logged out successfully');
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-lg border-b border-slate-200/80 shadow-sm w-full overflow-hidden">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-20">
          {/* Left Brand */}
          <Link
            to="/"
            className="flex items-center gap-2 sm:gap-3 group focus:outline-none focus:ring-2 focus:ring-blue-900 rounded-xl p-0.5 sm:p-1 min-w-0"
            aria-label={t.navTitle}
          >
            {/* Ashoka Chakra */}
            <div className="relative flex items-center justify-center w-8 h-8 sm:w-12 sm:h-12 shrink-0 rounded-full border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-inner group-hover:scale-105 transition-all duration-200">
              <svg viewBox="0 0 100 100" className="w-5 h-5 sm:w-9 sm:h-9 text-blue-900" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
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
              <h1 className="text-sm sm:text-xl font-black text-blue-900 tracking-tight leading-none group-hover:text-blue-950 transition-colors truncate max-w-[170px] sm:max-w-none">
                {t.navTitle}
              </h1>
              <span className="hidden sm:block text-[10px] sm:text-xs font-semibold text-slate-500 tracking-wide mt-0.5">
                {t.navSubtitle}
              </span>
            </div>
          </Link>

          {/* Right Actions */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Language Toggle */}
            <button
              onClick={toggleLang}
              className="bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/90 shadow-2xs px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center gap-1 sm:gap-1.5 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-900/30 group"
              title={lang === 'hi' ? 'Switch to English' : 'हिंदी में देखें'}
              aria-label="Toggle language"
            >
              <Languages className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-600 transition-transform group-hover:rotate-12 group-hover:text-blue-900" />
              <span className="md:hidden">{lang === 'hi' ? 'EN' : 'हि'}</span>
              <span className="hidden md:inline">{lang === 'hi' ? 'English' : 'हिंदी'}</span>
            </button>

            {/* Admin actions */}
            {isAuthenticated ? (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Link
                  to="/admin/dashboard"
                  className="bg-blue-900 hover:bg-blue-950 text-white font-semibold text-xs sm:text-sm px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-lg shadow-sm transition-all duration-200 flex items-center gap-1 sm:gap-1.5 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-900/40"
                >
                  <LayoutDashboard className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-200" />
                  <span className="hidden sm:inline">{t.adminDashboard}</span>
                  <span className="sm:hidden">Admin</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 text-xs sm:text-sm font-semibold px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg transition-all duration-200 flex items-center gap-1 active:scale-95"
                >
                  <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">{t.logout}</span>
                </button>
              </div>
            ) : (
              <Link
                to="/admin/login"
                className="bg-blue-900 hover:bg-blue-950 text-white font-semibold text-xs sm:text-sm px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg shadow-sm transition-all duration-200 flex items-center gap-1.5 sm:gap-2 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-900/40"
              >
                <Lock className="w-3.5 h-3.5 text-blue-200 group-hover:text-white shrink-0" />
                <span className="tracking-wide whitespace-nowrap">{t.adminLogin}</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
