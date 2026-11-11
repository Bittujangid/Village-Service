import React, { useState, useEffect } from 'react';
import { Megaphone, ChevronLeft, ChevronRight, Share2, Sparkles, BellRing } from 'lucide-react';
import { getNotices } from '../api/notices';
import { useLang } from '../context/LanguageContext';

const CACHE_KEY = 'cached_public_notices';

export const SEED_NOTICES = [
  {
    _id: 'notice-transformer-upgrades',
    titleHi: 'ग्रिड ट्रांसफार्मर मरम्मत हेतु अस्थायी विद्युत आपूर्ति कटौती',
    titleEn: 'Temporary Power Shutdown for Grid Transformer Upgrades',
    title: 'ग्रिड ट्रांसफार्मर मरम्मत हेतु अस्थायी विद्युत आपूर्ति कटौती',
    descriptionHi: 'विद्युत वितरण निगम द्वारा ट्रांसफार्मर मरम्मत कार्य के चलते कल दोपहर 12:00 बजे से 3:00 बजे तक वार्ड 4, 5 और 6 में बिजली आपूर्ति बंद रहेगी। कार्य पूर्ण होते ही आपूर्ति सुचारू कर दी जाएगी।',
    descriptionEn: 'Power supply across Wards 4, 5, and 6 will remain shut tomorrow between 12:00 PM and 3:00 PM for critical transformer maintenance by the electricity distribution board. Normal power supply will resume promptly after testing.',
    description: 'विद्युत वितरण निगम द्वारा ट्रांसफार्मर मरम्मत कार्य के चलते कल दोपहर 12:00 बजे से 3:00 बजे तक वार्ड 4, 5 और 6 में बिजली आपूर्ति बंद रहेगी। कार्य पूर्ण होते ही आपूर्ति सुचारू कर दी जाएगी।',
    categoryHi: 'विद्युत आपूर्ति',
    categoryEn: 'Electricity',
    category: 'विद्युत आपूर्ति',
    isImportant: true,
    priority: 'high',
  },
  {
    _id: 'notice-pipeline-maintenance',
    titleHi: 'वार्ड 2 और 3 में मुख्य पेयजल पाइपलाइन मरम्मत कार्य',
    titleEn: 'Scheduled Pipeline Maintenance in Wards 2 & 3',
    title: 'वार्ड 2 और 3 में मुख्य पेयजल पाइपलाइन मरम्मत कार्य',
    descriptionHi: 'वार्ड 2 में मुख्य पेयजल पाइपलाइन लीकेज मरम्मत कार्य के कारण कल प्रातः 8:00 बजे से दोपहर 1:00 बजे तक जलापूर्ति बाधित रहेगी। सभी ग्रामवासी आवश्यकतानुसार पर्याप्त पानी का भंडारण कर लें। असुविधा के लिए खेद है।',
    descriptionEn: 'Water supply across Wards 2 & 3 will remain disrupted tomorrow from 8:00 AM to 1:00 PM due to main drinking water pipeline leakage repairs in Ward 2. All villagers are requested to store adequate water. Inconvenience is regretted.',
    description: 'वार्ड 2 में मुख्य पेयजल पाइपलाइन मरम्मत कार्य के कारण कल प्रातः 8:00 बजे से दोपहर 1:00 बजे तक जलापूर्ति बाधित रहेगी। सभी ग्रामवासी आवश्यकतानुसार पर्याप्त पानी का भंडारण कर लें। असुविधा के लिए खेद है।',
    categoryHi: 'पेयजल व जल आपूर्ति',
    categoryEn: 'Water Supply',
    category: 'पेयजल व जल आपूर्ति',
    isImportant: true,
    priority: 'high',
  },
  {
    _id: 'notice-fogging-drive',
    titleHi: 'समस्त वार्डों में फॉगिंग एवं कीटनाशक छिड़काव अभियान',
    titleEn: 'Fogging and Insecticide Spray Drive Across All Wards',
    title: 'समस्त वार्डों में फॉगिंग एवं कीटनाशक छिड़काव अभियान',
    descriptionHi: 'मौसमी बीमारियों (मलेरिया/डेंगू) की रोकथाम हेतु पंचायत द्वारा सभी 7 वार्डों में नियमित फॉगिंग और नालियों में कीटनाशक दवा का छिड़काव किया जा रहा है। अपने घर के आसपास जलभराव न होने दें।',
    descriptionEn: 'Regular fogging and anti-larval chemical spraying in drains is being conducted across all 7 wards by the Panchayat to prevent seasonal vector-borne diseases (malaria/dengue). Please avoid water stagnation near your homes.',
    description: 'मौसमी बीमारियों (मलेरिया/डेंगू) की रोकथाम हेतु पंचायत द्वारा सभी 7 वार्डों में नियमित फॉगिंग और नालियों में कीटनाशक दवा का छिड़काव किया जा रहा है। अपने घर के आसपास जलभराव न होने दें।',
    categoryHi: 'स्वच्छता अभियान',
    categoryEn: 'Sanitation',
    category: 'स्वच्छता अभियान',
    isImportant: false,
    priority: 'normal',
  },
  {
    _id: 'notice-gram-sabha',
    titleHi: 'वार्षिक विकास योजनाओं हेतु विशेष ग्राम सभा बैठक',
    titleEn: 'Special Gram Sabha Meeting for Annual Development Plans',
    title: 'वार्षिक विकास योजनाओं हेतु विशेष ग्राम सभा बैठक',
    descriptionHi: 'आगामी वित्तीय वर्ष के विकास कार्यों एवं नरेगा कार्ययोजना के अनुमोदन हेतु पंचायत भवन में विशेष ग्राम सभा आयोजित की जाएगी। समस्त ग्रामवासी अपनी सहभागिता सुनिश्चित करें।',
    descriptionEn: 'A special Gram Sabha will be held at Panchayat Bhawan for approval of next financial year development works and NREGA action plan. All villagers are requested to ensure their participation.',
    description: 'आगामी वित्तीय वर्ष के विकास कार्यों एवं नरेगा कार्ययोजना के अनुमोदन हेतु पंचायत भवन में विशेष ग्राम सभा आयोजित की जाएगी। समस्त ग्रामवासी अपनी सहभागिता सुनिश्चित करें।',
    categoryHi: 'ग्राम सभा',
    categoryEn: 'Gram Sabha',
    category: 'ग्राम सभा',
    isImportant: true,
    priority: 'high',
  },
  {
    _id: 'notice-health-camp',
    titleHi: 'निःशुल्क स्वास्थ्य जांच एवं दवा वितरण शिविर',
    titleEn: 'Free Health Checkup and Medicine Distribution Camp',
    title: 'निःशुल्क स्वास्थ्य जांच एवं दवा वितरण शिविर',
    descriptionHi: 'ग्राम पंचायत भवन में आगामी रविवार को सुबह 9:00 बजे से दोपहर 3:00 बजे तक निःशुल्क स्वास्थ्य जांच शिविर का आयोजन किया जाएगा। सभी ग्रामवासी लाभ उठाएं।',
    descriptionEn: 'A free health checkup and medicine camp will be organized at the Panchayat Bhawan this Sunday from 9:00 AM to 3:00 PM. All villagers are welcome to benefit.',
    description: 'ग्राम पंचायत भवन में आगामी रविवार को सुबह 9:00 बजे से दोपहर 3:00 बजे तक निःशुल्क स्वास्थ्य जांच शिविर का आयोजन किया जाएगा। सभी ग्रामवासी लाभ उठाएं।',
    categoryHi: 'स्वास्थ्य / शिविर',
    categoryEn: 'Health & Camp',
    category: 'स्वास्थ्य / शिविर',
    isImportant: true,
    priority: 'high',
  },
  {
    _id: 'notice-ration-distribution',
    titleHi: 'मासिक सार्वजनिक राशन वितरण सूचना',
    titleEn: 'Monthly Public Foodgrain Distribution Notice',
    title: 'मासिक सार्वजनिक राशन वितरण सूचना',
    descriptionHi: 'सभी राशन कार्ड धारकों को सूचित किया जाता है कि चालू माह का खाद्यान्न वितरण 5 से 12 तारीख तक उचित मूल्य की दुकान पर किया जाएगा। अपना आधार कार्ड साथ लाएं।',
    descriptionEn: 'All ration card holders are informed that monthly foodgrain distribution will take place from the 5th to the 12th at the Fair Price Shop. Please bring your Aadhaar card.',
    description: 'सभी राशन कार्ड धारकों को सूचित किया जाता है कि चालू माह का खाद्यान्न वितरण 5 से 12 तारीख तक उचित मूल्य की दुकान पर किया जाएगा। अपना आधार कार्ड साथ लाएं।',
    categoryHi: 'राशन वितरण',
    categoryEn: 'Ration Distribution',
    category: 'राशन वितरण',
    isImportant: false,
    priority: 'normal',
  },
  {
    _id: 'notice-welcome',
    titleHi: 'ग्राम पंचायत सहरी में आपका स्वागत है',
    titleEn: 'Welcome to Gram Panchayat Sahari',
    title: 'ग्राम पंचायत सहरी में आपका स्वागत है',
    descriptionHi: 'ग्राम पंचायत सहरी ई-सेवा पोर्टल पर आपका स्वागत है। किसी भी सार्वजनिक समस्या के त्वरित समाधान हेतु नागरिक शिकायत दर्ज करें।',
    descriptionEn: 'Welcome to Gram Panchayat Sahari E-Services Portal. Submit your complaint online for quick resolution of civic issues.',
    description: 'ग्राम पंचायत सहरी ई-सेवा पोर्टल पर आपका स्वागत है। किसी भी सार्वजनिक समस्या के त्वरित समाधान हेतु नागरिक शिकायत दर्ज करें।',
    categoryHi: 'सामान्य सूचना',
    categoryEn: 'General Notice',
    category: 'सामान्य सूचना',
    isImportant: false,
    priority: 'normal',
  }
];

