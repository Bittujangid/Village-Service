import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Lock, Eye, EyeOff, ShieldCheck, CheckCircle2, AlertCircle, Loader2, Languages, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { useLang } from '../context/LanguageContext';
import { resetPassword as resetPasswordApi } from '../api/admin';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { lang, toggleLang, t } = useLang();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [countdown, setCountdown] = useState(3);

  // Auto redirect countdown on success
  useEffect(() => {
    let timer;
    if (isSuccess && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (isSuccess && countdown === 0) {
      navigate('/admin/login', { replace: true });
    }
    return () => clearTimeout(timer);
  }, [isSuccess, countdown, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!token) {
      setErrorMsg(lang === 'hi' ? 'रीसेट टोकन अनुपलब्ध है' : 'Reset token is missing');
      return;
    }

    if (!password) {
      setErrorMsg(lang === 'hi' ? 'कृपया नया पासवर्ड दर्ज करें' : 'Please enter a new password');
      return;
    }

    if (password.length < 8) {
      setErrorMsg(lang === 'hi' 
        ? 'पासवर्ड कम से कम 8 अक्षरों का होना चाहिए (Password must be at least 8 characters)' 
        : 'Password must be at least 8 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg(lang === 'hi' 
        ? 'दोनों पासवर्ड मेल नहीं खाते हैं (Passwords do not match)' 
        : 'Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const response = await resetPasswordApi(token, {
        password,
        confirmPassword,
      });

      setIsSuccess(true);
      toast.success(response?.message || t.passwordResetSuccess);
    } catch (err) {
      console.warn('Password reset error:', err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        (lang === 'hi'
          ? 'रीसेट लिंक अमान्य या समाप्त हो चुका है।'
          : 'Reset link is invalid or has expired.');
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-blue-950 to-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* Top Header Actions */}
      <div className="absolute top-6 left-6 right-6 flex items-center justify-between">
        <Link
          to="/admin/login"
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-semibold backdrop-blur-md transition-all touch-target-min"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.backToLogin}</span>
        </Link>

        <button
          onClick={toggleLang}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-semibold backdrop-blur-md transition-all touch-target-min"
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
          {t.resetPasswordTitle}
        </h2>
        <p className="mt-1 text-center text-xs sm:text-sm text-slate-300">
          {t.resetPasswordSubtitle}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xl rounded-2xl border border-slate-200">
          {isSuccess ? (
            /* Success State */
            <div className="text-center space-y-5 animate-fadeIn">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-inner">
                <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  {t.passwordResetSuccess}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-2">
                  {lang === 'hi'
                    ? `आपको ${countdown} सेकंड में लॉगिन पृष्ठ पर भेजा जा रहा है...`
                    : `Redirecting to login page in ${countdown} seconds...`}
                </p>
              </div>

              <div className="pt-2">
                <Link
                  to="/admin/login"
                  className="w-full min-h-[48px] px-5 py-3 rounded-lg bg-blue-900 hover:bg-blue-950 text-white font-bold text-sm shadow-sm flex items-center justify-center gap-2 transition-all"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{t.backToLogin}</span>
                </Link>
              </div>
            </div>
          ) : (
            /* Reset Form */
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              {errorMsg && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm font-medium flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* New Password */}
              <div>
                <label
                  htmlFor="new-password"
                  className="block text-sm font-bold text-slate-800 mb-1"
                >
                  {t.newPasswordLabel}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    id="new-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoFocus
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t.newPasswordPlaceholder}
                    className="w-full min-h-[48px] pl-11 pr-12 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-900 focus:border-blue-900 text-base transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none touch-target-min"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  {lang === 'hi' ? 'न्यूनतम 8 अक्षर आवश्यक हैं' : 'Minimum 8 characters required'}
                </span>
              </div>

              {/* Confirm Password */}
              <div>
                <label
                  htmlFor="confirm-password"
                  className="block text-sm font-bold text-slate-800 mb-1"
                >
                  {t.confirmPasswordLabel}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    id="confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={t.confirmPasswordPlaceholder}
                    className="w-full min-h-[48px] pl-11 pr-12 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-900 focus:border-blue-900 text-base transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none touch-target-min"
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full min-h-[50px] px-6 py-3.5 rounded-lg bg-blue-900 hover:bg-blue-950 active:scale-[0.98] disabled:opacity-60 text-white font-bold text-base shadow-sm transition-all flex items-center justify-center gap-2 focus:outline-none focus:ring-4 focus:ring-blue-900/30"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>{t.resettingPassword}</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-5 h-5" />
                      <span>{t.resetPasswordBtn}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
