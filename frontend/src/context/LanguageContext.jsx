import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const translations = {
  hi: {
    // Navbar
    navTitle: 'ग्राम पंचायत सहरी',
    navSubtitle: 'ई-शासन एवं नागरिक सेवा पोर्टल',
    adminLogin: 'प्रशासन लॉगिन',
    adminDashboard: 'डैशबोर्ड',
    logout: 'लॉगआउट',

    // Hero
    heroBadge: 'डिजिटल ग्राम पंचायत सहरी • नागरिक समाधान केंद्र',
    heroTitle1: 'अपनी समस्या बताएं,',
    heroTitle2: 'हम समाधान करेंगे',
    heroSubtitle: 'ग्राम पंचायत की सेवा, सीधे आपके द्वार',
    heroDesc: 'पानी, बिजली, सड़क, नाली, सफाई या किसी भी सार्वजनिक समस्या की शिकायत सीधे पंचायत कार्यालय में ऑनलाइन दर्ज करें और रियल-टाइम स्थिति ट्रैक करें।',
    btnNewComplaint: 'नई शिकायत दर्ज करें',
    btnTrackStatus: 'शिकायत की स्थिति जांचें',
    statComplaints: 'शिकायतें निस्तारित',
    statWards: 'कुल वार्ड',
    statService: 'नागरिक सेवा',
    featurePaperless: '100% डिजिटल व पारदर्शी',
    featureDirect: 'सरपंच एवं सचिव तक सीधी पहुंच',
    featureWhatsapp: 'WhatsApp पर त्वरित अपडेट',

    // Notice Board
    importantNotice: 'महत्वपूर्ण सूचना',
    urgentNotice: '⚠️ अति महत्वपूर्ण सूचना',
    noticeBoardTitle: 'ग्राम पंचायत सूचना पट्ट',
    noticeBoardSubtitle: 'वर्तमान में कोई नई सार्वजनिक सूचना नहीं है।',
    noticePlaceholder: 'पंचायत के आगामी कार्यक्रमों, ग्राम सभा व विकास निर्णयों की सूचना यहां प्रदर्शित होगी।',
    whatsappShare: 'WhatsApp पर साझा करें',
    prevNotice: 'पिछली',
    nextNotice: 'अगली',

    // Quick Tracker Section
    quickTrackBadge: 'त्वरित ट्रैकिंग',
    quickTrackTitle: 'शिकायत की स्थिति जांचें',
    quickTrackSubtitle: 'अपनी ट्रैकिंग आईडी (जैसे GR-1024) या 10 अंकों का मोबाइल नंबर दर्ज कर स्थिति देखें',

    // Grievance Form
    formModalTitle: '📝 नई नागरिक शिकायत दर्ज करें',
    formSubtitle: 'New Grievance Registration',
    labelName: 'पूरा नाम',
    labelNameHint: 'उदा. रामेश्वर शर्मा',
    labelPhone: 'मोबाइल नंबर',
    labelPhoneHint: '10 अंकों का मोबाइल नंबर',
    labelWard: 'वार्ड संख्या',
    labelWardHint: 'वार्ड चुनें (1 से 7)',
    sendOtp: 'OTP भेजें',
    sendingOtp: 'भेज रहे हैं...',
    verifyOtp: 'सत्यापित करें',
    verifyingOtp: 'जांच जारी है...',
    otpLabel: '6-अंकीय OTP कोड',
    otpVerified: 'सत्यापित',
    resendOtp: 'पुनः OTP भेजें',
    otpRequired: 'कृपया पहले मोबाइल नंबर OTP द्वारा सत्यापित करें।',
    otpSentSuccess: 'OTP आपके मोबाइल पर भेज दिया गया है।',
    otpVerifySuccess: 'मोबाइल नंबर सफलतापूर्वक सत्यापित हुआ!',
    labelCategory: 'समस्या की श्रेणी',
    labelCategoryHint: 'समस्या का प्रकार चुनें',
    labelDescription: 'समस्या का विस्तृत विवरण',
    labelDescriptionHint: 'स्थान, समस्या और आवश्यक जानकारी विस्तार से लिखें...',
    labelPhoto: 'फोटो संलग्न करें',
    labelPhotoHint: 'समस्या स्थल की फोटो अपलोड करें (अधिकतम 10MB)',
    btnSubmit: 'शिकायत दर्ज करें',
    btnSubmitting: 'शिकायत भेजी जा रही है...',
    successTitle: 'आपकी शिकायत सफलतापूर्वक दर्ज हो गई है!',
    trackingLabel: 'आपकी शिकायत ट्रैकिंग आईडी:',
    trackingNote: 'कृपया यह ट्रैकिंग आईडी सुरक्षित रखें। आप इससे कभी भी स्थिति जांच सकते हैं।',
    whatsappSave: 'WhatsApp पर सुरक्षित करें',
    fileAnother: 'अन्य शिकायत दर्ज करें',
    closeBtn: 'बंद करें',

    // Categories
    catWater: 'पानी / हैंडपंप',
    catElectricity: 'बिजली / स्ट्रीट लाइट',
    catRoad: 'सड़क / नाली',
    catSanitation: 'सफाई व्यवस्था',
    catOther: 'अन्य समस्या',

    // Status Tracker
    trackModalTitle: '🔍 शिकायत की स्थिति देखें',
    trackerTitle: 'शिकायत की स्थिति जांचें',
    trackerSubtitle: 'Track your Grievance Status',
    trackerPlaceholder: 'ट्रैकिंग ID (उदा. GR-1024) या मोबाइल नंबर दर्ज करें',
    trackerBtn: 'स्थिति देखें',
    trackerSearching: 'खोज रहे हैं...',
    trackerNotFound: 'कोई शिकायत नहीं मिली',
    trackerNotFoundDesc: 'कृपया ट्रैकिंग आईडी या 10 अंकों का मोबाइल नंबर पुनः जांचें।',
    complaintDetails: 'शिकायत का विवरण',
    statusHistory: 'प्रगति इतिहास',
    filedOn: 'दर्ज दिनांक',
    filedBy: 'शिकायतकर्ता',
    wardNum: 'वार्ड नंबर',
    officerRemarks: 'प्रशासनिक टिप्पणी',

    // Status Badges
    statusPending: 'लंबित',
    statusInProgress: 'प्रगति पर',
    statusResolved: 'निस्तारित / पूर्ण',
    statusRejected: 'अस्वीकृत',

    // Directory
    dirTitle: 'ग्राम पंचायत प्रतिनिधि निर्देशिका',
    dirSubtitle: 'Panchayat Elected Representatives',
    dirDesc: 'ग्राम पंचायत सहरी के सरपंच एवं सभी 7 वार्डों के निर्वाचित वार्ड पंच / जनप्रतिनिधि',
    dirBannerHeading: 'ग्राम पंचायत प्रतिनिधि (Panchayat Directory)',
    dirBannerSubtitle: 'सरपंच एवं सभी 7 वार्डों के वार्ड पंचों की आधिकारिक सूची',
    dirBtnView: '👥 प्रतिनिधि सूची देखें (View Directory)',
    dirModalTitle: '👥 ग्राम पंचायत प्रतिनिधि सूची',
    dirModalWardSubhead: 'वार्ड पंच / निर्वाचित वार्ड सदस्य (7 वार्ड)',
    dirElected: 'निर्वाचित',
    dirCall: 'संपर्क',
    directContact: 'पंचायत जनप्रतिनिधि',
    allDepartments: 'सभी वार्ड',
    helplineTitle: 'आपातकालीन हेल्पलाइन',
    policeHelpline: 'पुलिस: 100',
    ambulanceHelpline: 'एम्बुलेंस: 108',
    fireHelpline: 'दमकल: 101',
    womenHelpline: 'महिला हेल्पलाइन: 1090',
    sarpanchRole: 'सरपंच (ग्राम प्रधान)',
    sarpanchName: 'श्री लखन',
    sarpanchDept: 'ग्राम पंचायत सहरी',
    sarpanchBadge: 'प्रथम नागरिक / ग्राम प्रधान',

    // Footer
    footerTagline: 'नागरिक शिकायत निवारण एवं ई-शासन पहल | स्वच्छ भारत, समर्थ भारत',
    footerCopyright: 'ग्राम पंचायत सहरी © 2026 | सर्वाधिकार सुरक्षित',
    footerMission: 'जनहित में समर्पित — ग्राम पंचायत सहरी विकास योजना',
    footerMottos: ['सत्यमेव जयते', 'ग्राम स्वराज', 'डिजिटल पंचायत'],
    poweredBy: 'डिजिटल इंडिया मिशन द्वारा संचालित',
    quickLinks: 'त्वरित लिंक',
    contactUs: 'संपर्क सूत्र',
    panchayatOffice: 'ग्राम पंचायत भवन, सहरी',
    helplineHours: 'कार्यालय समय: प्रातः 9:00 से सायं 5:00 तक',

    // Auth & Password Reset
    forgotPasswordLink: 'पासवर्ड भूल गए? (Forgot Password)',
    forgotPasswordTitle: 'प्रशासन पासवर्ड रीसेट',
    forgotPasswordSubtitle: 'अपना पंजीकृत उपयोगकर्ता नाम (Username) या ईमेल दर्ज करें',
    sendResetLinkBtn: 'ईमेल पर रीसेट लिंक भेजें',
    sendingResetLink: 'लिंक भेजा जा रहा है...',
    backToLogin: 'लॉगिन पृष्ठ पर लौटें',
    resetEmailSentTitle: 'पासवर्ड रीसेट ईमेल भेजा गया!',
    resetEmailSentDesc: 'यदि यह विवरण हमारे रिकॉर्ड में मौजूद है, तो पासवर्ड रीसेट लिंक भेज दिया गया है।',
    checkInboxNote: 'कृपया अपना इनबॉक्स और स्पैम (Spam) फ़ोल्डर देखें। यह लिंक अगले 15 मिनट तक मान्य है।',
    resetPasswordTitle: 'नया पासवर्ड बनाएं',
    resetPasswordSubtitle: 'कृपया अपने प्रशासन खाते के लिए एक नया और सुरक्षित पासवर्ड बनाएं',
    newPasswordLabel: 'नया पासवर्ड (New Password)',
    confirmPasswordLabel: 'पासवर्ड की पुष्टि करें (Confirm Password)',
    newPasswordPlaceholder: 'नया पासवर्ड दर्ज करें (कम से कम 6 अक्षर)',
    confirmPasswordPlaceholder: 'नया पासवर्ड दोबारा दर्ज करें',
    resetPasswordBtn: 'पासवर्ड अपडेट करें',
    resettingPassword: 'पासवर्ड अपडेट हो रहा है...',
    passwordResetSuccess: 'पासवर्ड सफलतापूर्वक बदल दिया गया है!',
    redirectingToLogin: 'आपको 3 सेकंड में लॉगिन पृष्ठ पर भेजा जा रहा है...',

    // Ward Analytics & Heatmap
    wardAnalyticsTab: 'वार्ड एनालिटिक्स एवं हीटमैप',
    grievanceManagementTab: 'नागरिक शिकायत प्रबंधन',
    analyticsHeading: 'वार्ड-वार विश्लेषणात्मक डैशबोर्ड (Ward-Wise Analytics)',
    analyticsSubtitle: 'ग्राम पंचायत सहरी के सभी 7 वार्डों की वास्तविक स्थिति, गंभीरता हीटमैप एवं श्रेणी विश्लेषण',
    wardHeatmapTitle: 'वार्ड गंभीरता हीटमैप (Severity Heatmap)',
    wardHeatmapDesc: 'खुली शिकायतों और गंभीरता स्कोर के आधार पर सभी 7 वार्डों का रंग-कोडित दृश्य',
    kpiTotalWards: 'कुल सक्रिय वार्ड',
    kpiOverallRate: 'कुल समाधान दर',
    kpiCriticalWard: 'सर्वाधिक लंबित वार्ड',
    kpiAvgDays: 'औसत समाधान समय',
    kpiDaysUnit: 'दिन',
    severityScore: 'गंभीरता स्कोर',
    topProblemCategory: 'शीर्ष समस्या श्रेणी',
    resolutionRate: 'समाधान दर',
    openComplaints: 'लंबित / खुली शिकायतें',
    normalStatus: 'सामान्य स्थिति (>80% समाधान)',
    moderateStatus: 'मध्यम लोड (20-50% लंबित)',
    criticalStatus: 'अति संवेदनशील (>50% लंबित)',
    wardComparisonChart: 'वार्ड-वार शिकायत तुलना (Ward Comparison)',
    categoryDistributionChart: 'समस्या श्रेणीवार वितरण (Category Breakdown)',
    downloadPdfReport: 'मासिक पंचायत रिपोर्ट डाउनलोड करें (PDF)',
    generatingPdf: 'रिपोर्ट तैयार हो रही है...',
    filterByWard: 'इस वार्ड की शिकायतें देखें',
    allWardsLabel: 'सभी 7 वार्ड',
    gramSabhaReportTitle: 'ग्राम पंचायत सहरी - प्रशासनिक एवं वार्ड विश्लेषणात्मक रिपोर्ट',
  },

  en: {
    // Navbar
    navTitle: 'Gram Panchayat Sahari',
    navSubtitle: 'e-Governance & Citizen Portal',
    adminLogin: 'Admin Login',
    adminDashboard: 'Dashboard',
    logout: 'Logout',

    // Hero
    heroBadge: 'Digital Gram Panchayat Sahari • Citizen Service Hub',
    heroTitle1: 'Share Your Grievance,',
    heroTitle2: 'We Will Resolve It',
    heroSubtitle: 'Panchayat Services, Directly at Your Doorstep',
    heroDesc: 'Register grievances regarding water, electricity, roads, drainage, sanitation or any public issue directly with the Panchayat office online and track real-time resolution progress.',
    btnNewComplaint: 'File New Grievance',
    btnTrackStatus: 'Check Grievance Status',
    statComplaints: 'Grievances Resolved',
    statWards: 'Total Wards',
    statService: 'Citizen Support',
    featurePaperless: '100% Digital & Transparent',
    featureDirect: 'Direct to Sarpanch & Secretary',
    featureWhatsapp: 'Instant WhatsApp Updates',

    // Notice Board
    importantNotice: 'Important Notice',
    urgentNotice: '⚠️ High Priority Notice',
    noticeBoardTitle: 'Gram Panchayat Notice Board',
    noticeBoardSubtitle: 'No active public notices available.',
    noticePlaceholder: 'Upcoming Panchayat meetings, Gram Sabha announcements, and development decisions will appear here.',
    whatsappShare: 'Share on WhatsApp',
    prevNotice: 'Previous',
    nextNotice: 'Next',

    // Quick Tracker Section
    quickTrackBadge: 'Instant Tracking',
    quickTrackTitle: 'Check Grievance Status',
    quickTrackSubtitle: 'Enter your Tracking ID (e.g. GR-1024) or 10-digit mobile number to track progress',

    // Grievance Form
    formModalTitle: '📝 File a Citizen Grievance',
    formSubtitle: 'New Grievance Registration',
    labelName: 'Full Name',
    labelNameHint: 'e.g. Rameshwar Sharma',
    labelPhone: 'Mobile Number',
    labelPhoneHint: '10-digit mobile number',
    labelWard: 'Ward Number',
    labelWardHint: 'Select Ward (1 to 7)',
    sendOtp: 'Send OTP',
    sendingOtp: 'Sending...',
    verifyOtp: 'Verify',
    verifyingOtp: 'Verifying...',
    otpLabel: '6-Digit OTP Code',
    otpVerified: 'Verified',
    resendOtp: 'Resend OTP',
    otpRequired: 'Please verify your mobile number with OTP first.',
    otpSentSuccess: 'OTP has been sent to your mobile number.',
    otpVerifySuccess: 'Mobile number verified successfully!',
    labelCategory: 'Grievance Category',
    labelCategoryHint: 'Select category of issue',
    labelDescription: 'Detailed Description',
    labelDescriptionHint: 'Describe the location, issue, and relevant details...',
    labelPhoto: 'Attach Photo',
    labelPhotoHint: 'Upload photo of the issue site (Max 10MB)',
    btnSubmit: 'Submit Grievance',
    btnSubmitting: 'Submitting Grievance...',
    successTitle: 'Grievance Registered Successfully!',
    trackingLabel: 'Your Grievance Tracking ID:',
    trackingNote: 'Please keep this Tracking ID safe. You can use it anytime to check the progress.',
    whatsappSave: 'Save to WhatsApp',
    fileAnother: 'File Another Grievance',
    closeBtn: 'Close',

    // Categories
    catWater: 'Water / Handpump',
    catElectricity: 'Electricity / Streetlight',
    catRoad: 'Road / Drainage',
    catSanitation: 'Sanitation & Cleanliness',
    catOther: 'Other Issue',

    // Status Tracker
    trackModalTitle: '🔍 Track Grievance Status',
    trackerTitle: 'Check Grievance Status',
    trackerSubtitle: 'Track your Grievance Status',
    trackerPlaceholder: 'Enter Tracking ID (e.g. GR-1024) or Mobile Number',
    trackerBtn: 'Check Status',
    trackerSearching: 'Searching...',
    trackerNotFound: 'No Grievance Found',
    trackerNotFoundDesc: 'Please verify the Tracking ID or 10-digit mobile number.',
    complaintDetails: 'Grievance Details',
    statusHistory: 'Progress History',
    filedOn: 'Filed Date',
    filedBy: 'Citizen Name',
    wardNum: 'Ward No.',
    officerRemarks: 'Admin Remarks',

    // Status Badges
    statusPending: 'Pending',
    statusInProgress: 'In Progress',
    statusResolved: 'Resolved / Completed',
    statusRejected: 'Rejected',

    // Directory
    dirTitle: 'Gram Panchayat Representatives Directory',
    dirSubtitle: 'Panchayat Elected Representatives',
    dirDesc: 'Elected Sarpanch and Ward Members (Panch) across all 7 Wards of Gram Panchayat Sahari',
    dirBannerHeading: 'Gram Panchayat Representatives (Panchayat Directory)',
    dirBannerSubtitle: 'Official list of Sarpanch and all 7 Ward Panch members',
    dirBtnView: '👥 View Directory',
    dirModalTitle: '👥 Gram Panchayat Representatives Directory',
    dirModalWardSubhead: 'Ward Members / Elected Panch (7 Wards)',
    dirElected: 'Elected',
    dirCall: 'Details',
    directContact: 'Panchayat Representatives',
    allDepartments: 'All Wards',
    helplineTitle: 'Emergency Helplines',
    policeHelpline: 'Police: 112',
    ambulanceHelpline: 'Ambulance: 108',
    fireHelpline: 'Fire: 101',
    womenHelpline: 'Women Helpline: 1090',
    sarpanchRole: 'Sarpanch (Gram Pradhan)',
    sarpanchName: 'Shri Lakhan',
    sarpanchDept: 'Gram Panchayat Sahari',
    sarpanchBadge: 'First Citizen / Gram Pradhan',

    // Footer
    footerTagline: 'Citizen Grievance Redressal & e-Governance Initiative | Clean India, Empowered India',
    footerCopyright: 'Gram Panchayat Sahari © 2026 | All Rights Reserved',
    footerMission: 'Dedicated to Public Service — Gram Panchayat Sahari Development Plan',
    footerMottos: ['Satyameva Jayate', 'Gram Swaraj', 'Digital Panchayat'],
    poweredBy: 'Powered by Digital India Mission',
    quickLinks: 'Quick Links',
    contactUs: 'Contact Details',
    panchayatOffice: 'Gram Panchayat Bhawan, Sahari',
    helplineHours: 'Office Hours: 9:00 AM to 5:00 PM',

    // Auth & Password Reset
    forgotPasswordLink: 'Forgot Password?',
    forgotPasswordTitle: 'Reset Admin Password',
    forgotPasswordSubtitle: 'Enter your registered Username or Email address',
    sendResetLinkBtn: 'Send Password Reset Link',
    sendingResetLink: 'Sending Link...',
    backToLogin: 'Back to Login',
    resetEmailSentTitle: 'Password Reset Email Sent!',
    resetEmailSentDesc: 'If an account matches this username/email, a password reset link has been dispatched.',
    checkInboxNote: 'Please check your inbox and spam folder. This link expires in 15 minutes.',
    resetPasswordTitle: 'Set New Password',
    resetPasswordSubtitle: 'Create a new, secure password for your administrator account',
    newPasswordLabel: 'New Password',
    confirmPasswordLabel: 'Confirm New Password',
    newPasswordPlaceholder: 'Enter new password (min. 6 characters)',
    confirmPasswordPlaceholder: 'Re-enter new password to confirm',
    resetPasswordBtn: 'Update Password',
    resettingPassword: 'Updating Password...',
    passwordResetSuccess: 'Password has been updated successfully!',
    redirectingToLogin: 'Redirecting to login page in 3 seconds...',

    // Ward Analytics & Heatmap
    wardAnalyticsTab: 'Ward Analytics & Heatmap',
    grievanceManagementTab: 'Grievance Management',
    analyticsHeading: 'Ward-Wise Analytics & Insights Dashboard',
    analyticsSubtitle: 'Live status, severity heatmap, and category breakdown across all 7 Wards of Gram Panchayat Sahari',
    wardHeatmapTitle: 'Ward Severity Heatmap',
    wardHeatmapDesc: 'Color-coded real-time workload and urgency status for Wards 1 through 7',
    kpiTotalWards: 'Total Active Wards',
    kpiOverallRate: 'Overall Resolution Rate',
    kpiCriticalWard: 'Highest Backlog Ward',
    kpiAvgDays: 'Avg. Resolution Time',
    kpiDaysUnit: 'Days',
    severityScore: 'Severity Score',
    topProblemCategory: 'Top Problem Category',
    resolutionRate: 'Resolution Rate',
    openComplaints: 'Open Grievances',
    normalStatus: 'Optimal (>80% resolved)',
    moderateStatus: 'Moderate (20-50% open)',
    criticalStatus: 'High Urgency (>50% open)',
    wardComparisonChart: 'Ward-Wise Comparison (Resolved vs Pending)',
    categoryDistributionChart: 'Grievance Category Breakdown',
    downloadPdfReport: 'Download Monthly Panchayat Report (PDF)',
    generatingPdf: 'Generating PDF Report...',
    filterByWard: 'Filter Grievances for this Ward',
    allWardsLabel: 'All 7 Wards',
    gramSabhaReportTitle: 'Gram Panchayat Sahari - Administrative & Ward Analytics Report',
  }
};

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => {
    try {
      return localStorage.getItem('gramseva_lang') || 'hi';
    } catch {
      return 'hi';
    }
  });

  const toggleLang = () => {
    const newLang = lang === 'hi' ? 'en' : 'hi';
    setLang(newLang);
    try {
      localStorage.setItem('gramseva_lang', newLang);
    } catch {
      // ignore
    }
  };

  const t = translations[lang] || translations.hi;

  return (
    <LanguageContext.Provider value={{ lang, language: lang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLang = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLang must be used inside LanguageProvider');
  return ctx;
};

export const useLanguage = useLang;

export default LanguageContext;
