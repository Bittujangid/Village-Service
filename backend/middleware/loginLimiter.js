/**
 * loginLimiter.js — Rate-limiting middleware for Admin Login
 *
 * Rules:
 *  - Maximum 5 consecutive failed login attempts.
 *  - Locks login for 15 minutes upon exceeding the limit.
 *  - Returns HTTP 429 Too Many Requests while locked.
 *  - Automatically resets attempt count on successful login.
 */

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

// In-memory store for tracking failed attempts: key -> { count: number, lockUntil: number | null, lastAttempt: number }
const attemptsStore = new Map();

// Periodic cleanup of expired entries every 30 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of attemptsStore.entries()) {
    if (record.lockUntil && now > record.lockUntil) {
      attemptsStore.delete(key);
    } else if (!record.lockUntil && now - record.lastAttempt > LOCKOUT_DURATION_MS) {
      attemptsStore.delete(key);
    }
  }
}, 30 * 60 * 1000).unref();

/**
 * Generate a unique tracking key based on request IP and username if provided
 */
const getTrackingKey = (req) => {
  const ip =
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    req.ip ||
    '127.0.0.1';

  const username = req.body?.username ? req.body.username.toString().trim().toLowerCase() : '';
  return username ? `${ip}:${username}` : ip;
};

/**
 * Middleware that runs before /api/admin/login
 * Blocks requests if the IP or username is locked
 */
const loginLimiterMiddleware = (req, res, next) => {
  const key = getTrackingKey(req);
  const record = attemptsStore.get(key);

  if (record && record.lockUntil) {
    const now = Date.now();
    if (now < record.lockUntil) {
      const remainingMinutes = Math.max(1, Math.ceil((record.lockUntil - now) / 60000));
      return res.status(429).json({
        success: false,
        message: `सुरक्षा कारणों से लॉगिन 15 मिनट के लिए लॉक कर दिया गया है। कृपया ${remainingMinutes} मिनट बाद पुनः प्रयास करें। (Too many failed login attempts. Account locked for 15 minutes.)`,
        locked: true,
        remainingMinutes,
        lockUntil: new Date(record.lockUntil).toISOString()
      });
    } else {
      // Lock has expired
      attemptsStore.delete(key);
    }
  }

  next();
};

/**
 * Record a failed attempt
 * @returns {{ count: number, isLocked: boolean, remainingAttempts: number, remainingMinutes?: number }}
 */
const recordFailedAttempt = (req) => {
  const key = getTrackingKey(req);
  const now = Date.now();
  let record = attemptsStore.get(key);

  if (!record) {
    record = { count: 0, lockUntil: null, lastAttempt: now };
    attemptsStore.set(key, record);
  }

  record.count += 1;
  record.lastAttempt = now;

  if (record.count >= MAX_FAILED_ATTEMPTS) {
    record.lockUntil = now + LOCKOUT_DURATION_MS;
    const remainingMinutes = Math.ceil(LOCKOUT_DURATION_MS / 60000);
    return {
      count: record.count,
      isLocked: true,
      remainingAttempts: 0,
      remainingMinutes,
      lockUntil: new Date(record.lockUntil).toISOString()
    };
  }

  return {
    count: record.count,
    isLocked: false,
    remainingAttempts: MAX_FAILED_ATTEMPTS - record.count
  };
};

/**
 * Reset failed attempts upon successful authentication
 */
const resetFailedAttempts = (req) => {
  const key = getTrackingKey(req);
  attemptsStore.delete(key);

  // Also clear by IP-only key if any
  const ipOnly =
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    req.ip;
  if (ipOnly) {
    attemptsStore.delete(ipOnly);
  }
};

module.exports = {
  loginLimiterMiddleware,
  recordFailedAttempt,
  resetFailedAttempts,
  MAX_FAILED_ATTEMPTS,
  LOCKOUT_DURATION_MS
};
