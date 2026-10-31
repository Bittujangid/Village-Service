import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Lock,
  User,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowLeft,
  ArrowRight,
  Loader2,
  Languages,
  KeyRound,
  AlertTriangle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';
import { login as adminLoginApi } from '../api/admin';

const AdminLogin = () => {
  const [step, setStep] = useState(1); // 1 = Credentials, 2 = 6-digit Security PIN
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [pin, setPin] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLocked, setIsLocked] = useState(false);

  const { login } = useAuth();
  const { lang, toggleLang, t } = useLang();
  const navigate = useNavigate();

  // Step 1: Validate Username & Password with backend
  const handleStep1Submit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setErrorMsg(
        lang === 'hi'
          ? 'कृपया उपयोगकर्ता नाम (Username) और पासवर्ड दोनों भरें'
          : 'Please enter both Username and Password'
      );
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      // Send credentials to backend to verify step 1
      const res = await adminLoginApi({
        username: username.trim(),
        password: password.trim()
      });

      // If backend signals that PIN is required (or 2FA step)
      if (res?.requirePin || res?.success) {
        setStep(2);
        setErrorMsg('');
      }
    } catch (err) {
      if (err?.response?.status === 429) {
        setIsLocked(true);
      }
      const errorText =
        err?.response?.data?.message ||
        err?.message ||
        (lang === 'hi'
          ? 'गलत उपयोगकर्ता नाम या पासवर्ड! कृपया पुनः प्रयास करें।'
          : 'Invalid credentials. Please try again.');
      setErrorMsg(errorText);
      toast.error(errorText);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Validate 6-digit Security PIN and complete login
  const handleStep2Submit = async (e) => {
    e.preventDefault();
    const cleanPin = pin.trim();

    if (!cleanPin || cleanPin.length !== 6 || !/^\d{6}$/.test(cleanPin)) {
      const msg =
        lang === 'hi'
          ? 'कृपया वैध 6-अंकीय सुरक्षा पिन दर्ज करें'
          : 'Please enter a valid 6-digit Security PIN';
      setErrorMsg(msg);
      toast.error(msg);
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      // Step 2: Send username, password, and pin together
      const response = await adminLoginApi({
        username: username.trim(),
        password: password.trim(),
        pin: cleanPin
      });

      const authToken = response?.token || response?.data?.token;
      if (!authToken) {
        throw new Error(
          lang === 'hi'
            ? 'सर्वर से टोकन प्राप्त नहीं हुआ। कृपया दोबारा प्रयास करें।'
            : 'Did not receive authentication token from server.'
        );
      }

      // Store JWT in safe storage with short expiration
      const expiresInSeconds = response?.expiresIn || 28800; // 8 hours default
      login(authToken, expiresInSeconds);

      toast.success(
        lang === 'hi'
          ? 'सुरक्षा पिन सत्यापित! प्रशासन पोर्टल में आपका स्वागत है।'
          : 'Security PIN verified! Welcome to the Administration Portal.'
      );
      navigate('/admin/dashboard', { replace: true });
    } catch (err) {
      if (err?.response?.status === 429) {
        setIsLocked(true);
      }
      const errorText =
        err?.response?.data?.message ||
        err?.message ||
        (lang === 'hi'
          ? 'अमान्य सुरक्षा पिन! कृपया सही पिन दर्ज करें।'
          : 'Invalid Security PIN. Please try again.');
      setErrorMsg(errorText);
      toast.error(errorText);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-blue-950 to-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* Top Bar with Back Link & Language Switcher */}
      <div className="absolute top-6 left-6 right-6 flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-semibold backdrop-blur-md transition-all touch-target-min"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{lang === 'hi' ? 'मुख्य पृष्ठ पर लौटें' : 'Back to Home'}</span>
        </Link>

        <button
          onClick={toggleLang}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-semibold backdrop-blur-md transition-all touch-target-min cursor-pointer"
        >
          <Languages className="w-4 h-4 text-blue-300" />
          <span>{lang === 'hi' ? 'English' : 'हिंदी'}</span>
        </button>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Emblem / Branding */}
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-xl bg-white shadow-xl flex items-center justify-center p-2 border-2 border-blue-400">
            <svg
              viewBox="0 0 100 100"
              className="w-12 h-12 text-blue-900"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="4" />
              <circle cx="50" cy="50" r="10" stroke="currentColor" strokeWidth="4" fill="currentColor" />
              {Array.from({ length: 24 }).map((_, i) => (
                <line
                  key={i}
                  x1="50"
                  y1="50"
                  x2={50 + 40 * Math.cos((i * 15 * Math.PI) / 180)}
                  y2={50 + 40 * Math.sin((i * 15 * Math.PI) / 180)}
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              ))}
            </svg>
          </div>
        </div>

        <h2 className="mt-4 text-center text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          {t.navTitle} {lang === 'hi' ? 'प्रशासन लॉगिन' : 'Admin Login'}
        </h2>
        <p className="mt-1 text-center text-xs sm:text-sm text-blue-200">
          GramSeva Administrative Control Portal
        </p>

        {/* 2-Step Progress Indicator */}
        <div className="mt-4 flex items-center justify-center gap-2">
          <span
            className={`text-xs px-2.5 py-1 rounded-full font-semibold transition-all ${
              step === 1
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-emerald-600/80 text-emerald-100'
            }`}
          >
            {step === 1 ? '1. क्रेडेंशियल्स' : '✓ 1. क्रेडेंशियल्स'}
          </span>
          <span className="text-white/40 text-xs">→</span>
          <span
            className={`text-xs px-2.5 py-1 rounded-full font-semibold transition-all ${
              step === 2
                ? 'bg-blue-600 text-white shadow-xs ring-2 ring-blue-400'
                : 'bg-white/10 text-white/60'
            }`}
          >
            2. सुरक्षा पिन (2FA PIN)
          </span>
        </div>
      </div>

      {/* Login Card */}
      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-2xl rounded-3xl border border-slate-200">
          {errorMsg && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 shrink-0 text-red-600 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {step === 1 ? (
            /* STEP 1: Username & Password */
            <form onSubmit={handleStep1Submit} className="space-y-5" noValidate>
              {/* Username Field */}
              <div>
                <label
                  htmlFor="admin-username"
                  className="block text-sm font-bold text-slate-800 mb-1"
                >
                  {lang === 'hi' ? 'उपयोगकर्ता नाम' : 'Username'} (Username)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-5 h-5" />
                  </div>
                  <input
                    id="admin-username"
                    type="text"
                    required
                    autoFocus
                    disabled={isLocked}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="sarpanch"
                    className="w-full min-h-[48px] pl-11 pr-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-900 focus:border-blue-900 text-base transition-colors disabled:bg-slate-100 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label
                  htmlFor="admin-password"
                  className="block text-sm font-bold text-slate-800 mb-1"
                >
                  {lang === 'hi' ? 'पासवर्ड' : 'Password'} (Password)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    id="admin-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    disabled={isLocked}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full min-h-[48px] pl-11 pr-12 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-900 focus:border-blue-900 text-base transition-colors disabled:bg-slate-100 disabled:cursor-not-allowed"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none touch-target-min cursor-pointer"
                    aria-label={showPassword ? 'पासवर्ड छिपाएं' : 'पासवर्ड देखें'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>

                {/* Forgot password link */}
                <div className="flex justify-end mt-2">
                  <Link
                    to="/admin/forgot-password"
                    className="text-xs font-semibold text-blue-900 hover:text-blue-950 hover:underline transition-colors"
                  >
                    {t.forgotPasswordLink}
                  </Link>
                </div>
              </div>

              {/* Continue to Step 2 Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading || isLocked}
                  className="w-full min-h-[50px] px-6 py-3.5 rounded-lg bg-blue-900 hover:bg-blue-950 active:scale-[0.98] disabled:opacity-60 text-white font-bold text-base shadow-sm transition-all flex items-center justify-center gap-2 focus:outline-none focus:ring-4 focus:ring-blue-900/30 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>{lang === 'hi' ? 'सत्यापित कर रहे हैं...' : 'Validating Credentials...'}</span>
                    </>
                  ) : (
                    <>
                      <span>{lang === 'hi' ? 'सुरक्षा पिन दर्ज करें' : 'Continue to Security PIN'}</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            /* STEP 2: 6-Digit Security PIN (2FA) */
            <form onSubmit={handleStep2Submit} className="space-y-5" noValidate>
              {/* Account summary banner */}
              <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-blue-950">
                  <User className="w-4 h-4 text-blue-800" />
                  <span>@{username}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setErrorMsg('');
                  }}
                  className="text-xs font-bold text-blue-900 hover:text-blue-950 hover:underline cursor-pointer"
                >
                  {lang === 'hi' ? 'क्रेडेंशियल बदलें' : 'Change'}
                </button>
              </div>

              {/* PIN Field */}
              <div>
                <label
                  htmlFor="admin-pin"
                  className="block text-sm font-bold text-slate-800 mb-1"
                >
                  {lang === 'hi' ? 'सुरक्षा पिन (6-Digit Security PIN)' : 'Security PIN (6-Digit PIN)'}{' '}
                  <span className="text-red-500">*</span>
                </label>
                <p className="text-xs text-slate-500 mb-2">
                  {lang === 'hi'
                    ? 'ग्राम पंचायत प्रशासनिक सुरक्षा के लिए 6-अंकीय मास्टर पिन दर्ज करें'
                    : 'Enter the 6-digit master security PIN for administrative authentication'}
                </p>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <input
                    id="admin-pin"
                    type={showPin ? 'text' : 'password'}
                    required
                    autoFocus
                    maxLength={6}
                    pattern="[0-9]*"
                    inputMode="numeric"
                    disabled={isLocked}
                    value={pin}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                      setPin(val);
                    }}
                    placeholder="••••••"
                    className="w-full min-h-[50px] pl-11 pr-12 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-900 focus:border-blue-900 text-center tracking-[0.5em] text-xl font-bold font-mono transition-colors disabled:bg-slate-100 disabled:cursor-not-allowed"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none touch-target-min cursor-pointer"
                    aria-label={showPin ? 'पिन छिपाएं' : 'पिन देखें'}
                  >
                    {showPin ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2 space-y-2">
                <button
                  type="submit"
                  disabled={loading || pin.length !== 6 || isLocked}
                  className="w-full min-h-[50px] px-6 py-3.5 rounded-lg bg-blue-900 hover:bg-blue-950 active:scale-[0.98] disabled:opacity-60 text-white font-bold text-base shadow-sm transition-all flex items-center justify-center gap-2 focus:outline-none focus:ring-4 focus:ring-blue-900/30 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>{lang === 'hi' ? 'सत्यापित कर रहे हैं...' : 'Verifying PIN...'}</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-5 h-5" />
                      <span>{lang === 'hi' ? 'सुरक्षित लॉगिन करें' : 'Verify & Sign In'}</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setErrorMsg('');
                  }}
                  className="w-full py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 transition-colors cursor-pointer"
                >
                  ← {lang === 'hi' ? 'वापस जाएं (Back)' : 'Back to Credentials'}
                </button>
              </div>
            </form>
          )}

          {/* Security notice */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-400">
              🔒 {lang === 'hi' ? 'यह पोर्टल केवल अधिकृत ग्राम पंचायत अधिकारियों के लिए है।' : 'Authorized access for Gram Panchayat officials only.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
