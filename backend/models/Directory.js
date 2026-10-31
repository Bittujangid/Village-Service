const mongoose = require('mongoose');

const directorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'नाम आवश्यक है (Name is required)'],
      trim: true
    },
    role: {
      type: String,
      required: [true, 'पद/भूमिका आवश्यक है (Role is required)'],
      trim: true
    },
    phone: {
      type: String,
      required: [true, 'संपर्क नंबर आवश्यक है (Phone number is required)'],
      trim: true
    },
    department: {
      type: String,
      trim: true,
      default: 'ग्राम पंचायत'
    },
    priority: {
      type: Number,
      default: 99,
      index: true
    }
  },
  {
    timestamps: true
  }
);

const Directory = mongoose.model('Directory', directorySchema);

module.exports = Directory;
