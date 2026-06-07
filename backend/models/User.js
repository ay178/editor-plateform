const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['client', 'editor'], required: true },
  avatar: { type: String, default: '' },
createdAt: { type: Date, default: Date.now },
  isVerified: { type: Boolean, default: false },
  verificationToken: { type: String },
  verificationTokenExpiry: { type: Date },
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.models.User || 
  mongoose.model('User', userSchema);
