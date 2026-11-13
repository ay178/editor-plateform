const mongoose = require('mongoose');

const hiringRequestSchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  editor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  projectTitle: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  budget: {
    type: Number
  },
  deadline: {
    type: Date
  },
  status: {
    type: String,
    enum: [
      'pending',
      'accepted',
      'rejected',
      'completed',
      'cancelled',
      'scheduled'
    ],
    default: 'pending'
  },
  skills: [String],
  scheduledDate: {
    type: Date,
    default: null
  },
  payment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment'
  },
  paymentStatus: {
    type: String,
    enum: [
      'unpaid',
      'advance_paid',
      'completed',
      'refunded'
    ],
    default: 'unpaid'
  },
  // Live project tracking — used once the editor has accepted (see routes/tracking.js)
  tracking: {
    stage: {
      type: String,
      enum: ['accepted', 'footage_received', 'rough_cut', 'fine_cut', 'color_audio', 'review', 'delivered'],
      default: 'accepted'
    },
    progress: { type: Number, min: 0, max: 100, default: 0 },
    updatedAt: { type: Date },
    updates: [{
      kind: { type: String, enum: ['system', 'update'], default: 'update' },
      stage: String,
      progress: Number,
      note: { type: String, maxlength: 500 },
      by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      createdAt: { type: Date, default: Date.now }
    }]
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

hiringRequestSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.models.HiringRequest ||
  mongoose.model('HiringRequest', hiringRequestSchema);