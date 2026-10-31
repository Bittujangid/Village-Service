const crypto = require('crypto');

/**
 * Generates a tracking ID in the format 'GR-' followed by 4 uppercase alphanumeric characters.
 * Example: 'GR-7K9A', 'GR-B4F2'
 * 
 * @returns {string} Tracking ID string
 */
const generateTrackingId = () => {
  const characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let randomPart = '';
  const randomBytes = crypto.randomBytes(4);

  for (let i = 0; i < 4; i++) {
    randomPart += characters[randomBytes[i] % characters.length];
  }

  return `GR-${randomPart}`;
};

module.exports = generateTrackingId;
