const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  editor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  hiringRequest: { type: mongoose.Schema.Types.ObjectId, ref: 'HiringRequest', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Review || 
  mongoose.model('Review', reviewSchema);
