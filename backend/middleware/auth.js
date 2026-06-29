const jwt = require('jsonwebtoken');
const User = require('../models/User');
const redis = require('../utils/redis');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'No token, access denied' });

    // ── Check token blacklist (logout) ──
    const isBlacklisted = await redis.get(`blacklist:${token}`);
    if (isBlacklisted) return res.status(401).json({ message: 'Token has been invalidated. Please login again.' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ── Check user cache ──
    const cacheKey = `user:${decoded.id}`;
    let user = await redis.get(cacheKey);

    if (!user) {
      user = await User.findById(decoded.id).select('-password');
      if (!user) return res.status(401).json({ message: 'Token invalid' });
      // Cache for 5 minutes
      await redis.set(cacheKey, JSON.stringify(user), { ex: 300 });
    } else {
      user = typeof user === 'string' ? JSON.parse(user) : user;
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