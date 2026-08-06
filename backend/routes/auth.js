const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const EditorProfile = require('../models/EditorProfile');
const { auth } = require('../middleware/auth');
const { sendOTPEmail, sendPasswordResetEmail } = require('../utils/mailer');
const redis = require('../utils/redis');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateOTP = () => String(Math.floor(100000 + Math.random() * 900000));

const validatePassword = (password) => {
  if (password.length < 8) return 'Password must be at least 8 characters';
  if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter';
  if (!/[0-9]/.test(password)) return 'Password must contain at least one number';
  if (!/[!@#$%^&*]/.test(password)) return 'Password must contain at least one special character (!@#$%^&*)';
  return null;
};

// ────────────────────────────────────────────────────────────
// POST /api/signup — creates the (unverified) account and emails a 6-digit OTP
// ────────────────────────────────────────────────────────────
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

    const pwError = validatePassword(password);
    if (pwError) return res.status(400).json({ message: pwError });

    let user = await User.findOne({ email });

    if (user && user.isVerified) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    if (user && !user.isVerified) {
      // They started signup before but never verified — refresh their details + resend OTP
      user.name = name;
      user.password = password;
      user.role = role;
      await user.save();
    } else {
      user = await User.create({ name, email, password, role, authProvider: 'local' });
      if (role === 'editor') {
        await EditorProfile.create({ user: user._id });
      }
    }

    const otp = generateOTP();
    await redis.set(`otp:${email}`, otp, { ex: 600 }); // 10 minutes

    sendOTPEmail(email, name, otp)
      .then(() => console.log('OTP email sent to:', email))
      .catch(err => console.error('OTP email error:', err.message));

    return res.status(201).json({
      message: 'Account created! Enter the code we emailed you to verify.',
      email
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ────────────────────────────────────────────────────────────
// POST /api/verify-otp — checks the code, verifies the account, logs them in
// ────────────────────────────────────────────────────────────
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: 'Email and code are required' });

    const stored = await redis.get(`otp:${email}`);
    if (!stored) return res.status(400).json({ message: 'Code expired. Please request a new one.' });

    if (String(stored) !== String(otp)) {
      return res.status(400).json({ message: 'Incorrect code. Please try again.' });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'Account not found' });

    user.isVerified = true;
    await user.save();
    await redis.del(`otp:${email}`);

    const token = generateToken(user._id);
    res.json({
      message: 'Email verified!',
      token,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar }
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ────────────────────────────────────────────────────────────
// POST /api/resend-otp
// ────────────────────────────────────────────────────────────
router.post('/resend-otp', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'Account not found' });
    if (user.isVerified) return res.status(400).json({ message: 'Account already verified' });

    const otp = generateOTP();
    await redis.set(`otp:${email}`, otp, { ex: 600 });

    sendOTPEmail(email, user.name, otp)
      .then(() => console.log('OTP resent to:', email))
      .catch(err => console.error('OTP resend error:', err.message));

    res.json({ message: 'A new code has been sent to your email.' });

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
      return res.status(401).json({ message: 'Please verify your email first.', needsVerification: true, email: user.email });

    const token = generateToken(user._id);
    res.json({
      token,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar }
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ────────────────────────────────────────────────────────────
// POST /api/google-auth — Google Sign-In / Sign-Up (unaffected by OTP change —
// Google-verified emails skip OTP entirely since Google already confirmed them)
// ────────────────────────────────────────────────────────────
router.post('/google-auth', async (req, res) => {
  try {
    const { credential, role } = req.body;
    if (!credential) return res.status(400).json({ message: 'Missing Google credential' });

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { email, name, picture, sub: googleId } = payload;

    if (!email) return res.status(400).json({ message: 'Google account has no email' });

    let user = await User.findOne({ email });

    if (user) {
      if (!user.googleId) {
        user.googleId = googleId;
        user.authProvider = user.authProvider || 'google';
        if (!user.avatar) user.avatar = picture || '';
        if (!user.isVerified) user.isVerified = true;
        await user.save();
      }
    } else {
      if (!role || !['client', 'editor'].includes(role)) {
        return res.status(404).json({ message: 'No account found with this Google email. Please sign up first.' });
      }

      user = await User.create({
        name, email, role,
        authProvider: 'google',
        googleId,
        avatar: picture || '',
        isVerified: true,
      });

      if (role === 'editor') {
        await EditorProfile.create({ user: user._id });
      }
    }

    const token = generateToken(user._id);
    res.json({
      token,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar }
    });

  } catch (err) {
    console.error('Google auth error:', err.message);
    res.status(500).json({ message: 'Google sign-in failed. Please try again.' });
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

// POST /api/forgot-password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const user = await User.findOne({ email });
    const genericMessage = 'If an account exists with that email, a password reset link has been sent.';

    if (!user) return res.json({ message: genericMessage });

    if (user.authProvider === 'google' && !user.password) {
      return res.json({ message: 'This account signs in with Google. Please use "Continue with Google" instead.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiry = Date.now() + 60 * 60 * 1000;
    await user.save();

    sendPasswordResetEmail(email, user.name, resetToken)
      .then(() => console.log('Password reset email sent to:', email))
      .catch(err => console.error('Password reset email error:', err.message));

    res.json({ message: genericMessage });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/reset-password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password)
      return res.status(400).json({ message: 'Token and new password are required' });

    const pwError = validatePassword(password);
    if (pwError) return res.status(400).json({ message: pwError });

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiry: { $gt: Date.now() }
    });

    if (!user)
      return res.status(400).json({ message: 'Invalid or expired reset link. Please request a new one.' });

    user.password = password;
    user.authProvider = 'local';
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiry = undefined;
    await user.save();

    try { await redis.del(`user:${user._id}`); } catch (e) { console.error('Redis cleanup error:', e.message); }

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