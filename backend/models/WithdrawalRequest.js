const mongoose = require('mongoose');

// Created every time an editor withdraws. It snapshots the bank details used at that
// moment (account number encrypted), so there is a record of exactly where to send the
// money. Status stays "pending" until the payout is made (see scripts/withdrawals.js).
const withdrawalRequestSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },               // rupees
  transactionId: { type: mongoose.Schema.Types.ObjectId }, // _id of the wallet transaction
  bank: {
    accountHolderName: String,
    bankName: String,
    accountNumberEncrypted: String,
    accountLast4: String,
    ifsc: String
  },
  status: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
  payoutReference: { type: String },                       // UTR / reference once paid
  createdAt: { type: Date, default: Date.now },
  paidAt: { type: Date }
});

module.exports = mongoose.models.WithdrawalRequest ||
  mongoose.model('WithdrawalRequest', withdrawalRequestSchema);
