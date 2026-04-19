const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const HiringRequest = require('../models/HiringRequest');
const EditorProfile = require('../models/EditorProfile');
const { auth, requireRole } = require('../middleware/auth');

// POST /api/review - Client leaves a review
router.post('/', auth, requireRole('client'), async (req, res) => {
  try {
    const { editorId, hiringRequestId, rating, comment } = req.body;

    const request = await HiringRequest.findById(hiringRequestId);
    if (!request || request.status !== 'completed')
      return res.status(400).json({ message: 'Can only review completed projects' });

    if (request.client.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not your project' });

    const existing = await Review.findOne({ hiringRequest: hiringRequestId });
    if (existing) return res.status(400).json({ message: 'Already reviewed this project' });

    const review = await Review.create({
      client: req.user._id,
      editor: editorId,
      hiringRequest: hiringRequestId,
      rating,
      comment
    });

    // Update editor's average rating
    const allReviews = await Review.find({ editor: editorId });
    const avg = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    await EditorProfile.findOneAndUpdate(
      { user: editorId },
      { averageRating: Math.round(avg * 10) / 10, totalReviews: allReviews.length }
    );

    await review.populate('client', 'name avatar');
    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/review/editor/:id
router.get('/editor/:id', async (req, res) => {
  try {
    const reviews = await Review.find({ editor: req.params.id })
      .populate('client', 'name avatar')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
