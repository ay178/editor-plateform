const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: {
    type: String,
    required: function () { return this.authProvider === 'local'; }
  },
  role: { type: String, enum: ['client', 'editor'], required: true },
  avatar: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  isVerified: { type: Boolean, default: false },
  verificationToken: { type: String },
  verificationTokenExpiry: { type: Date },
  resetPasswordToken: { type: String },
  resetPasswordExpiry: { type: Date },
  authProvider: { type: String, enum: ['local', 'google'], default: 'local' },
  googleId: { type: String, default: null },
  subscription: {
    plan: { type: String, enum: ['free', 'pro_client', 'pro_editor'], default: 'free' },
    validUntil: { type: Date, default: null },
    razorpaySubscriptionId: { type: String, default: null }
  },
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (password) {
  if (!this.password) return false; // Google-only accounts have no password
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.models.User ||
  mongoose.model('User', userSchema);