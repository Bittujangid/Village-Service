require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const Directory = require('../models/Directory');
const { sampleDirectory } = require('../utils/seedData');

/**
 * Script to seed sample village directory records if empty
 * Run via: npm run seed:directory
 */
const seedDirectory = async () => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/gramseva';

  try {
    console.log('[Script: seedDirectory] Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('[Script: seedDirectory] Connected to MongoDB.');

    const count = await Directory.countDocuments();

    if (count > 0) {
      console.log(`[Script: seedDirectory] Directory collection already has ${count} records. Skipping seed.`);
    } else {
      console.log(`[Script: seedDirectory] Seeding ${sampleDirectory.length} directory contacts...`);
      const inserted = await Directory.insertMany(sampleDirectory);
      console.log(`[Script: seedDirectory] Successfully inserted ${inserted.length} directory records:`);
      inserted.forEach(entry => {
        console.log(`  - [Priority ${entry.priority}] ${entry.name} (${entry.role}) - Phone: ${entry.phone}`);
      });
    }
  } catch (error) {
    console.error('[Script: seedDirectory] Error seeding directory:', error.message);
    process.exitCode = 1;
  } finally {
    try {
      await mongoose.disconnect();
      console.log('[Script: seedDirectory] Disconnected from MongoDB.');
    } catch (e) {
      // ignore
    }
    process.exit(process.exitCode || 0);
  }
};

seedDirectory();
