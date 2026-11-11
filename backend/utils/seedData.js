/**
 * Seed data for initial database population
 */

const sampleDirectory = [
  {
    name: 'श्री लखन',
    role: 'सरपंच (Gram Pradhan)',
    phone: '0000000000',
    department: 'ग्राम पंचायत सहरी',
    badge: 'प्रथम नागरिक / ग्राम प्रधान',
    priority: 1
  },
  {
    name: 'श्रीमती कौशल्या देवी',
    role: 'वार्ड पंच (वार्ड 1)',
    phone: '0000000000',
    department: 'ग्राम पंचायत सहरी',
    priority: 2
  },
  {
    name: 'श्री रामअवतार मीणा',
    role: 'वार्ड पंच (वार्ड 2)',
    phone: '0000000000',
    department: 'ग्राम पंचायत सहरी',
    priority: 3
  },
  {
    name: 'श्रीमती विमला जाट',
    role: 'वार्ड पंच (वार्ड 3)',
    phone: '0000000000',
    department: 'ग्राम पंचायत सहरी',
    priority: 4
  },
  {
    name: 'श्री मुकेश गुर्जर',
    role: 'वार्ड पंच (वार्ड 4)',
    phone: '0000000000',
    department: 'ग्राम पंचायत सहरी',
    priority: 5
  },
  {
    name: 'श्रीमती संतोष शर्मा',
    role: 'वार्ड पंच (वार्ड 5)',
    phone: '0000000000',
    department: 'ग्राम पंचायत सहरी',
    priority: 6
  },
  {
    name: 'श्री धर्मपाल वर्मा',
    role: 'वार्ड पंच (वार्ड 6)',
    phone: '0000000000',
    department: 'ग्राम पंचायत सहरी',
    priority: 7
  },
  {
    name: 'श्री सोहन लाल बैरवा',
    role: 'वार्ड पंच (वार्ड 7)',
    phone: '0000000000',
    department: 'ग्राम पंचायत सहरी',
    priority: 8
  }
];

const defaultAdmin = {
  username: 'sarpanch',
  password: 'Sarpanch@2026Secure',
  role: 'superadmin'
};

