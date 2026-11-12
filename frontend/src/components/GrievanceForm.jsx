import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  X, 
  UploadCloud, 
  Send, 
  ShieldCheck, 
  Sparkles,
  KeyRound,
  Check,
  Edit2,
  Copy,
  Download,
  Landmark,
  FileText
} from 'lucide-react';
import toast from 'react-hot-toast';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { QRCodeSVG } from 'qrcode.react';
import html2canvas from 'html2canvas';
import { auth } from '../config/firebase';
import { submitComplaint } from '../api/complaints';
import { generateAiDescription } from '../api/ai';
import { useLang } from '../context/LanguageContext';

const getCategories = (lang) => [
  { id: 'पानी / हैंडपंप', label: lang === 'hi' ? 'पानी / हैंडपंप' : 'Water / Handpump', emoji: '💧', sublabel: lang === 'hi' ? 'पेयजल एवं जल आपूर्ति' : 'Water Supply' },
  { id: 'बिजली / स्ट्रीट लाइट', label: lang === 'hi' ? 'बिजली / स्ट्रीट लाइट' : 'Electricity / Streetlight', emoji: '⚡', sublabel: lang === 'hi' ? 'विद्युत एवं प्रकाश' : 'Electricity & Lights' },
  { id: 'सड़क / नाली', label: lang === 'hi' ? 'सड़क / नाली' : 'Road / Drainage', emoji: '🛣️', sublabel: lang === 'hi' ? 'सड़क एवं जल निकासी' : 'Roads & Drainage' },
  { id: 'सफाई व्यवस्था', label: lang === 'hi' ? 'सफाई व्यवस्था' : 'Sanitation & Cleanliness', emoji: '🧹', sublabel: lang === 'hi' ? 'कचरा एवं स्वच्छता' : 'Sanitation & Waste' },
  { id: 'अन्य', label: lang === 'hi' ? 'अन्य समस्या' : 'Other Problem', emoji: '📋', sublabel: lang === 'hi' ? 'अन्य सामान्य विषय' : 'Other General Issues' },
];

const WARDS = Array.from({ length: 7 }, (_, i) => i + 1);

