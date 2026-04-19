const mongoose = require('mongoose');

const editorProfileSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    unique: true 
  },
  bio: { type: String, default: '' },
  skills: [{
    type: String,
    enum: [
      'video-editing', 'photo-editing', 'thumbnail-design',
      'color-grading', 'motion-graphics', 'sound-design', 'animation'
    ]
  }],
  portfolio: [{
    title: String,
    url: String,
    type: { type: String, enum: ['image', 'video', 'link'] },
    thumbnail: String
  }],
  pricingType: { 
    type: String, 
    enum: ['hourly', 'per-project'], 
    default: 'per-project' 
  },
  price: { type: Number, default: 0 },
  currency: { type: String, default: 'USD' },
  availability: { type: Boolean, default: true },
  location: { type: String, default: '' },
  experience: { type: Number, default: 0 },
  software: [String],
  averageRating: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 },
  completedProjects: { type: Number, default: 0 },
  responseTime: { type: String, default: 'Within 24 hours' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.EditorProfile || 
  mongoose.model('EditorProfile', editorProfileSchema);