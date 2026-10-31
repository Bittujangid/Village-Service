const mongoose = require('mongoose');
const generateTrackingId = require('../utils/generateTrackingId');

const complaintSchema = new mongoose.Schema(
  {
    trackingId: {
      type: String,
      unique: true,
      index: true,
      uppercase: true,
      trim: true
    },
    citizenName: {
      type: String,
      required: [true, 'नागरिक का नाम आवश्यक है (Citizen name is required)'],
      trim: true
    },
    phone: {
      type: String,
      required: [true, 'मोबाइल नंबर आवश्यक है (Mobile number is required)'],
      trim: true,
      validate: {
        validator: function (v) {
          // Indian 10-digit mobile number starting with 6, 7, 8, or 9
          return /^[6-9]\d{9}$/.test(v);
        },
        message: props => `${props.value} मान्य 10-अंकीय भारतीय मोबाइल नंबर नहीं है!`
      }
    },
    wardNumber: {
      type: Number,
      required: [true, 'वार्ड नंबर आवश्यक है (Ward number is required)'],
      min: [1, 'वार्ड नंबर कम से कम 1 होना चाहिए (Ward number must be at least 1)'],
      max: [20, 'वार्ड नंबर अधिकतम 20 होना चाहिए (Ward number cannot exceed 20)']
    },
    category: {
      type: String,
      required: [true, 'शिकायत की श्रेणी आवश्यक है (Category is required)'],
      enum: {
        values: [
          'पानी / हैंडपंप',
          'बिजली / स्ट्रीट लाइट',
          'सड़क / नाली',
          'सफाई व्यवस्था',
          'अन्य'
        ],
        message: '{VALUE} मान्य श्रेणी नहीं है'
      }
    },
    description: {
      type: String,
      required: [true, 'शिकायत का विवरण आवश्यक है (Description is required)'],
      minlength: [10, 'विवरण कम से कम 10 अक्षरों का होना चाहिए (Description must be at least 10 characters)']
    },
    imageUrl: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: {
        values: ['Pending', 'In Progress', 'Resolved'],
        message: '{VALUE} मान्य स्थिति नहीं है'
      },
      default: 'Pending'
    },
    adminRemarks: {
      type: String,
      default: 'शिकायत दर्ज कर ली गई है।'
    }
  },
  {
    timestamps: true
  }
);

// Auto-generate trackingId before saving if not present
complaintSchema.pre('save', async function (next) {
  try {
    if (!this.trackingId) {
      let isUnique = false;
      let newId = '';
      while (!isUnique) {
        newId = generateTrackingId();
        const existing = await this.constructor.findOne({ trackingId: newId });
        if (!existing) {
          isUnique = true;
        }
      }
      this.trackingId = newId;
    }
    if (typeof next === 'function') {
      next();
    }
  } catch (err) {
    if (typeof next === 'function') {
      next(err);
    } else {
      throw err;
    }
  }
});

const Complaint = mongoose.model('Complaint', complaintSchema);

module.exports = Complaint;
