const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: [
      'deposit',
      'withdrawal', 
      'escrow_hold',
      'escrow_release',
      'platform_fee',
      'refund'
    ],
    required: true
  },
  amount: { type: Number, required: true },
  description: { type: String },
  hiringRequest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'HiringRequest'
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'completed'
  },
  createdAt: { type: Date, default: Date.now }
});

const walletSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  balance: { type: Number, default: 0 },
  escrowBalance: { type: Number, default: 0 },
  totalEarned: { type: Number, default: 0 },
  totalSpent: { type: Number, default: 0 },
  transactions: [transactionSchema],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Wallet ||
  mongoose.model('Wallet', walletSchema);