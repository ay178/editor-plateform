const mongoose = require('mongoose');

// An editor's payout bank account. One per user.
// The account number is stored ENCRYPTED (see utils/secretBox.js); only the last
// 4 digits are kept in plain text for display.
const bankAccountSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  accountHolderName: { type: String, required: true, trim: true },
  bankName: { type: String, required: true, trim: true },
  accountNumberEncrypted: { type: String, required: true },
  accountLast4: { type: String, required: true },
  ifsc: { type: String, required: true, uppercase: true, trim: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.BankAccount ||
  mongoose.model('BankAccount', bankAccountSchema);
