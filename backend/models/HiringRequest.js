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

module.exports = mongoose.model('HiringRequest', hiringRequestSchema);