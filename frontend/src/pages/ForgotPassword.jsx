import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, Send, Loader2, Languages, CheckCircle2, AlertCircle, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';
import { useLang } from '../context/LanguageContext';
import { forgotPassword as forgotPasswordApi } from '../api/admin';

const ForgotPassword = () => {
  const { lang, toggleLang, t } = useLang();
  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [maskedEmail, setMaskedEmail] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setErrorMsg(lang === 'hi' 
        ? 'कृपया अपना उपयोगकर्ता नाम या पंजीकृत ईमेल दर्ज करें' 
        : 'Please enter your username or registered email');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const response = await forgotPasswordApi(identifier.trim());
      setIsSubmitted(true);
      if (response?.email) {
        setMaskedEmail(response.email);
      }
      toast.success(response?.message || t.resetEmailSentTitle);
    } catch (err) {
      console.warn('Forgot password request error:', err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        (lang === 'hi'
          ? 'रीसेट लिंक भेजने में त्रुटि हुई। कृपया पुनः प्रयास करें।'
          : 'Failed to send reset link. Please try again.');
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
          {t.forgotPasswordTitle}
        </h2>
        <p className="mt-1 text-center text-xs sm:text-sm text-emerald-300">
          {t.forgotPasswordSubtitle}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-2xl rounded-3xl border border-emerald-100">
          {isSubmitted ? (
            /* Confirmation Screen */
            <div className="text-center space-y-5 animate-fadeIn">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-inner">
                <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  {t.resetEmailSentTitle}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                  {t.resetEmailSentDesc}
                  {maskedEmail && (
                    <span className="block mt-1 font-mono font-bold text-emerald-800">
                      ({maskedEmail})
                    </span>
                  )}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs text-left">
                <p className="font-bold flex items-center gap-1.5 mb-1 text-amber-800">
                  <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                  <span>{lang === 'hi' ? 'महत्वपूर्ण' : 'Important Note'}:</span>
                </p>
                <p>{t.checkInboxNote}</p>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <Link
                  to="/admin/login"
                  className="w-full min-h-[46px] px-5 py-2.5 rounded-lg bg-blue-900 hover:bg-blue-950 text-white font-bold text-sm shadow-sm flex items-center justify-center gap-2 transition-all"
                >
                  {t.backToLogin}
                </Link>

                <button
                  type="button"
                  onClick={() => setIsSubmitted(false)}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-700 underline mt-1"
                >
                  {lang === 'hi' ? 'दूसरा ईमेल या यूज़रनेम आज़माएं' : 'Try another username or email'}
                </button>
              </div>
            </div>
          ) : (
            /* Request Form */
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              {errorMsg && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm font-medium flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div>
                <label
                  htmlFor="reset-identifier"
                  className="block text-sm font-bold text-slate-800 mb-1"
                >
                  {lang === 'hi' ? 'उपयोगकर्ता नाम या ईमेल' : 'Username or Registered Email'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-5 h-5" />
                  </div>
                  <input
                    id="reset-identifier"
                    type="text"
                    required
                    autoFocus
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder={lang === 'hi' ? 'sarpanch या admin@gramseva.in' : 'sarpanch or admin@gramseva.in'}
                    className="w-full min-h-[48px] pl-11 pr-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-900 focus:border-blue-900 text-base transition-colors"
                  />
                </div>
                <p className="mt-1.5 text-[11px] text-slate-500">
                  {lang === 'hi'
                    ? 'रीसेट लिंक केवल पंजीकृत ईमेल पते पर भेजा जाएगा।'
                    : 'The reset link will be dispatched only to your registered email address.'}
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full min-h-[50px] px-6 py-3.5 rounded-lg bg-blue-900 hover:bg-blue-950 active:scale-[0.98] disabled:opacity-60 text-white font-bold text-base shadow-sm transition-all flex items-center justify-center gap-2 focus:outline-none focus:ring-4 focus:ring-blue-900/30"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>{t.sendingResetLink}</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>{t.sendResetLinkBtn}</span>
                    </>
                  )}
                </button>
              </div>

              <div className="pt-2 text-center">
                <Link
                  to="/admin/login"
                  className="text-xs font-semibold text-slate-600 hover:text-emerald-700 flex items-center justify-center gap-1 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>{t.backToLogin}</span>
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