export const isDevanagari = (str) => /[\u0900-\u097F]/.test(str || '');

/**
 * Built-in translation dictionaries for standard/existing village notices.
 * Matches keywords across title, description, or category to provide instant bilingual fidelity.
 */
export const BUILT_IN_TRANSLATIONS = [
  // 1. Transformer Upgrades / Power Shutdown
  {
    matcher: (text) => /transformer|विद्युत आपूर्ति|बिजली|grid|shutdown|power/i.test(text),
    titleHi: 'ग्रिड ट्रांसफार्मर मरम्मत हेतु अस्थायी विद्युत आपूर्ति कटौती',
    titleEn: 'Temporary Power Shutdown for Grid Transformer Upgrades',
    descriptionHi: 'विद्युत वितरण निगम द्वारा ट्रांसफार्मर मरम्मत कार्य के चलते कल दोपहर 12:00 बजे से 3:00 बजे तक वार्ड 4, 5 और 6 में बिजली आपूर्ति बंद रहेगी। कार्य पूर्ण होते ही आपूर्ति सुचारू कर दी जाएगी।',
    descriptionEn: 'Power supply across Wards 4, 5, and 6 will remain shut tomorrow between 12:00 PM and 3:00 PM for critical transformer maintenance by the electricity distribution board. Normal power supply will resume promptly after testing.',
    categoryHi: 'विद्युत आपूर्ति',
    categoryEn: 'Electricity',
    isImportant: true,
    priority: 'high',
  },
  // 2. Pipeline Maintenance
  {
    matcher: (text) => /pipeline|पाइपलाइन|पेयजल|water supply|leakage|लीकेज/i.test(text),
    titleHi: 'वार्ड 2 और 3 में मुख्य पेयजल पाइपलाइन मरम्मत कार्य',
    titleEn: 'Scheduled Pipeline Maintenance in Wards 2 & 3',
    descriptionHi: 'वार्ड 2 में मुख्य पेयजल पाइपलाइन लीकेज मरम्मत कार्य के कारण कल प्रातः 8:00 बजे से दोपहर 1:00 बजे तक जलापूर्ति बाधित रहेगी। सभी ग्रामवासी आवश्यकतानुसार पर्याप्त पानी का भंडारण कर लें। असुविधा के लिए खेद है।',
    descriptionEn: 'Water supply across Wards 2 & 3 will remain disrupted tomorrow from 8:00 AM to 1:00 PM due to main drinking water pipeline leakage repairs in Ward 2. All villagers are requested to store adequate water. Inconvenience is regretted.',
    categoryHi: 'पेयजल व जल आपूर्ति',
    categoryEn: 'Water Supply',
    isImportant: true,
    priority: 'high',
  },
  // 3. Fogging and Spray Drive
  {
    matcher: (text) => /fogging|फॉगिंग|कीटनाशक|spraying|spray|dengue|malaria|डेंगू/i.test(text),
    titleHi: 'समस्त वार्डों में फॉगिंग एवं कीटनाशक छिड़काव अभियान',
    titleEn: 'Fogging and Insecticide Spray Drive Across All Wards',
    descriptionHi: 'मौसमी बीमारियों (मलेरिया/डेंगू) की रोकथाम हेतु पंचायत द्वारा सभी 7 वार्डों में नियमित फॉगिंग और नालियों में कीटनाशक दवा का छिड़काव किया जा रहा है। अपने घर के आसपास जलभराव न होने दें।',
    descriptionEn: 'Regular fogging and anti-larval chemical spraying in drains is being conducted across all 7 wards by the Panchayat to prevent seasonal vector-borne diseases (malaria/dengue). Please avoid water stagnation near your homes.',
    categoryHi: 'स्वच्छता अभियान',
    categoryEn: 'Sanitation',
    isImportant: false,
    priority: 'normal',
  },
  // 4. Special Gram Sabha Meeting
  {
    matcher: (text) => /gram sabha|ग्राम सभा|वार्षिक विकास|विकास योजना|nrega|नरेगा|meeting/i.test(text),
    titleHi: 'वार्षिक विकास योजनाओं हेतु विशेष ग्राम सभा बैठक',
    titleEn: 'Special Gram Sabha Meeting for Annual Development Plans',
    descriptionHi: 'आगामी वित्तीय वर्ष के विकास कार्यों एवं नरेगा कार्ययोजना के अनुमोदन हेतु पंचायत भवन में विशेष ग्राम सभा आयोजित की जाएगी। समस्त ग्रामवासी अपनी सहभागिता सुनिश्चित करें।',
    descriptionEn: 'A special Gram Sabha will be held at Panchayat Bhawan for approval of next financial year development works and NREGA action plan. All villagers are requested to ensure their participation.',
    categoryHi: 'ग्राम सभा',
    categoryEn: 'Gram Sabha',
    isImportant: true,
    priority: 'high',
  },
  // 5. Health Checkup Camp
  {
    matcher: (text) => /health|स्वास्थ्य|शिविर|camp|दवा वितरण/i.test(text),
    titleHi: 'निःशुल्क स्वास्थ्य जांच एवं दवा वितरण शिविर',
    titleEn: 'Free Health Checkup and Medicine Distribution Camp',
    descriptionHi: 'ग्राम पंचायत भवन में आगामी रविवार को सुबह 9:00 बजे से दोपहर 3:00 बजे तक निःशुल्क स्वास्थ्य जांच शिविर का आयोजन किया जाएगा। सभी ग्रामवासी लाभ उठाएं।',
    descriptionEn: 'A free health checkup and medicine camp will be organized at the Panchayat Bhawan this Sunday from 9:00 AM to 3:00 PM. All villagers are welcome to benefit.',
    categoryHi: 'स्वास्थ्य / शिविर',
    categoryEn: 'Health & Camp',
    isImportant: true,
    priority: 'high',
  },
  // 6. Ration Distribution
  {
    matcher: (text) => /ration|राशन|foodgrain|खाद्यान्न|fair price/i.test(text),
    titleHi: 'मासिक सार्वजनिक राशन वितरण सूचना',
    titleEn: 'Monthly Public Foodgrain Distribution Notice',
    descriptionHi: 'सभी राशन कार्ड धारकों को सूचित किया जाता है कि चालू माह का खाद्यान्न वितरण 5 से 12 तारीख तक उचित मूल्य की दुकान पर किया जाएगा। अपना आधार कार्ड साथ लाएं।',
    descriptionEn: 'All ration card holders are informed that monthly foodgrain distribution will take place from the 5th to the 12th at the Fair Price Shop. Please bring your Aadhaar card.',
    categoryHi: 'राशन वितरण',
    categoryEn: 'Ration Distribution',
    isImportant: false,
    priority: 'normal',
  },
  // 7. Welcome Notice
  {
    matcher: (text) => /welcome|स्वागत/i.test(text),
    titleHi: 'ग्राम पंचायत सहरी में आपका स्वागत है',
    titleEn: 'Welcome to Gram Panchayat Sahari',
    descriptionHi: 'ग्राम पंचायत सहरी ई-सेवा पोर्टल पर आपका स्वागत है। किसी भी सार्वजनिक समस्या के त्वरित समाधान हेतु नागरिक शिकायत दर्ज करें।',
    descriptionEn: 'Welcome to Gram Panchayat Sahari E-Services Portal. Submit your complaint online for quick resolution of civic issues.',
    categoryHi: 'सामान्य सूचना',
    categoryEn: 'General Notice',
    isImportant: false,
    priority: 'normal',
  }
];

