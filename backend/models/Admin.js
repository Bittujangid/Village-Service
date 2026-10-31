const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'उपयोगकर्ता नाम आवश्यक है (Username is required)'],
      unique: true,
      trim: true,
      lowercase: true
    },
    email: {
      type: String,
      required: [true, 'ईमेल पता आवश्यक है (Email is required)'],
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: [true, 'पासवर्ड आवश्यक है (Password is required)'],
      minlength: [6, 'पासवर्ड कम से कम 6 अक्षरों का होना चाहिए']
    },
    role: {
      type: String,
      default: 'sarpanch',
      enum: ['sarpanch', 'secretary', 'admin', 'superadmin']
    },
    resetPasswordToken: {
      type: String,
      default: null
    },
    resetPasswordExpires: {
      type: Date,
      default: null
    },
    securityPin: {
      type: String,
      default: null
    },
    loginAttempts: {
      type: Number,
      default: 0
    },
    lockUntil: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Hash password and securityPin before saving if modified
adminSchema.pre('save', async function (next) {
  try {
    if (this.isModified('password') && this.password) {
      if (!this.password.startsWith('$2')) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
      }
    }

    if (this.isModified('securityPin') && this.securityPin) {
      if (!this.securityPin.startsWith('$2')) {
        const salt = await bcrypt.genSalt(10);
        this.securityPin = await bcrypt.hash(this.securityPin.toString().trim(), salt);
      }
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

// Instance method to check if account is currently locked
adminSchema.methods.isLocked = function () {
  return Boolean(this.lockUntil && this.lockUntil > new Date());
};

// Instance method to compare password during login
adminSchema.methods.comparePassword = async function (candidatePassword) {
  if (!candidatePassword || !this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

// Instance method to compare 6-digit security PIN during 2FA
adminSchema.methods.comparePin = async function (candidatePin) {
  if (!candidatePin) return false;
  const pinStr = candidatePin.toString().trim();

  // If no securityPin is set on legacy admin doc, verify against configured or default PIN
  if (!this.securityPin) {
    const defaultPin = (process.env.ADMIN_SECURITY_PIN || '123456').toString().trim();
    return pinStr === defaultPin;
  }

  // If hashed with bcrypt
  if (this.securityPin.startsWith('$2')) {
    return await bcrypt.compare(pinStr, this.securityPin);
  }

  // Plaintext match fallback
  return pinStr === this.securityPin.trim();
};

const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;
