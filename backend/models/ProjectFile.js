const mongoose = require('mongoose');

const projectFileSchema = new mongoose.Schema({
  hiringRequest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'HiringRequest',
    required: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  role: {
    type: String,
    enum: ['client', 'editor'],
    required: true
  },
  files: [{
    name: { type: String, required: true },
    url: { type: String, required: true },
    publicId: { type: String },
    type: { type: String, enum: ['video', 'image', 'document'], required: true },
    size: { type: Number },
    uploadedAt: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.ProjectFile ||
  mongoose.model('ProjectFile', projectFileSchema);