export const enrichNotice = (notice) => {
  if (!notice) return notice;

  const rawTitle = (notice.title || '').trim();
  const rawDesc  = (notice.description || notice.content || '').trim();
  const searchCorpus = `${rawTitle} ${rawDesc} ${notice.titleEn || ''} ${notice.descriptionEn || ''} ${notice.titleHi || ''} ${notice.descriptionHi || ''}`.toLowerCase();

  // 1. Direct seed or ID match
  const seedMatch = SEED_NOTICES.find(
    (s) =>
      s._id === notice._id ||
      s._id === notice.id ||
      s.title === rawTitle ||
      s.titleHi === rawTitle ||
      s.titleEn === rawTitle
  );

  // 2. Built-in translation dictionary match
  const transMatch = BUILT_IN_TRANSLATIONS.find((t) => t.matcher(searchCorpus));
  const matched = seedMatch || transMatch;

  // Genuine Hindi check (must contain Devanagari Unicode characters)
  const hasValidHiTitle = isDevanagari(notice.titleHi);
  const hasValidHiDesc  = isDevanagari(notice.descriptionHi);
  const hasValidEnTitle = notice.titleEn && !isDevanagari(notice.titleEn);
  const hasValidEnDesc  = notice.descriptionEn && !isDevanagari(notice.descriptionEn);

  // Derive titleHi: genuine Hindi from notice, or translation match, or rawTitle if it's Devanagari
  const titleHi = (hasValidHiTitle ? notice.titleHi.trim() : '')
    || matched?.titleHi
    || (isDevanagari(rawTitle) ? rawTitle : '');

  // Derive titleEn: genuine English from notice, or translation match, or rawTitle if it's English
  const titleEn = (hasValidEnTitle ? notice.titleEn.trim() : '')
    || matched?.titleEn
    || (!isDevanagari(rawTitle) ? rawTitle : '');

  // Derive descriptionHi
  const descriptionHi = (hasValidHiDesc ? notice.descriptionHi.trim() : '')
    || matched?.descriptionHi
    || (isDevanagari(rawDesc) ? rawDesc : '');

  // Derive descriptionEn
  const descriptionEn = (hasValidEnDesc ? notice.descriptionEn.trim() : '')
    || matched?.descriptionEn
    || (!isDevanagari(rawDesc) ? rawDesc : '');

  // Derive categoryHi & categoryEn
  const rawCat = notice.category || '';
  const categoryHi = (isDevanagari(notice.categoryHi) ? notice.categoryHi.trim() : '')
    || matched?.categoryHi
    || (isDevanagari(rawCat) ? rawCat : '');

  const categoryEn = (notice.categoryEn && !isDevanagari(notice.categoryEn) ? notice.categoryEn.trim() : '')
    || matched?.categoryEn
    || (!isDevanagari(rawCat) ? rawCat : '');

  return {
    ...notice,
    titleHi:       titleHi || rawTitle,
    titleEn:       titleEn || rawTitle,
    descriptionHi: descriptionHi || rawDesc,
    descriptionEn: descriptionEn || rawDesc,
    categoryHi:    categoryHi || rawCat,
    categoryEn:    categoryEn || rawCat,
    isImportant:   notice.isImportant !== undefined ? notice.isImportant : (matched?.isImportant ?? false),
    priority:      notice.priority || matched?.priority || 'normal',
  };
};

