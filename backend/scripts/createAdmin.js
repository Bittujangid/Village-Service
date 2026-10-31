/**
 * createAdmin.js — One-time seed script for the GramSeva admin user.
 *
 * Usage:
 *   npm run seed:admin
 *   node scripts/createAdmin.js
 *
 * What it does:
 *   - Connects to MongoDB via MONGODB_URI in .env
 *   - Checks if an admin with username 'sarpanch' already exists
 *   - If found, ensures it has the configured email attached
 *   - If not found, creates one with a bcrypt-hashed password (12 rounds) and email
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const Admin    = require('../models/Admin');

// ── Credentials ────────────────────────────────────────────────────────────────
const ADMIN_USERNAME     = process.env.ADMIN_USERNAME || 'sarpanch';
const ADMIN_PASSWORD     = process.env.ADMIN_PASSWORD || 'Sarpanch@2026Secure';
const ADMIN_EMAIL        = process.env.ADMIN_EMAIL || 'admin@gramseva.in';
const ADMIN_SECURITY_PIN = process.env.ADMIN_SECURITY_PIN || '123456';
const ADMIN_ROLE         = 'superadmin';
// ───────────────────────────────────────────────────────────────────────────────

const createAdmin = async () => {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error('[createAdmin] MONGODB_URI is not set in .env — aborting.');
    process.exit(1);
  }

  try {
    console.log('[createAdmin] Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('[createAdmin] Connected to MongoDB.');

    const targetUsername = ADMIN_USERNAME.toLowerCase();
    const targetEmail    = ADMIN_EMAIL.toLowerCase().trim();

    // Hash PIN with 10 salt rounds
    const pinSalt   = await bcrypt.genSalt(10);
    const hashedPin = await bcrypt.hash(ADMIN_SECURITY_PIN, pinSalt);

    // Idempotency check
    const existing = await Admin.findOne({ username: targetUsername });
    if (existing) {
      const updates = {};
      if (!existing.email) {
        updates.email = targetEmail;
      }
      if (!existing.securityPin) {
        updates.securityPin = hashedPin;
      }
      if (Object.keys(updates).length > 0) {
        updates.updatedAt = new Date();
        await Admin.collection.updateOne(
          { _id: existing._id },
          { $set: updates }
        );
        console.log(`[createAdmin] Admin '${targetUsername}' existed. Updated:`, Object.keys(updates));
      } else {
        console.log(`[createAdmin] Admin '${targetUsername}' already exists with email and security PIN. No changes needed.`);
      }
      return;
    }

    // Hash password with 12 salt rounds (stronger than default 10)
    const salt           = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, salt);

    // Insert directly via collection to avoid pre-save hook re-hashing the already-hashed value
    await Admin.collection.insertOne({
      username:             targetUsername,
      email:                targetEmail,
      password:             hashedPassword,
      securityPin:          hashedPin,
      loginAttempts:        0,
      lockUntil:            null,
      role:                 ADMIN_ROLE,
      resetPasswordToken:   null,
      resetPasswordExpires: null,
      createdAt:            new Date(),
      updatedAt:            new Date(),
    });

    console.log('[createAdmin] Admin user created successfully!');
    console.log(`  Username     : ${targetUsername}`);
    console.log(`  Email        : ${targetEmail}`);
    console.log(`  Role         : ${ADMIN_ROLE}`);
    console.log(`  Password     : ${ADMIN_PASSWORD}  <-- change after first login`);
    console.log(`  Security PIN : ${ADMIN_SECURITY_PIN}  <-- 6-digit master PIN for 2FA`);
  } catch (error) {
    console.error('[createAdmin] Error:', error.message);
    process.exitCode = 1;
  } finally {
    try {
      await mongoose.disconnect();
      console.log('[createAdmin] Disconnected from MongoDB.');
    } catch (_) { /* ignore */ }
    process.exit(process.exitCode || 0);
  }
};

createAdmin();
