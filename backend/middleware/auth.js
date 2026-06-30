const jwt = require('jsonwebtoken');
const User = require('../models/User');
const redis = require('../utils/redis');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'No token, access denied' });

    // ── Check token blacklist (logout) ──
    let isBlacklisted = null;
    try {
      isBlacklisted = await redis.get(`blacklist:${token}`);
    } catch (redisErr) {
      console.error('Redis blacklist check error:', redisErr.message);
    }
    if (isBlacklisted) return res.status(401).json({ message: 'Token has been invalidated. Please login again.' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ── Check user cache ──
    const cacheKey = `user:${decoded.id}`;
    let user = null;

    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        user = typeof cached === 'string' ? JSON.parse(cached) : cached;
      }
    } catch (redisErr) {
      console.error('Redis get error:', redisErr.message);
      user = null;
    }

    if (!user) {
      user = await User.findById(decoded.id).select('-password');
      if (!user) return res.status(401).json({ message: 'Token invalid' });

      try {
        await redis.set(cacheKey, JSON.stringify(user), { ex: 300 });
      } catch (redisErr) {
        console.error('Redis set error:', redisErr.message);
      }
    }

    req.user = user;
    req.token = token;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token invalid' });
  }
};

const requireRole = (role) => (req, res, next) => {
  if (req.user.role !== role) {
    return res.status(403).json({ message: `Access denied. ${role} role required.` });
  }
  next();
};

module.exports = { auth, requireRole };