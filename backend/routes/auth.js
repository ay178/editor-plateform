const express = require('express');
const redis = require('../utils/redis');
const router = express.Router();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const EditorProfile = require('../models/EditorProfile');
const { auth } = require('../middleware/auth');
const { sendVerificationEmail } = require('../utils/mailer');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// POST /api/signup
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role)
      return res.status(400).json({ message: 'All fields are required' });

    if (name.trim().length < 2)
      return res.status(400).json({ message: 'Name must be at least 2 characters' });

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email))
      return res.status(400).json({ message: 'Invalid email address' });

    if (password.length < 8)
      return res.status(400).json({ message: 'Password must be at least 8 characters' });

    if (!/[A-Z]/.test(password))
      return res.status(400).json({ message: 'Password must contain at least one uppercase letter' });

    if (!/[0-9]/.test(password))
      return res.status(400).json({ message: 'Password must contain at least one number' });

    if (!/[!@#$%^&*]/.test(password))
      return res.status(400).json({ message: 'Password must contain at least one special character (!@#$%^&*)' });

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already registered' });

    const user = await User.create({ name, email, password, role });

    if (role === 'editor') {
      await EditorProfile.create({ user: user._id });
    }

    // Email Verification
    const verifyToken = crypto.randomBytes(32).toString('hex');
    user.verificationToken = verifyToken;
    user.verificationTokenExpiry = Date.now() + 24 * 60 * 60 * 1000;
    await user.save();
    
sendVerificationEmail(email, name, verifyToken)
  .then(() => console.log('Email sent to:', email))
  .catch(err => console.error('Email error:', err.message));

return res.status(201).json({
  message: 'Account created! Please check your email to verify your account.'
});

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await user.comparePassword(password)))
      return res.status(400).json({ message: 'Invalid email or password' });

    if (!user.isVerified)
      return res.status(401).json({ message: 'Please verify your email first. Check your inbox!' });

    const token = generateToken(user._id);
    res.json({
      token,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar }
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/verify-email
router.get('/verify-email', async (req, res) => {
  try {
    const { token } = req.query;
    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpiry: { $gt: Date.now() }
    });

    if (!user)
      return res.status(400).json({ message: 'Invalid or expired verification link' });

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiry = undefined;
    await user.save();

    res.json({ message: 'Email verified successfully! You can now login.' });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/me
router.get('/me', auth, async (req, res) => {
  res.json({ user: req.user });
});
router.post('/logout', auth, async (req, res) => {
  try {
    const token = req.token;
    await redis.set(`blacklist:${token}`, '1', { ex: 7 * 24 * 60 * 60 });
    await redis.del(`user:${req.user._id}`);
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
