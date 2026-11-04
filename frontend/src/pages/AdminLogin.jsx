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
  KeyRound,
  AlertTriangle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { setPersistence, browserSessionPersistence, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebase';
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
  const { lang, t } = useLang();
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
      // Enforce session-only persistence in Firebase Auth explicitly awaited
      await setPersistence(auth, browserSessionPersistence).catch((fbErr) => {
        console.warn('Firebase setPersistence notice:', fbErr?.message);
      });

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
      // Enforce session-only persistence in Firebase Auth explicitly awaited BEFORE any sign-in
      await setPersistence(auth, browserSessionPersistence).catch((fbErr) => {
        console.warn('Firebase setPersistence notice:', fbErr?.message);
      });

      // If email/password login is also used with Firebase Auth:
      if (username.trim().includes('@')) {
        try {
          await signInWithEmailAndPassword(auth, username.trim(), password.trim());
        } catch (fbErr) {
          console.warn('Firebase Auth email sign-in notice:', fbErr?.message);
        }
      }

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
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 font-sans antialiased flex flex-col justify-between sm:justify-center py-4 px-3 sm:px-6 lg:px-8">
      {/* Top Navigation Row */}
      <div className="w-full flex items-center justify-start px-2 sm:px-4 pt-2 pb-2 max-w-4xl mx-auto">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-slate-200 hover:text-white text-xs font-medium backdrop-blur-md transition-all active:scale-[0.98] select-none touch-manipulation"
        >
          <ArrowLeft className="w-3.5 h-3.5 shrink-0" />
          <span>{lang === 'hi' ? 'मुख्य पृष्ठ पर लौटें' : 'Back to Home'}</span>
        </Link>
      </div>

      <div className="my-auto py-2 sm:py-4 w-full sm:max-w-md sm:mx-auto">
        {/* Emblem / Branding */}
        <div className="flex justify-center mt-2 sm:mt-0">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-white shadow-md flex items-center justify-center p-2 border border-slate-200">
            <svg
              viewBox="0 0 100 100"
              className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600"
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

        <h1 className="mt-3 sm:mt-4 text-center text-xl sm:text-2xl font-bold text-white tracking-tight px-2">
          {lang === 'hi' ? 'ग्राम पंचायत प्रशासन लॉगिन' : 'Gram Panchayat Admin Login'}
        </h1>
        <p className="mt-1 text-center text-xs sm:text-sm text-slate-400 px-2">
          {lang === 'hi' ? 'अधिकृत प्रशासनिक नियंत्रण पोर्टल' : 'Official Administrative Control Portal'}
        </p>

        {/* 2-Step Progress Indicator */}
        <div className="mt-4 flex items-center justify-center gap-2 px-3">
          <span
            className={`text-xs px-2.5 py-1 rounded-md font-medium transition-all ${
              step === 1
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30'
            }`}
          >
            {step === 1
              ? (lang === 'hi' ? '1. क्रेडेंशियल्स' : '1. Credentials')
              : (lang === 'hi' ? '✓ 1. क्रेडेंशियल्स' : '✓ 1. Credentials')}
          </span>
          <span className="text-slate-600 text-xs">→</span>
          <span
            className={`text-xs px-2.5 py-1 rounded-md font-medium transition-all ${
              step === 2
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white/5 text-slate-400 border border-white/10'
            }`}
          >
            {lang === 'hi' ? '2. सुरक्षा पिन' : '2. Security PIN (2FA)'}
          </span>
        </div>

        {/* Login Card */}
        <div className="mt-5 sm:mt-6">
          <div className="bg-white py-6 sm:py-8 px-5 sm:px-8 shadow-xl rounded-xl border border-slate-200/80">
            {errorMsg && (
              <div className="mb-5 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm font-medium flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {step === 1 ? (
              /* STEP 1: Username & Password */
              <form onSubmit={handleStep1Submit} className="space-y-4" noValidate>
                {/* Username Field */}
                <div>
                  <label
                    htmlFor="admin-username"
                    className="block text-xs font-semibold text-slate-700 tracking-wide uppercase mb-1.5"
                  >
                    {lang === 'hi' ? 'यूज़रनेम / यूज़र आईडी' : 'Username'}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      id="admin-username"
                      type="text"
                      required
                      autoFocus
                      disabled={isLocked}
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder={lang === 'hi' ? 'उदा. sarpanch_sahari' : 'e.g. sarpanch_sahari'}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition disabled:bg-slate-100 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <label
                    htmlFor="admin-password"
                    className="block text-xs font-semibold text-slate-700 tracking-wide uppercase mb-1.5"
                  >
                    {lang === 'hi' ? 'पासवर्ड' : 'Password'}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id="admin-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      disabled={isLocked}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition disabled:bg-slate-100 disabled:cursor-not-allowed"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                      aria-label={showPassword ? 'पासवर्ड छिपाएं' : 'पासवर्ड देखें'}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {/* Forgot password link */}
                  <div className="flex justify-end mt-1.5">
                    <Link
                      to="/admin/forgot-password"
                      className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                    >
                      {lang === 'hi' ? 'पासवर्ड भूल गए?' : 'Forgot Password?'}
                    </Link>
                  </div>
                </div>

                {/* Continue to Step 2 Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading || isLocked}
                    className="w-full py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 active:scale-[0.98] disabled:opacity-60 text-white font-medium text-sm shadow-xs transition flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-600/20 cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>{lang === 'hi' ? 'सत्यापित कर रहे हैं...' : 'Validating Credentials...'}</span>
                      </>
                    ) : (
                      <>
                        <span>{lang === 'hi' ? 'आगे बढ़ें (सुरक्षा पिन)' : 'Continue to Security PIN'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              /* STEP 2: 6-Digit Security PIN (2FA) */
              <form onSubmit={handleStep2Submit} className="space-y-4" noValidate>
                {/* Account summary banner */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-700">
                    <User className="w-3.5 h-3.5 text-slate-500" />
                    <span>@{username}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setStep(1);
                      setErrorMsg('');
                    }}
                    className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                  >
                    {lang === 'hi' ? 'क्रेडेंशियल बदलें' : 'Change'}
                  </button>
                </div>

                {/* PIN Field */}
                <div>
                  <label
                    htmlFor="admin-pin"
                    className="block text-xs font-semibold text-slate-700 tracking-wide uppercase mb-1"
                  >
                    {lang === 'hi' ? 'सुरक्षा पिन' : 'Security PIN'}{' '}
                    <span className="text-rose-500">*</span>
                  </label>
                  <p className="text-xs text-slate-500 mb-2">
                    {lang === 'hi'
                      ? 'ग्राम पंचायत प्रशासनिक सुरक्षा के लिए 6-अंकीय मास्टर पिन दर्ज करें'
                      : 'Enter the 6-digit master security PIN for administrative authentication'}
                  </p>

                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <KeyRound className="w-4 h-4" />
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
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 text-center tracking-[0.4em] text-lg font-bold font-mono transition disabled:bg-slate-100 disabled:cursor-not-allowed"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPin(!showPin)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                      aria-label={showPin ? 'पिन छिपाएं' : 'पिन देखें'}
                    >
                      {showPin ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-2 space-y-2">
                  <button
                    type="submit"
                    disabled={loading || pin.length !== 6 || isLocked}
                    className="w-full py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 active:scale-[0.98] disabled:opacity-60 text-white font-medium text-sm shadow-xs transition flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-600/20 cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>{lang === 'hi' ? 'सत्यापित कर रहे हैं...' : 'Verifying PIN...'}</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
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
                    className="w-full py-1.5 text-xs font-medium text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
                  >
                    ← {lang === 'hi' ? 'वापस जाएं' : 'Back to Credentials'}
                  </button>
                </div>
              </form>
            )}

            {/* Security notice */}
            <div className="mt-6 pt-4 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-500 flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>
                  {lang === 'hi'
                    ? 'यह पोर्टल केवल अधिकृत ग्राम पंचायत अधिकारियों के लिए है।'
                    : 'Authorized access for Gram Panchayat officials only.'}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