const sampleNotices = [
  {
    title: 'क्रिकेट मैदान निर्माण एवं खेल सुविधा',
    titleHi: 'क्रिकेट मैदान निर्माण एवं खेल सुविधा',
    titleEn: 'Cricket Ground Construction and Sports Facility',
    description: 'हमारे गांव में एक क्रिकेट मैदान तैयार किया जा रहा है जहाँ सभी बच्चे आसानी से खेल सकें। खेल सुविधाओं के विकास हेतु पंचायत प्रयासरत है।',
    descriptionHi: 'हमारे गांव में एक क्रिकेट मैदान तैयार किया जा रहा है जहाँ सभी बच्चे आसानी से खेल सकें। खेल सुविधाओं के विकास हेतु पंचायत प्रयासरत है।',
    descriptionEn: 'We are organizing a cricket ground in our village where all children can play comfortably.',
    category: 'खेलकूद व युवा कल्याण',
    categoryHi: 'खेलकूद व युवा कल्याण',
    categoryEn: 'Sports & Youth',
    isImportant: false,
    isActive: true
  },
  {
    title: 'ग्रिड ट्रांसफार्मर मरम्मत हेतु अस्थायी विद्युत आपूर्ति कटौती',
    titleHi: 'ग्रिड ट्रांसफार्मर मरम्मत हेतु अस्थायी विद्युत आपूर्ति कटौती',
    titleEn: 'Temporary Power Shutdown for Grid Transformer Upgrades',
    description: 'विद्युत वितरण निगम द्वारा ट्रांसफार्मर मरम्मत कार्य के चलते कल दोपहर 12:00 बजे से 3:00 बजे तक वार्ड 4, 5 और 6 में बिजली आपूर्ति बंद रहेगी। कार्य पूर्ण होते ही आपूर्ति सुचारू कर दी जाएगी।',
    descriptionHi: 'विद्युत वितरण निगम द्वारा ट्रांसफार्मर मरम्मत कार्य के चलते कल दोपहर 12:00 बजे से 3:00 बजे तक वार्ड 4, 5 और 6 में बिजली आपूर्ति बंद रहेगी। कार्य पूर्ण होते ही आपूर्ति सुचारू कर दी जाएगी।',
    descriptionEn: 'Power supply across Wards 4, 5, and 6 will remain shut tomorrow between 12:00 PM and 3:00 PM for critical transformer maintenance by the electricity distribution board. Normal power supply will resume promptly after testing.',
    category: 'विद्युत आपूर्ति',
    categoryHi: 'विद्युत आपूर्ति',
    categoryEn: 'Electricity',
    isImportant: true,
    isActive: true
  },
  {
    title: 'वार्ड 2 और 3 में मुख्य पेयजल पाइपलाइन मरम्मत कार्य',
    titleHi: 'वार्ड 2 और 3 में मुख्य पेयजल पाइपलाइन मरम्मत कार्य',
    titleEn: 'Scheduled Pipeline Maintenance in Wards 2 & 3',
    description: 'वार्ड 2 में मुख्य पेयजल पाइपलाइन लीकेज मरम्मत कार्य के कारण कल प्रातः 8:00 बजे से दोपहर 1:00 बजे तक जलापूर्ति बाधित रहेगी। सभी ग्रामवासी आवश्यकतानुसार पर्याप्त पानी का भंडारण कर लें। असुविधा के लिए खेद है।',
    descriptionHi: 'वार्ड 2 में मुख्य पेयजल पाइपलाइन लीकेज मरम्मत कार्य के कारण कल प्रातः 8:00 बजे से दोपहर 1:00 बजे तक जलापूर्ति बाधित रहेगी। सभी ग्रामवासी आवश्यकतानुसार पर्याप्त पानी का भंडारण कर लें। असुविधा के लिए खेद है।',
    descriptionEn: 'Water supply across Wards 2 & 3 will remain disrupted tomorrow from 8:00 AM to 1:00 PM due to main drinking water pipeline leakage repairs in Ward 2. All villagers are requested to store adequate water. Inconvenience is regretted.',
    category: 'पेयजल व जल आपूर्ति',
    categoryHi: 'पेयजल व जल आपूर्ति',
    categoryEn: 'Water Supply',
    isImportant: true,
    isActive: true
  },
  {
    title: 'समस्त वार्डों में फॉगिंग एवं कीटनाशक छिड़काव अभियान',
    titleHi: 'समस्त वार्डों में फॉगिंग एवं कीटनाशक छिड़काव अभियान',
    titleEn: 'Fogging and Insecticide Spray Drive Across All Wards',
    description: 'मौसमी बीमारियों (मलेरिया/डेंगू) की रोकथाम हेतु पंचायत द्वारा सभी 7 वार्डों में नियमित फॉगिंग और नालियों में कीटनाशक दवा का छिड़काव किया जा रहा है। अपने घर के आसपास जलभराव न होने दें।',
    descriptionHi: 'मौसमी बीमारियों (मलेरिया/डेंगू) की रोकथाम हेतु पंचायत द्वारा सभी 7 वार्डों में नियमित फॉगिंग और नालियों में कीटनाशक दवा का छिड़काव किया जा रहा है। अपने घर के आसपास जलभराव न होने दें।',
    descriptionEn: 'Regular fogging and anti-larval chemical spraying in drains is being conducted across all 7 wards by the Panchayat to prevent seasonal vector-borne diseases (malaria/dengue). Please avoid water stagnation near your homes.',
    category: 'स्वच्छता अभियान',
    categoryHi: 'स्वच्छता अभियान',
    categoryEn: 'Sanitation',
    isImportant: false,
    isActive: true
  },
  {
    title: 'वार्षिक विकास योजनाओं हेतु विशेष ग्राम सभा बैठक',
    titleHi: 'वार्षिक विकास योजनाओं हेतु विशेष ग्राम सभा बैठक',
    titleEn: 'Special Gram Sabha Meeting for Annual Development Plans',
    description: 'आगामी वित्तीय वर्ष के विकास कार्यों एवं नरेगा कार्ययोजना के अनुमोदन हेतु पंचायत भवन में विशेष ग्राम सभा आयोजित की जाएगी। समस्त ग्रामवासी अपनी सहभागिता सुनिश्चित करें।',
    descriptionHi: 'आगामी वित्तीय वर्ष के विकास कार्यों एवं नरेगा कार्ययोजना के अनुमोदन हेतु पंचायत भवन में विशेष ग्राम सभा आयोजित की जाएगी। समस्त ग्रामवासी अपनी सहभागिता सुनिश्चित करें।',
    descriptionEn: 'A special Gram Sabha will be held at Panchayat Bhawan for approval of next financial year development works and NREGA action plan. All villagers are requested to ensure their participation.',
    category: 'ग्राम सभा',
    categoryHi: 'ग्राम सभा',
    categoryEn: 'Gram Sabha',
    isImportant: true,
    isActive: true
  },
  {
    title: 'निःशुल्क स्वास्थ्य जांच एवं दवा वितरण शिविर',
    titleHi: 'निःशुल्क स्वास्थ्य जांच एवं दवा वितरण शिविर',
    titleEn: 'Free Health Checkup and Medicine Distribution Camp',
    description: 'ग्राम पंचायत भवन में आगामी रविवार को सुबह 9:00 बजे से दोपहर 3:00 बजे तक निःशुल्क स्वास्थ्य जांच शिविर का आयोजन किया जाएगा। सभी ग्रामवासी लाभ उठाएं।',
    descriptionHi: 'ग्राम पंचायत भवन में आगामी रविवार को सुबह 9:00 बजे से दोपहर 3:00 बजे तक निःशुल्क स्वास्थ्य जांच शिविर का आयोजन किया जाएगा। सभी ग्रामवासी लाभ उठाएं।',
    descriptionEn: 'A free health checkup and medicine camp will be organized at the Panchayat Bhawan this Sunday from 9:00 AM to 3:00 PM. All villagers are welcome to benefit.',
    category: 'स्वास्थ्य / शिविर',
    categoryHi: 'स्वास्थ्य / शिविर',
    categoryEn: 'Health & Camp',
    isImportant: true,
    isActive: true
  },
  {
    title: 'मासिक सार्वजनिक राशन वितरण सूचना',
    titleHi: 'मासिक सार्वजनिक राशन वितरण सूचना',
    titleEn: 'Monthly Public Foodgrain Distribution Notice',
    description: 'सभी राशन कार्ड धारकों को सूचित किया जाता है कि चालू माह का खाद्यान्न वितरण 5 से 12 तारीख तक उचित मूल्य की दुकान पर किया जाएगा। अपना आधार कार्ड साथ लाएं।',
    descriptionHi: 'सभी राशन कार्ड धारकों को सूचित किया जाता है कि चालू माह का खाद्यान्न वितरण 5 से 12 तारीख तक उचित मूल्य की दुकान पर किया जाएगा। अपना आधार कार्ड साथ लाएं।',
    descriptionEn: 'All ration card holders are informed that monthly foodgrain distribution will take place from the 5th to the 12th at the Fair Price Shop. Please bring your Aadhaar card.',
    category: 'राशन वितरण',
    categoryHi: 'राशन वितरण',
    categoryEn: 'Ration Distribution',
    isImportant: false,
    isActive: true
  }
];

module.exports = {
  sampleDirectory,
  defaultAdmin,
  sampleNotices
};