const getDefaultFallbackNotices = () => SEED_NOTICES;

const getInitialNotices = () => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map(enrichNotice);
      }
    }
  } catch (e) {
    console.warn('Failed to parse cached notices:', e);
  }
  return SEED_NOTICES;
};

const NoticeBoard = () => {
  const { lang, t } = useLang();
  const isHi = lang === 'hi';
  const [notices, setNotices] = useState(() => getInitialNotices());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [slideDirection, setSlideDirection] = useState('right');
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Stale-While-Revalidate: fetch fresh notices asynchronously
  useEffect(() => {
    let isMounted = true;
    const fetchNoticesData = async () => {
      try {
        const data = await getNotices();
        if (isMounted) {
          // Backend returns { success: true, count, notices, data: [...] }
          const list = Array.isArray(data)
            ? data
            : data?.notices || data?.data || [];

          if (list.length > 0) {
            const enriched = list.map(enrichNotice);
            setNotices(enriched);
            setCurrentIndex(0);
            try {
              localStorage.setItem(CACHE_KEY, JSON.stringify(enriched));
            } catch (err) {
              console.warn('Failed to cache notices in localStorage:', err);
            }
          } else if (notices.length === 0) {
            setNotices(SEED_NOTICES);
          }
        }
      } catch (err) {
        console.warn('Notice fetch error (maintaining cached/fallback notices):', err);
        if (isMounted) {
          // Maintain existing cached notices on error, fallback only if empty
          setNotices((prev) => {
            if (prev.length > 0) return prev;
            return SEED_NOTICES;
          });
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchNoticesData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Auto-advance carousel every 8 seconds if multiple notices exist
  useEffect(() => {
    if (notices.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % notices.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [notices.length]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-3 pb-1">
        <div className="bg-white border-l-4 border-l-blue-900 border border-slate-200 rounded-xl p-3 sm:p-4 flex items-center gap-3 sm:gap-4 animate-pulse shadow-2xs">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg bg-slate-200 shrink-0"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-slate-200 rounded w-1/4"></div>
            <div className="h-3 bg-slate-100 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  // If no notices exist in DB, show a clean, authentic fallback banner
  if (notices.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-3 pb-1">
        <div className="bg-white border-l-4 border-l-blue-900 border border-slate-200 rounded-xl shadow-2xs p-3 sm:p-4 flex items-center justify-between gap-3 text-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-900 flex items-center justify-center shrink-0 border border-blue-100">
              <Megaphone className="w-5 h-5 text-blue-900" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight">
                {t.noticeBoardSubtitle}
              </p>
              <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
                {t.noticePlaceholder}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const rawNotice = notices[currentIndex] || notices[0];
  const activeNotice = enrichNotice(rawNotice);
  const title = isHi
    ? (activeNotice?.titleHi || activeNotice?.title)
    : (activeNotice?.titleEn || activeNotice?.title);
  const description = isHi
    ? (activeNotice?.descriptionHi || activeNotice?.description || activeNotice?.content || '')
    : (activeNotice?.descriptionEn || activeNotice?.description || activeNotice?.content || '');
  const category = isHi
    ? (activeNotice?.categoryHi || activeNotice?.category)
    : (activeNotice?.categoryEn || activeNotice?.category);

  const isHighPriority = Boolean(
    activeNotice?.isImportant ||
    activeNotice?.priority === 'high' ||
    activeNotice?.priority === 'urgent' ||
    activeNotice?.priority === 'अति आवश्यक'
  );

  const handleNext = () => {
    setSlideDirection('right');
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % notices.length);
      setIsTransitioning(false);
    }, 120);
  };

  const handlePrev = () => {
    setSlideDirection('left');
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + notices.length) % notices.length);
      setIsTransitioning(false);
    }, 120);
  };

  const portalUrl = typeof window !== 'undefined' ? window.location.origin : 'https://gramseva.in';
  const priorityText = isHighPriority
    ? (isHi ? 'अति आवश्यक' : 'High Priority')
    : (activeNotice?.priority || (isHi ? 'सामान्य' : 'General'));

  const getCategoryDisplay = (cat) => {
    if (!cat) return isHi ? 'सामान्य सूचना' : 'General Notice';
    const c = String(cat).toLowerCase();
    if (c.includes('विद्युत') || c.includes('electric') || c.includes('बिजली')) {
      return isHi ? 'विद्युत आपूर्ति' : 'Electricity';
    }
    if (c.includes('पेयजल') || c.includes('water') || c.includes('पानी') || c.includes('पाइपलाइन')) {
      return isHi ? 'पेयजल व जल आपूर्ति' : 'Water Supply';
    }
    if (c.includes('स्वच्छता') || c.includes('sanit') || c.includes('सफाई') || c.includes('फॉगिंग')) {
      return isHi ? 'स्वच्छता अभियान' : 'Sanitation';
    }
    if (c.includes('सड़क') || c.includes('road') || c.includes('निर्माण')) {
      return isHi ? 'सड़क व निर्माण' : 'Roads & Works';
    }
    if (c.includes('कृषि') || c.includes('agri') || c.includes('योजना')) {
      return isHi ? 'कृषि व योजनाएं' : 'Agriculture & Schemes';
    }
    if (c.includes('स्वास्थ्य') || c.includes('health') || c.includes('शिविर') || c.includes('दवा')) {
      return isHi ? 'स्वास्थ्य / शिविर' : 'Health & Camp';
    }
    if (c.includes('राशन') || c.includes('ration') || c.includes('खाद्यान्न')) {
      return isHi ? 'राशन वितरण' : 'Ration Distribution';
    }
    if (c.includes('ग्राम सभा') || c.includes('sabha')) {
      return isHi ? 'ग्राम सभा' : 'Gram Sabha';
    }
    if (cat === 'सामान्य सूचना' || cat === 'General Notice' || cat === 'सामान्य') {
      return isHi ? 'सामान्य सूचना' : 'General Notice';
    }
    return cat;
  };

  const formattedWhatsAppText = isHi
    ? `📢 *ग्राम पंचायत सहरी - आधिकारिक सूचना*
━━━━━━━━━━━━━━━━━━━━━
📌 *विषय:* ${title}
🏷️ *श्रेणी:* ${getCategoryDisplay(category)} | *प्राथमिकता:* ${priorityText}

📝 *विवरण:*
${description}

━━━━━━━━━━━━━━━━━━━━━
🌐 *ग्राम पंचायत पोर्टल:* ${portalUrl}
🏛️ *डिजिटल ग्राम पंचायत सहरी (GramSeva)*`
    : `📢 *Gram Panchayat Sahari - Official Notice*
━━━━━━━━━━━━━━━━━━━━━
📌 *Subject:* ${title}
🏷️ *Category:* ${getCategoryDisplay(category)} | *Priority:* ${priorityText}

📝 *Details:*
${description}

━━━━━━━━━━━━━━━━━━━━━
🌐 *Gram Panchayat Portal:* ${portalUrl}
🏛️ *Digital Gram Panchayat Sahari (GramSeva)*`;

  const handleShareWhatsApp = (e) => {
    e?.preventDefault();
    const shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(formattedWhatsAppText)}`;
    window.open(shareUrl, '_blank', 'noopener,noreferrer');
  };

  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(formattedWhatsAppText)}`;

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-2.5 sm:pt-3 pb-1">
      <div className={`rounded-2xl p-4 shadow-xs flex flex-col gap-2.5 sm:gap-3 border ${
        isHighPriority
          ? 'bg-rose-50/70 border-rose-200 border-l-4 border-l-rose-500'
          : 'bg-sky-50/70 border-sky-200 border-l-4 border-l-blue-600'
      }`}>
        
        {/* Top: Badges on Left & Counter + Navigation Arrows on Top-Right */}
        <div className="flex items-center justify-between gap-2 w-full">
          <div className="flex items-center gap-2 min-w-0">
            {isHighPriority ? (
              <div className="relative w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 border border-rose-200">
                <span className="absolute -top-1 -right-1 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-600"></span>
                </span>
                <BellRing className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-600" />
              </div>
            ) : (
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 border border-blue-200">
                <BellRing className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" />
              </div>
            )}

            <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 min-w-0">
              <span className={`inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-md uppercase tracking-wider text-white ${
                isHighPriority
                  ? 'bg-rose-600'
                  : 'bg-blue-600'
              }`}>
                {isHighPriority ? (
                  <>
                    <span className="relative flex h-2 w-2 mr-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                    </span>
                    <span>{lang === 'hi' ? 'अति आवश्यक' : 'HIGH PRIORITY'}</span>
                  </>
                ) : (
                  <>
                    <span className="relative flex h-1.5 w-1.5 mr-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-300 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-blue-300"></span>
                    </span>
                    <span>{lang === 'hi' ? 'महत्वपूर्ण सूचना' : 'IMPORTANT NOTICE'}</span>
                  </>
                )}
              </span>
              {category && (
                <span className={`px-2 py-0.5 rounded-md text-xs font-medium truncate border ${
                  isHighPriority
                    ? 'bg-rose-100 text-rose-800 border-rose-200'
                    : 'bg-sky-100 text-sky-800 border-sky-200'
                }`}>
                  {getCategoryDisplay(category)}
                </span>
              )}
            </div>
          </div>

          {/* Top-Right: Pagination counter & Previous / Next navigation arrows */}
          {notices.length > 1 && (
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-[11px] sm:text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                {currentIndex + 1} / {notices.length}
              </span>
              <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5 shadow-2xs">
                <button
                  type="button"
                  onClick={handlePrev}
                  className="p-1 hover:bg-slate-100 rounded text-slate-600 transition-transform duration-150 active:scale-[0.92] select-none touch-manipulation cursor-pointer"
                  aria-label={t.prevNotice}
                  title={t.prevNotice}
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="p-1 hover:bg-slate-100 rounded text-slate-600 transition-transform duration-150 active:scale-[0.92] select-none touch-manipulation cursor-pointer"
                  aria-label={t.nextNotice}
                  title={t.nextNotice}
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Notice Info: Title & Description with Smooth Slide-Fade Transition */}
        <div
          className={`min-w-0 transition-all duration-200 ease-out transform transform-gpu ${
            isTransitioning
              ? slideDirection === 'right'
                ? '-translate-x-2 opacity-0'
                : 'translate-x-2 opacity-0'
              : 'translate-x-0 opacity-100'
          }`}
        >
          <h2 className="text-xs sm:text-sm md:text-base font-bold text-slate-900 tracking-tight leading-snug break-words">
            {title}
          </h2>
          <p className="text-[11px] sm:text-xs text-slate-600 line-clamp-2 sm:line-clamp-3 mt-1 leading-relaxed break-words">
            {description}
          </p>
        </div>

        {/* Bottom: WhatsApp Action Button (Full-width on mobile, auto/compact on desktop) */}
        <div className="pt-1 flex justify-start sm:justify-start">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 transition-transform duration-150 active:scale-[0.98] select-none touch-manipulation text-white font-medium text-xs shadow-xs cursor-pointer"
            aria-label={t.whatsappShare}
          >
            <svg
              viewBox="0 0 24 24"
              className="w-4 h-4 fill-current shrink-0"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            <span>{t.whatsappShare}</span>
          </a>
        </div>

      </div>
    </div>
  );
};

export default NoticeBoard;
