const mongoose = require('mongoose');

// Local record of every Cashfree order we create. The server decides the amount
// and what the payment is for when the order is created; after payment we trust
// this record (plus Cashfree's own order status), never anything the browser sends.
const cashfreeOrderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },   // our order_id, sent to Cashfree
  cfOrderId: { type: String },                               // Cashfree's cf_order_id
  paymentSessionId: { type: String },                        // lets us re-open the same checkout instead of creating a duplicate
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  kind: { type: String, enum: ['hire_advance', 'hire_final', 'subscription'], required: true },
  hiringRequest: { type: mongoose.Schema.Types.ObjectId, ref: 'HiringRequest' },
  plan: { type: String },
  amount: { type: Number, required: true },                  // rupees
  currency: { type: String, default: 'INR' },
  // created -> processing -> fulfilled | failed | error
  status: {
    type: String,
    enum: ['created', 'processing', 'fulfilled', 'failed', 'error'],
    default: 'created'
  },
  result: { type: mongoose.Schema.Types.Mixed },             // response payload replayed on repeat verify
  error: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

cashfreeOrderSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.models.CashfreeOrder ||
  mongoose.model('CashfreeOrder', cashfreeOrderSchema);