const GrievanceForm = ({ onSuccessClose }) => {
  const { lang, t } = useLang();
  const isHi = lang === 'hi';
  const categories = getCategories(lang);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    ward: '',
    category: '',
    description: '',
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [successResult, setSuccessResult] = useState(null);
  const [copiedId, setCopiedId] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const receiptRef = useRef(null);

  // Phone OTP States
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [isDevOtp, setIsDevOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  const otpInputRef = useRef(null);
  const recaptchaVerifierRef = useRef(null);

  // Helper to completely clean up and hide reCAPTCHA badge from DOM
  const cleanupRecaptcha = () => {
    try {
      if (recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current.clear();
        recaptchaVerifierRef.current = null;
      }
    } catch (e) {
      console.warn('recaptchaVerifierRef clear notice:', e?.message);
    }

    try {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    } catch (e) {
      console.warn('window.recaptchaVerifier clear notice:', e?.message);
    }

    try {
      // Find all reCAPTCHA badges in DOM and hide / disable pointer events
      const badges = document.querySelectorAll('.grecaptcha-badge');
      badges.forEach((badge) => {
        badge.style.display = 'none';
        badge.style.visibility = 'hidden';
        badge.style.pointerEvents = 'none';
        badge.style.opacity = '0';
        badge.style.zIndex = '-9999';
        badge.classList.add('recaptcha-hidden');
      });

      document.body.classList.add('recaptcha-verified');

      const container = document.getElementById('recaptcha-container');
      if (container) {
        container.innerHTML = '';
      }
    } catch (e) {
      console.warn('Recaptcha DOM cleanup notice:', e?.message);
    }
  };

  // Scroll the modal's own scrollable container back to show the focused content.
  // We intentionally do NOT call window.scrollTo() here — that triggers a
  // viewport repaint on Android Chrome that collapses the modal height into a
  // white dead-zone whenever the virtual keyboard dismisses.
  const handleInputBlur = () => {
    // No-op: the modal scroll container handles its own scroll position.
    // Removing window.scrollTo() prevents the Android Chrome blank-gap bug.
  };

  // OTP Resend Cooldown Timer
  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Clean up reCAPTCHA verifier on unmount
  useEffect(() => {
    return () => {
      cleanupRecaptcha();
      document.body.classList.remove('recaptcha-verified');
    };
  }, []);

  // Ensure reCAPTCHA badge is permanently hidden whenever phone is verified
  useEffect(() => {
    if (isPhoneVerified) {
      cleanupRecaptcha();
    }
  }, [isPhoneVerified]);

  // Autofocus OTP input when OTP is sent (desktop only to prevent mobile keyboard viewport shifts)
  useEffect(() => {
    if (otpSent && !isPhoneVerified && window.innerWidth >= 640) {
      const timer = setTimeout(() => {
        otpInputRef.current?.focus();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [otpSent, isPhoneVerified]);

  // Initialize Firebase RecaptchaVerifier
  const initRecaptchaVerifier = () => {
    cleanupRecaptcha();
    document.body.classList.remove('recaptcha-verified');

    const container = document.getElementById('recaptcha-container');
    if (!container) return null;

    try {
      const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {
          // reCAPTCHA solved
        },
        'expired-callback': () => {
          toast.error(
            lang === 'hi'
              ? 'reCAPTCHA सत्यापन समाप्त हो गया। कृपया पुनः प्रयास करें।'
              : 'reCAPTCHA expired. Please try again.'
          );
        }
      });
      recaptchaVerifierRef.current = verifier;
      window.recaptchaVerifier = verifier;
      return verifier;
    } catch (err) {
      console.warn('Recaptcha init error:', err);
      return null;
    }
  };

  // Send SMS OTP via Firebase Phone Auth
  const handleSendOtp = async () => {
    const phoneRegex = /^[6-9]\d{9}$/;
    const cleanPhone = formData.phone.trim();

    if (!cleanPhone || !phoneRegex.test(cleanPhone)) {
      setErrors((prev) => ({
        ...prev,
        phone:
          lang === 'hi'
            ? 'कृपया 10 अंकों का वैध मोबाइल नंबर दर्ज करें (6-9 से शुरू)'
            : 'Please enter a valid 10-digit mobile number starting with 6-9'
      }));
      return;
    }

    setIsSendingOtp(true);
    setOtpCode(''); // Ensure input starts completely empty
    setIsDevOtp(false);

    try {
      const verifier = initRecaptchaVerifier();
      if (!verifier) {
        throw new Error(
          lang === 'hi'
            ? 'reCAPTCHA लोड नहीं हो सका। कृपया पुनः प्रयास करें।'
            : 'reCAPTCHA could not be initialized. Please try again.'
        );
      }

      const formattedPhone = `+91${cleanPhone}`;
      const confirmation = await signInWithPhoneNumber(auth, formattedPhone, verifier);
      setConfirmationResult(confirmation);
      setIsDevOtp(false);
      setOtpSent(true);
      setOtpCode(''); // Keep input field empty for real user SMS code
      setResendCooldown(60);
      toast.success(
        t.otpSentSuccess ||
        (lang === 'hi'
          ? 'OTP आपके मोबाइल पर भेज दिया गया है।'
          : 'OTP has been sent to your mobile.')
      );
    } catch (error) {
      console.warn('Firebase send OTP attempt note:', error?.code || error?.message);

      // Check for billing-not-enabled, operation-not-allowed, or quota/network issues
      const isBillingOrDevError =
        error?.code === 'auth/billing-not-enabled' ||
        error?.code === 'auth/operation-not-allowed' ||
        error?.code === 'auth/quota-exceeded' ||
        error?.code === 'auth/too-many-requests' ||
        error?.code === 'auth/internal-error' ||
        (error?.message && error.message.toLowerCase().includes('billing'));

      if (isBillingOrDevError) {
        // Dynamic Fallback for ANY Number during development/testing
        // Do NOT show a blocking red toast
        setIsDevOtp(true);
        setConfirmationResult(null);
        setOtpSent(true);
        setOtpCode('');
        setResendCooldown(30);

        toast(
          lang === 'hi'
            ? 'Dev Mode Active: Please use test code 123456 to verify.'
            : 'Dev Mode Active: Please use test code 123456 to verify.',
          {
            icon: 'ℹ️',
            duration: 6000,
            style: {
              background: '#064e3b',
              color: '#ecfdf5',
              fontWeight: '600',
              borderRadius: '12px',
              border: '1px solid #10b981'
            }
          }
        );
      } else {
        // Genuine invalid phone number format
        let errorMsg =
          lang === 'hi'
            ? 'OTP भेजने में विफल। कृपया पुनः प्रयास करें।'
            : 'Failed to send OTP. Please try again.';

        if (error?.code === 'auth/invalid-phone-number') {
          errorMsg =
            lang === 'hi'
              ? 'अमान्य मोबाइल नंबर दर्ज किया गया है।'
              : 'Invalid phone number format.';
        } else if (error?.message) {
          errorMsg = error.message;
        }

        toast.error(errorMsg);
      }

      // Clear verifier on failure so next attempt gets a fresh verifier
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
        } catch (e) {}
        window.recaptchaVerifier = null;
      }
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Verify SMS OTP
  const handleVerifyOtp = async () => {
    const cleanOtp = otpCode.trim();
    if (!cleanOtp || cleanOtp.length !== 6) {
      toast.error(
        lang === 'hi'
          ? 'कृपया 6 अंकों का OTP दर्ज करें'
          : 'Please enter a 6-digit OTP'
      );
      return;
    }

    setIsVerifyingOtp(true);
    try {
      // 1. If Dev Mode is active (Billing not enabled / Quota fallback)
      if (isDevOtp) {
        if (cleanOtp === '123456') {
          setIsPhoneVerified(true);
          setOtpSent(false);
          setOtpCode('');
          setErrors((prev) => ({ ...prev, phone: '' }));
          cleanupRecaptcha();
          if (document.activeElement && typeof document.activeElement.blur === 'function') {
            document.activeElement.blur();
          }
          toast.success(
            lang === 'hi'
              ? 'नंबर सफलतापूर्वक सत्यापित (Dev Mode)'
              : 'Phone Verified (Dev Mode)'
          );
          return;
        } else {
          throw new Error(
            lang === 'hi'
              ? 'अमान्य OTP कोड। Dev Mode में 123456 दर्ज करें।'
              : 'Invalid OTP code. In Dev Mode, please enter 123456.'
          );
        }
      }

      // 2. Real Firebase confirmation (test number in Firebase console or live SMS)
      if (confirmationResult) {
        await confirmationResult.confirm(cleanOtp);
        setIsPhoneVerified(true);
        setOtpSent(false);
        setOtpCode('');
        setErrors((prev) => ({ ...prev, phone: '' }));
        cleanupRecaptcha();
        if (document.activeElement && typeof document.activeElement.blur === 'function') {
          document.activeElement.blur();
        }
        toast.success(
          t.otpVerifySuccess ||
          (lang === 'hi'
            ? 'मोबाइल नंबर सफलतापूर्वक सत्यापित हुआ!'
            : 'Mobile number verified successfully!')
        );
        return;
      }

      throw new Error(
        lang === 'hi'
          ? 'कृपया पहले "OTP भेजें" पर क्लिक करें।'
          : 'Please send OTP first.'
      );
    } catch (error) {
      console.error('Firebase verify OTP error:', error);
      let errorMsg =
        lang === 'hi'
          ? 'गलत OTP कोड। कृपया सही कोड दर्ज करें।'
          : 'Invalid OTP code. Please enter the correct code.';

      if (error?.code === 'auth/invalid-verification-code') {
        errorMsg =
          lang === 'hi'
            ? 'गलत OTP कोड। कृपया SMS में प्राप्त 6-अंकीय कोड दर्ज करें।'
            : 'Invalid OTP code. Please re-check the SMS code.';
      } else if (error?.code === 'auth/code-expired') {
        errorMsg =
          lang === 'hi'
            ? 'OTP की समय सीमा समाप्त हो गई है। कृपया पुनः नया OTP भेजें।'
            : 'OTP expired. Please request a new OTP.';
      } else if (error?.message) {
        errorMsg = error.message;
      }

      toast.error(errorMsg);
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  // Field change handler
  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  // Image change handler
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error(lang === 'hi' ? 'कृपया केवल फोटो (Image file) चुनें' : 'Please select an image file only');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error(lang === 'hi' ? 'फोटो का आकार 10MB से कम होना चाहिए' : 'Image size must be under 10MB');
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      if (errors.photo) {
        setErrors((prev) => ({ ...prev, photo: '' }));
      }
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }
  };

  // AI Auto-Write Description using Gemini Vision
  const handleAiGenerateDescription = async () => {
    if (!imageFile) {
      toast(
        isHi ? 'कृपया पहले समस्या की फोटो संलग्न करें' : 'Please attach a photo first',
        { icon: '📸' }
      );
      setErrors((prev) => ({
        ...prev,
        photo: isHi ? 'कृपया पहले समस्या की फोटो संलग्न करें' : 'Please attach a photo first',
      }));
      return;
    }

    setIsGeneratingAi(true);
    try {
      // Convert image file to base64 data URL
      const base64Data = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(imageFile);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (err) => reject(err);
      });

      const res = await generateAiDescription({
        imageBase64: base64Data,
        ward: formData.ward,
        category: formData.category,
        language: lang,
      });

      if (res?.description) {
        setFormData((prev) => ({
          ...prev,
          description: res.description,
        }));
        setErrors((prev) => {
          const next = { ...prev };
          delete next.description;
          return next;
        });
        toast.success(
          isHi ? '✨ AI द्वारा विवरण लिखा गया!' : '✨ Description generated with AI!'
        );
      }
    } catch (err) {
      console.warn('AI generate description error:', err);
      const msg =
        err?.response?.data?.message ||
        (isHi ? 'AI विवरण तैयार करने में समस्या आई' : 'Failed to generate AI description');
      toast.error(msg);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Validation
  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim() || formData.name.trim().length < 3) {
      newErrors.name = lang === 'hi'
        ? 'कृपया अपना पूरा नाम लिखें (न्यूनतम 3 अक्षर)'
        : 'Please enter your full name (minimum 3 characters)';
    }

    // Indian 10-digit mobile number validation
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!formData.phone.trim()) {
      newErrors.phone = lang === 'hi' ? 'मोबाइल नंबर अनिवार्य है' : 'Mobile number is required';
    } else if (!phoneRegex.test(formData.phone.trim())) {
      newErrors.phone = lang === 'hi'
        ? 'कृपया 10 अंकों का वैध मोबाइल नंबर दर्ज करें (6-9 से शुरू)'
        : 'Please enter a valid 10-digit mobile number starting with 6-9';
    } else if (!isPhoneVerified) {
      newErrors.phone = t.otpRequired;
    }

    if (!formData.ward) {
      newErrors.ward = lang === 'hi' ? 'कृपया अपना वार्ड नंबर चुनें' : 'Please select your ward number';
    }

    if (!formData.category) {
      newErrors.category = lang === 'hi' ? 'कृपया समस्या का प्रकार चुनें' : 'Please select the issue category';
    }

    if (!formData.description.trim() || formData.description.trim().length < 10) {
      newErrors.description = lang === 'hi'
        ? 'कृपया समस्या का विस्तृत विवरण लिखें (न्यूनतम 10 अक्षर)'
        : 'Please describe the issue in detail (minimum 10 characters)';
    }

    if (!imageFile) {
      newErrors.photo = 'कृपया समस्या की फोटो अपलोड करें (Photo is required)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Form submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!imageFile) {
      toast.error('कृपया समस्या की फोटो अपलोड करें (Photo is required)');
      return;
    }

    if (!validate()) {
      if (!isPhoneVerified) {
        toast.error(t.otpRequired);
      } else {
        toast.error(lang === 'hi' ? 'कृपया फॉर्म में दी गई त्रुटियों को ठीक करें' : 'Please fix the errors in the form');
      }
      return;
    }

    setIsSubmitting(true);
    try {
      // Build FormData payload for multipart/form-data support
      const payload = new FormData();
      payload.append('citizenName', formData.name.trim());   // backend expects 'citizenName'
      payload.append('phone', formData.phone.trim());
      payload.append('wardNumber', String(formData.ward));   // backend expects 'wardNumber'
      payload.append('category', formData.category);
      payload.append('description', formData.description.trim());
      if (imageFile) {
        payload.append('image', imageFile);
      }

      const response = await submitComplaint(payload);

      // Backend returns: { success: true, trackingId, data: { trackingId, ... } }
      const trackingId =
        response?.trackingId ||
        response?.data?.trackingId ||
        response?.data?.data?.trackingId ||
        response?.complaint?.trackingId;

      if (!trackingId) {
        throw new Error(lang === 'hi' ? 'सर्वर से ट्रैकिंग ID प्राप्त नहीं हुई।' : 'Did not receive Tracking ID from server.');
      }

      setSuccessResult({
        trackingId,
        citizenName: formData.name.trim(),
        phone: formData.phone.trim(),
        ward: formData.ward,
        category: formData.category,
        description: formData.description.trim(),
        submittedAt: new Date().toISOString(),
      });

      toast.success(lang === 'hi' ? 'आपकी शिकायत सफलतापूर्वक दर्ज कर ली गई है!' : 'Complaint submitted successfully!');
    } catch (error) {
      console.error('Complaint submit error:', error);
      const errMsg =
        error?.response?.data?.message ||
        error?.message ||
        (lang === 'hi' ? 'शिकायत दर्ज नहीं हो सकी। कृपया दोबारा कोशिश करें।' : 'Failed to submit complaint. Please try again.');
      toast.error(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    cleanupRecaptcha();
    document.body.classList.remove('recaptcha-verified');
    setFormData({
      name: '',
      phone: '',
      ward: '',
      category: '',
      description: '',
    });
    handleRemoveImage();
    setErrors({});
    setSuccessResult(null);
    setIsPhoneVerified(false);
    setIsDevOtp(false);
    setOtpSent(false);
    setOtpCode('');
    setConfirmationResult(null);
    setResendCooldown(0);
  };

  // ================= SUCCESS VIEW (1-CLICK DIGITAL CIVIC RECEIPT) =================
  if (successResult) {
    const trackUrl = `${window.location.origin}?track=${encodeURIComponent(successResult.trackingId)}`;

    const shareMessage = lang === 'hi'
      ? `नमस्ते, मेरी शिकायत ग्राम पंचायत सहरी पोर्टल पर दर्ज हो गई है।\n\n📋 ट्रैकिंग आईडी: ${successResult.trackingId}\n🏛️ वार्ड: ${successResult.ward}\n🔍 स्थिति जांचें: ${trackUrl}`
      : `Hello, my complaint is registered on Gram Panchayat Sahari Portal.\n\n📋 Tracking ID: ${successResult.trackingId}\n🏛️ Ward: ${successResult.ward}\n🔍 Track Status: ${trackUrl}`;

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareMessage)}`;

    const formatReceiptDate = (isoString) => {
      try {
        const date = isoString ? new Date(isoString) : new Date();
        return date.toLocaleString(lang === 'hi' ? 'hi-IN' : 'en-US', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        });
      } catch {
        return new Date().toLocaleDateString();
      }
    };

    const handleCopyId = async () => {
      try {
        if (navigator?.clipboard?.writeText) {
          await navigator.clipboard.writeText(successResult.trackingId);
        } else {
          const textarea = document.createElement('textarea');
          textarea.value = successResult.trackingId;
          document.body.appendChild(textarea);
          textarea.select();
          document.execCommand('copy');
          document.body.removeChild(textarea);
        }
        setCopiedId(true);
        toast.success(t.receiptCopied || (lang === 'hi' ? 'ट्रैकिंग आईडी कॉपी हो गई!' : 'Tracking ID copied!'));
        setTimeout(() => setCopiedId(false), 2500);
      } catch (err) {
        toast.error(lang === 'hi' ? 'कॉपी विफल रहा' : 'Failed to copy');
      }
    };

    const handleDownloadReceipt = async () => {
      if (!receiptRef.current) return;
      setIsDownloading(true);
      const loadingToast = toast.loading(t.receiptDownloading || (lang === 'hi' ? 'पावती तैयार हो रही है...' : 'Generating receipt slip...'));
      try {
        const canvas = await html2canvas(receiptRef.current, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
          logging: false,
        });
        const link = document.createElement('a');
        link.download = `Sahari_Panchayat_Receipt_${successResult.trackingId}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        toast.dismiss(loadingToast);
        toast.success(t.receiptDownloadSuccess || (lang === 'hi' ? 'पावती डाउनलोड हो गई!' : 'Receipt downloaded successfully!'));
      } catch (err) {
        console.error('Download receipt error:', err);
        toast.dismiss(loadingToast);
        toast.error(lang === 'hi' ? 'पावती डाउनलोड विफल हुआ' : 'Failed to download receipt');
      } finally {
        setIsDownloading(false);
      }
    };

    return (
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-3.5 sm:p-6 space-y-4 animate-fadeIn">
        {/* Printable Official Civic Receipt Slip */}
        <div
          ref={receiptRef}
          className="bg-white border-2 border-dashed border-slate-300 rounded-2xl p-4 sm:p-6 shadow-xs relative overflow-hidden text-left"
        >
          {/* Subtle Decorative Civic Gradient Glow */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-50/60 rounded-full blur-xl pointer-events-none" />

          {/* Header with Civic Emblem */}
          <div className="text-center pb-4 border-b border-slate-100 relative">
            <div className="w-12 h-12 mx-auto rounded-xl bg-blue-50 border border-blue-200/90 text-blue-900 flex items-center justify-center shadow-2xs mb-2">
              <Landmark className="w-6 h-6 stroke-[2.2]" />
            </div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-snug">
              {t.receiptTitle || (lang === 'hi' ? 'ग्राम पंचायत सहरी - ई-शिकायत पावती' : 'Gram Panchayat Sahari - Civic Receipt')}
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-500 font-semibold tracking-wide uppercase mt-0.5">
              {t.receiptSubtitle || (lang === 'hi' ? 'लोक शिकायत निवारण प्रणाली' : 'Public Grievance Redressal System')}
            </p>

            <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold shadow-2xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{t.receiptVerified || (lang === 'hi' ? 'सफलतापूर्वक दर्ज (Registered)' : 'Successfully Registered')}</span>
            </div>
          </div>

          {/* Reference ID Highlight Banner */}
          <div className="mt-4 p-3.5 sm:p-4 rounded-xl bg-gradient-to-r from-blue-50/70 via-slate-50 to-blue-50/70 border border-blue-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
            <div>
              <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-wider text-slate-500 block">
                {lang === 'hi' ? 'शिकायत संदर्भ आईडी (Tracking ID)' : 'Complaint Reference ID'}
              </span>
              <div className="text-2xl sm:text-3xl font-black font-mono text-blue-950 tracking-wider mt-0.5">
                #{successResult.trackingId}
              </div>
            </div>

            <button
              type="button"
              onClick={handleCopyId}
              className={`w-full sm:w-auto min-h-[42px] px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 shadow-2xs ${
                copiedId
                  ? 'bg-emerald-600 text-white border border-emerald-600'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-300'
              }`}
            >
              {copiedId ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white" />
                  <span>{t.receiptCopied || (lang === 'hi' ? 'कॉपी हुआ!' : 'Copied!')}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-600" />
                  <span>{t.receiptCopyId || (lang === 'hi' ? 'आईडी कॉपी करें' : 'Copy ID')}</span>
                </>
              )}
            </button>
          </div>

          {/* Citizen & Grievance Information Grid */}
          <div className="mt-4 grid grid-cols-2 gap-2.5 sm:gap-3 text-left">
            {/* Citizen Name */}
            <div className="p-2.5 sm:p-3 rounded-xl bg-slate-50/80 border border-slate-200/80">
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                {t.receiptCitizen || (lang === 'hi' ? 'नागरिक का नाम' : 'Citizen Name')}
              </span>
              <span className="text-xs sm:text-sm font-bold text-slate-900 block truncate mt-0.5">
                {successResult.citizenName || '—'}
              </span>
            </div>

            {/* Ward */}
            <div className="p-2.5 sm:p-3 rounded-xl bg-slate-50/80 border border-slate-200/80">
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                {t.receiptWard || (lang === 'hi' ? 'वार्ड नंबर' : 'Ward Number')}
              </span>
              <span className="text-xs sm:text-sm font-bold text-blue-900 block truncate mt-0.5">
                {lang === 'hi' ? `वार्ड ${successResult.ward}` : `Ward ${successResult.ward}`}
              </span>
            </div>

            {/* Category */}
            <div className="p-2.5 sm:p-3 rounded-xl bg-slate-50/80 border border-slate-200/80">
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                {t.receiptCategory || (lang === 'hi' ? 'समस्या श्रेणी' : 'Category')}
              </span>
              <span className="text-xs sm:text-sm font-bold text-slate-900 block truncate mt-0.5">
                {successResult.category || '—'}
              </span>
            </div>

            {/* Submission Date & Time */}
            <div className="p-2.5 sm:p-3 rounded-xl bg-slate-50/80 border border-slate-200/80">
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                {t.receiptDate || (lang === 'hi' ? 'पंजीकरण समय' : 'Date & Time')}
              </span>
              <span className="text-xs sm:text-sm font-semibold text-slate-800 block truncate mt-0.5">
                {formatReceiptDate(successResult.submittedAt)}
              </span>
            </div>
          </div>

          {/* Dynamic QR Code Box */}
          <div className="mt-4 p-3 sm:p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-3.5">
            <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-2xs shrink-0 flex items-center justify-center">
              <QRCodeSVG value={trackUrl} size={84} level="M" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
                {lang === 'hi' ? 'डिजिटल सत्यापन क्यूआर कोड' : 'Digital Verification QR'}
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                {t.receiptTrackNote || (lang === 'hi' ? 'स्कैन करके कभी भी स्थिति जांचें (Scan to track anytime)' : 'Scan anytime to track your complaint resolution progress.')}
              </p>
              <span className="text-[10px] text-blue-700 font-mono font-medium block truncate mt-1">
                {trackUrl}
              </span>
            </div>
          </div>

          {/* Civic Verification Footnote */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] sm:text-[11px] text-slate-400">
            <span>ग्राम पंचायत सहरी, राजस्थान • डिजिटल भारत ई-सुविधा</span>
            <span className="font-mono">Gov-Tech Verified</span>
          </div>
        </div>

        {/* Actions Bottom Bar */}
        <div className="space-y-2.5 pt-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* 1. WhatsApp Share Button */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[46px] px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-semibold text-xs sm:text-sm shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current shrink-0" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              <span>{t.receiptShareWhatsApp || (lang === 'hi' ? 'WhatsApp पर शेयर करें' : 'Share on WhatsApp')}</span>
            </a>

            {/* 2. Download Receipt Button */}
            <button
              type="button"
              disabled={isDownloading}
              onClick={handleDownloadReceipt}
              className="min-h-[46px] px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 active:scale-95 text-slate-800 border border-slate-300 font-semibold text-xs sm:text-sm shadow-2xs flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60"
            >
              <Download className="w-4 h-4 text-blue-600 shrink-0" />
              <span>{isDownloading ? (t.receiptDownloading || (lang === 'hi' ? 'डाउनलोड हो रहा है...' : 'Downloading...')) : (t.receiptDownload || (lang === 'hi' ? 'पावती डाउनलोड करें' : 'Download Receipt'))}</span>
            </button>
          </div>

          {/* 3. Done / Register Another Action Links */}
          <div className="flex items-center justify-center gap-3 pt-1">
            <button
              type="button"
              onClick={() => {
                if (onSuccessClose) {
                  onSuccessClose();
                } else {
                  handleResetForm();
                }
              }}
              className="min-h-[44px] px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              {t.receiptDone || (lang === 'hi' ? 'समाप्त / बंद करें' : 'Done / Close')}
            </button>
            <span className="text-slate-300 select-none">•</span>
            <button
              type="button"
              onClick={handleResetForm}
              className="min-h-[44px] px-4 py-2 text-xs font-bold text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
            >
              {t.fileAnother || (lang === 'hi' ? 'अन्य शिकायत दर्ज करें' : 'Register Another Complaint')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ================= FORM VIEW =================
  const isPhoneComplete = /^[6-9]\d{9}$/.test(formData.phone.trim());

  return (
    <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden" noValidate>
      {/* Invisible reCAPTCHA container for Firebase Phone Auth */}
      <div id="recaptcha-container"></div>

      {/* ── Scrollable Form Body ── */}
      <div className="flex-1 overflow-y-auto overscroll-contain px-4 sm:px-6 py-4 space-y-5">

        {/* 1. Full Name */}
        <div>
          <label htmlFor="grievance-name" className="block text-xs font-semibold text-slate-700 tracking-wide uppercase mb-1.5">
            {t.labelName} <span className="text-red-500">*</span>
          </label>
          <input
            id="grievance-name"
            type="text"
            required
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            onBlur={handleInputBlur}
            placeholder={t.labelNameHint}
            className={`w-full min-h-[46px] px-3.5 py-2.5 rounded-xl border ${
              errors.name
                ? 'border-red-400 bg-red-50/30 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                : 'border-slate-300 bg-slate-50/50 hover:bg-white focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20'
            } text-slate-900 placeholder-slate-400 focus:outline-none transition-all text-sm`}
          />
          {errors.name && (
            <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              {errors.name}
            </p>
          )}
        </div>

        {/* 2. Mobile Number with OTP */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="grievance-phone" className="block text-xs font-semibold text-slate-700 tracking-wide uppercase">
              {t.labelPhone} <span className="text-red-500">*</span>
            </label>
            {isPhoneVerified ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-md">
                <Check className="w-3 h-3 text-emerald-600" />
                <span>{t.otpVerified}</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-md">
                <KeyRound className="w-3 h-3 text-amber-600" />
                <span>{lang === 'hi' ? 'OTP सत्यापन आवश्यक' : 'OTP Verification Required'}</span>
              </span>
            )}
          </div>

          <div className="relative flex items-center">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-semibold text-sm pointer-events-none select-none">
              +91
            </span>
            <input
              id="grievance-phone"
              type="tel"
              inputMode="numeric"
              maxLength={10}
              disabled={isPhoneVerified}
              required
              value={formData.phone}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '');
                handleChange('phone', val);
                if (isPhoneVerified || otpSent) {
                  setIsPhoneVerified(false);
                  setIsDevOtp(false);
                  setOtpSent(false);
                  setOtpCode('');
                }
              }}
              onBlur={handleInputBlur}
              placeholder={t.labelPhoneHint}
              className={`w-full min-h-[46px] pl-12 ${
                isPhoneVerified ? 'pr-20 bg-slate-100/70 border-slate-300 text-slate-700' : 'pr-28 bg-slate-50/50 hover:bg-white focus:bg-white text-slate-900'
              } py-2.5 rounded-xl border ${
                errors.phone && !isPhoneVerified
                  ? 'border-red-400 bg-red-50/30 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                  : 'border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20'
              } placeholder-slate-400 focus:outline-none transition-all text-sm font-mono`}
            />

            {/* Inline Action Button */}
            <div className="absolute right-1.5 top-1/2 -translate-y-1/2">
              {isPhoneVerified ? (
                <button
                  type="button"
                  onClick={() => {
                    setIsPhoneVerified(false);
                    setIsDevOtp(false);
                    setOtpSent(false);
                    setOtpCode('');
                  }}
                  className="px-2.5 py-1 text-xs font-semibold text-slate-600 hover:text-blue-900 rounded-md hover:bg-slate-100 transition-colors flex items-center gap-1 cursor-pointer"
                  title={lang === 'hi' ? 'नंबर बदलें' : 'Change Phone'}
                >
                  <Edit2 className="w-3 h-3" />
                  <span>{lang === 'hi' ? 'बदलें' : 'Change'}</span>
                </button>
              ) : (
                <button
                  type="button"
                  disabled={!isPhoneComplete || isSendingOtp}
                  onClick={handleSendOtp}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 active:scale-95 text-white text-xs font-semibold rounded-lg shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
                >
                  {isSendingOtp ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>{t.sendingOtp}</span>
                    </>
                  ) : (
                    <span>{otpSent ? t.resendOtp : t.sendOtp}</span>
                  )}
                </button>
              )}
            </div>
          </div>

          {errors.phone && !isPhoneVerified && (
            <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              {errors.phone}
            </p>
          )}

          {/* OTP Verification Dropdown Box */}
          {otpSent && !isPhoneVerified && (
            <div className="mt-3 p-3.5 sm:p-4 bg-slate-50 border border-blue-200/80 rounded-xl space-y-3 animate-fadeIn shadow-2xs">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                <span className="flex items-center gap-1.5 text-blue-900">
                  <KeyRound className="w-4 h-4 shrink-0 text-blue-600" />
                  <span>{t.otpLabel}</span>
                </span>
                <span className="text-[11px] font-mono text-slate-500 font-semibold">
                  +91 {formData.phone}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full">
                <input
                  ref={otpInputRef}
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  onBlur={handleInputBlur}
                  placeholder="------"
                  className="flex-1 min-w-0 w-full sm:w-auto min-h-[42px] px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono text-center text-lg tracking-widest font-bold focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
                />
                <button
                  type="button"
                  disabled={otpCode.length !== 6 || isVerifyingOtp}
                  onClick={handleVerifyOtp}
                  className="w-full sm:w-auto shrink-0 min-h-[42px] px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold text-xs sm:text-sm rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-2xs active:scale-95 whitespace-nowrap cursor-pointer disabled:cursor-not-allowed"
                >
                  {isVerifyingOtp ? (
                    <RefreshCw className="w-4 h-4 animate-spin shrink-0" />
                  ) : (
                    <Check className="w-4 h-4 shrink-0" />
                  )}
                  <span>{isVerifyingOtp ? t.verifyingOtp : t.verifyOtp}</span>
                </button>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                <span>
                  {resendCooldown > 0 ? (
                    <span className="text-slate-500 font-medium">
                      {lang === 'hi' ? `पुनः भेजें (${resendCooldown}s)` : `Resend in ${resendCooldown}s`}
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      className="text-blue-600 font-semibold hover:underline cursor-pointer"
                    >
                      {t.resendOtp}
                    </button>
                  )}
                </span>
                <span className="text-slate-400">
                  {isDevOtp ? (
                    <span className="text-blue-600 font-semibold">Dev Mode (123456)</span>
                  ) : (
                    'SMS OTP via Firebase'
                  )}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* 3. Ward Selection (Pills 1-7) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-slate-700 tracking-wide uppercase">
              {t.labelWard} (1-7) <span className="text-red-500">*</span>
            </label>
            {formData.ward && (
              <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200/60">
                {lang === 'hi' ? `वार्ड ${formData.ward} चयनित` : `Ward ${formData.ward} Selected`}
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-500 mb-2">
            {lang === 'hi'
              ? 'ग्राम पंचायत सहरी का वह वार्ड चुनें जहां समस्या स्थित है:'
              : 'Select the ward in Gram Panchayat Sahari where the problem is located:'}
          </p>
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
            {WARDS.map((w) => {
              const isSelected = formData.ward === w;
              return (
                <button
                  key={w}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleChange('ward', w)}
                  className={`min-h-[42px] px-2 py-2 rounded-xl text-xs sm:text-sm font-bold border transition-all duration-150 flex items-center justify-center cursor-pointer active:scale-95 ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs ring-2 ring-blue-600/20'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                  }`}
                >
                  {lang === 'hi' ? `वार्ड ${w}` : `Ward ${w}`}
                </button>
              );
            })}
          </div>
          {errors.ward && (
            <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              {errors.ward}
            </p>
          )}
        </div>

        {/* 4. Category Radio Cards */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 tracking-wide uppercase mb-1.5">
            {t.labelCategory} <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {categories.map((cat) => {
              const isSelected = formData.category === cat.id;
              return (
                <div
                  key={cat.id}
                  role="button"
                  tabIndex={0}
                  aria-pressed={isSelected}
                  aria-label={cat.label}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleChange('category', cat.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleChange('category', cat.id);
                    }
                  }}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all select-none cursor-pointer active:scale-[0.99] ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-600/30 shadow-2xs'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60'
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                      isSelected ? 'border-blue-600 bg-blue-600' : 'border-slate-300 bg-white'
                    }`}
                  >
                    {isSelected && (
                      <span className="w-1.5 h-1.5 rounded-full bg-white block" />
                    )}
                  </span>
                  <span className="text-xl flex-shrink-0" role="img" aria-label={cat.label}>
                    {cat.emoji}
                  </span>
                  <div className="min-w-0">
                    <p className={`text-sm font-bold leading-tight ${isSelected ? 'text-blue-950' : 'text-slate-800'}`}>
                      {cat.label}
                    </p>
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      {cat.sublabel}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          {errors.category && (
            <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              {errors.category}
            </p>
          )}
        </div>

        {/* 5. Photo Upload (Moved above Description for seamless AI Vision workflow) */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 tracking-wide uppercase mb-1.5">
            {t.labelPhoto} <span className="text-red-500">*</span>
          </label>
          <p className="text-[11px] text-slate-500 mb-2">
            {t.labelPhotoHint}
          </p>

          {imagePreview ? (
            <div className="relative inline-block border border-slate-200 rounded-xl overflow-hidden p-1 bg-white shadow-2xs">
              <img
                src={imagePreview}
                alt="Selected Preview"
                className="w-48 h-36 object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-2.5 right-2.5 bg-rose-600 hover:bg-rose-700 text-white p-1.5 rounded-full shadow-md transition-colors focus:outline-none cursor-pointer"
                title={lang === 'hi' ? 'फोटो हटाएं' : 'Remove photo'}
              >
                <X className="w-3.5 h-3.5" />
              </button>
              <p className="text-[11px] text-emerald-700 font-semibold text-center mt-1">
                {lang === 'hi' ? 'फोटो संलग्न' : 'Photo Attached'}
              </p>
            </div>
          ) : (
            <label
              className={`flex flex-col items-center justify-center border-2 border-dashed ${
                errors.photo
                  ? 'border-red-400 bg-red-50/20'
                  : 'border-slate-300 bg-slate-50/50 hover:bg-blue-50/30 hover:border-blue-500'
              } rounded-xl p-5 cursor-pointer transition-all group`}
            >
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center group-hover:scale-105 transition-transform mb-2">
                <Camera className="w-5 h-5" />
              </div>
              <span className="text-xs sm:text-sm font-bold text-slate-700 group-hover:text-blue-900">
                {lang === 'hi' ? 'फोटो चुनें या कैमरे से खींचें' : 'Select photo or take a picture'}
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5">
                PNG, JPG, JPEG (Max 10MB)
              </span>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleImageChange}
                className="sr-only"
              />
            </label>
          )}
          {errors.photo && (
            <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              {errors.photo}
            </p>
          )}
        </div>

        {/* 6. Description Textarea with AI Auto-Write */}
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
            <div className="flex items-center gap-2">
              <label htmlFor="grievance-desc" className="block text-xs font-semibold text-slate-700 tracking-wide uppercase">
                {t.labelDescription} <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={handleAiGenerateDescription}
                disabled={isGeneratingAi}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-xs hover:opacity-95 active:scale-95 disabled:opacity-60 flex items-center gap-1.5 transition-all cursor-pointer"
                title={isHi ? 'फोटो देखकर AI से विवरण लिखवाएं' : 'Auto-write description from photo using AI'}
              >
                {isGeneratingAi ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>{t.aiAnalyzing || (isHi ? 'AI फोटो देख रहा है...' : 'Analyzing photo...')}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                    <span>{t.aiWriteDesc || (isHi ? 'AI से विवरण लिखें' : 'Write with AI')}</span>
                  </>
                )}
              </button>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              {formData.description.length} {lang === 'hi' ? 'अक्षर' : 'chars'}
            </span>
          </div>
          <textarea
            id="grievance-desc"
            rows={4}
            required
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            onBlur={handleInputBlur}
            placeholder={t.labelDescriptionHint}
            className={`w-full p-3.5 rounded-xl border resize-none ${
              errors.description
                ? 'border-red-400 bg-red-50/30 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                : 'border-slate-300 bg-slate-50/50 hover:bg-white focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20'
            } text-slate-900 placeholder-slate-400 focus:outline-none transition-all text-sm`}
          />
          <div className="flex items-center justify-between mt-1">
            {errors.description ? (
              <p className="text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.description}
              </p>
            ) : (
              <span className="text-[11px] text-slate-400">
                {lang === 'hi' ? 'न्यूनतम 10 अक्षर आवश्यक हैं' : 'Minimum 10 characters required'}
              </span>
            )}
          </div>
        </div>

      </div>{/* end scrollable body */}

      {/* ── Sticky Submit Footer ── */}
      <div
        className="shrink-0 px-4 sm:px-6 pt-3 border-t border-slate-100 bg-white"
        style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}
      >
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full min-h-[48px] px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] disabled:opacity-60 text-white font-bold text-sm sm:text-base shadow-sm transition-all flex items-center justify-center gap-2 focus:outline-none focus:ring-4 focus:ring-blue-600/30 cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>{t.btnSubmitting}</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>{t.btnSubmit}</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default GrievanceForm;
