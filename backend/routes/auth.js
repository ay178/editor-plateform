const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const EditorProfile = require('../models/EditorProfile');
const { auth } = require('../middleware/auth');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../utils/mailer');
const redis = require('../utils/redis');

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

    // Send async — don't block the signup response on email delivery
    sendVerificationEmail(email, name, verifyToken)
      .then(() => console.log('Verification email sent to:', email))
      .catch(err => console.error('Verification email error:', err.message));

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

// POST /api/logout
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

// ────────────────────────────────────────────────────────────
// POST /api/forgot-password — request a reset link
// ────────────────────────────────────────────────────────────
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const user = await User.findOne({ email });

    // Always return the same message whether or not the email exists —
    // prevents attackers from using this endpoint to discover registered emails.
    const genericMessage = 'If an account exists with that email, a password reset link has been sent.';

    if (!user) {
      return res.json({ message: genericMessage });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiry = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save();

    sendPasswordResetEmail(email, user.name, resetToken)
      .then(() => console.log('Password reset email sent to:', email))
      .catch(err => console.error('Password reset email error:', err.message));

    res.json({ message: genericMessage });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ────────────────────────────────────────────────────────────
// POST /api/reset-password — set a new password using the token
// ────────────────────────────────────────────────────────────
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password)
      return res.status(400).json({ message: 'Token and new password are required' });

    if (password.length < 8)
      return res.status(400).json({ message: 'Password must be at least 8 characters' });

    if (!/[A-Z]/.test(password))
      return res.status(400).json({ message: 'Password must contain at least one uppercase letter' });

    if (!/[0-9]/.test(password))
      return res.status(400).json({ message: 'Password must contain at least one number' });

    if (!/[!@#$%^&*]/.test(password))
      return res.status(400).json({ message: 'Password must contain at least one special character (!@#$%^&*)' });

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiry: { $gt: Date.now() }
    });

    if (!user)
      return res.status(400).json({ message: 'Invalid or expired reset link. Please request a new one.' });

    user.password = password; // pre-save hook in User.js re-hashes this automatically
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiry = undefined;
    await user.save();

    // Invalidate any existing sessions for this user for safety
    try {
      await redis.del(`user:${user._id}`);
    } catch (e) {
      console.error('Redis cleanup error:', e.message);
    }

    res.json({ message: 'Password reset successfully! You can now login with your new password.' });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/me
router.get('/me', auth, async (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;