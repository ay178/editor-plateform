const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', required: true
  },
  editor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', required: true
  },
  hiringRequest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'HiringRequest', required: true
  },
  totalAmount: { type: Number, required: true },
  advanceAmount: { type: Number, required: true },
  platformFee: { type: Number, required: true },
  editorAdvance: { type: Number, required: true },
  remainingAmount: { type: Number, required: true },
  status: {
    type: String,
    enum: [
      'pending',
      'advance_paid',
      'in_escrow',
      'completed',
      'refunded',
      'disputed'
    ],
    default: 'pending'
  },
  // unique + sparse: the same Cashfree order can never create two Payment records
  cashfreeOrderId: { type: String, unique: true, sparse: true },
  // legacy: payments taken through Razorpay before the Cashfree migration
  razorpayOrderId: { type: String },
  razorpayPaymentId: { type: String },
  advancePaidAt: { type: Date },
  completedAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Payment ||
  mongoose.model('Payment', paymentSchema);