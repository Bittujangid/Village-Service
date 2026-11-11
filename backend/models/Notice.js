const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema(
  {
    // Primary (Hindi) fields — required, used as fallback
    title: {
      type: String,
      required: [true, 'सूचना का शीर्षक आवश्यक है (Title is required)'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'सूचना का विवरण आवश्यक है (Description is required)'],
      trim: true
    },
    category: {
      type: String,
      default: 'सामान्य सूचना',
      trim: true
    },

    // Bilingual fields — Hindi
    titleHi: { type: String, trim: true, default: '' },
    descriptionHi: { type: String, trim: true, default: '' },
    categoryHi: { type: String, trim: true, default: '' },

    // Bilingual fields — English
    titleEn: { type: String, trim: true, default: '' },
    descriptionEn: { type: String, trim: true, default: '' },
    categoryEn: { type: String, trim: true, default: '' },

    isImportant: {
      type: Boolean,
      default: false
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

const Notice = mongoose.model('Notice', noticeSchema);

module.exports = Notice;
