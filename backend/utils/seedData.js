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
    title: 'निःशुल्क स्वास्थ्य जांच एवं दवा वितरण शिविर',
    description: 'ग्राम पंचायत भवन में आगामी रविवार को सुबह 9:00 बजे से दोपहर 3:00 बजे तक निःशुल्क स्वास्थ्य जांच शिविर का आयोजन किया जाएगा। सभी ग्रामवासी लाभ उठाएं।',
    category: 'स्वास्थ्य / शिविर',
    isActive: true
  },
  {
    title: 'मासिक सार्वजनिक राशन वितरण',
    description: 'सभी राशन कार्ड धारकों को सूचित किया जाता है कि चालू माह का खाद्यान्न वितरण 5 से 12 तारीख तक उचित मूल्य की दुकान पर किया जाएगा। अपना आधार कार्ड साथ लाएं।',
    category: 'राशन वितरण',
    isActive: true
  },
  {
    title: 'विशेष ग्राम सभा बैठक आमंत्रण',
    description: 'गांव में सीसी रोड व नाली निर्माण कार्य की समीक्षा तथा नए विकास प्रस्तावों पर चर्चा हेतु ग्राम सभा की बैठक शुक्रवार सुबह 11:00 बजे पंचायत सचिवालय में होगी।',
    category: 'ग्राम सभा',
    isActive: true
  }
];

module.exports = {
  sampleDirectory,
  defaultAdmin,
  sampleNotices
};
