const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  sender: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  hiringRequest: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'HiringRequest' 
  },
  type: { 
    type: String, 
    enum: [
      'hire_request',
      'request_accepted',
      'request_rejected',
      'schedule_proposal',
      'schedule_accepted',
      'schedule_rejected',
      'request_completed'
    ], 
    required: true 
  },
  message: { type: String, required: true },
  scheduledDate: { type: Date, default: null },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Notification || 
  mongoose.model('Notification', notificationSchema);