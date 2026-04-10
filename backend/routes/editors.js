const express = require('express');
const router = express.Router();
const EditorProfile = require('../models/Editorprofile');
const User = require('../models/user');
const Review = require('../models/Review');
const { auth, requireRole } = require('../middleware/auth');

// GET /api/editors - Browse editors with filters
router.get('/', async (req, res) => {
  try {
    const { skill, minPrice, maxPrice, minRating, search, sort } = req.query;
    let filter = {};
    if (skill) filter.skills = skill;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    if (minRating) filter.averageRating = { $gte: Number(minRating) };

    let sortOption = { createdAt: -1 };
    if (sort === 'rating') sortOption = { averageRating: -1 };
    if (sort === 'price-asc') sortOption = { price: 1 };
    if (sort === 'price-desc') sortOption = { price: -1 };

    let profiles = await EditorProfile.find(filter)
      .populate('user', 'name email avatar')
      .sort(sortOption);

    if (search) {
      const s = search.toLowerCase();
      profiles = profiles.filter(p =>
        p.user.name.toLowerCase().includes(s) ||
        p.bio.toLowerCase().includes(s) ||
        p.skills.some(sk => sk.includes(s))
      );
    }

    res.json(profiles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/editors/:id - Get single editor profile
router.get('/:id', async (req, res) => {
  try {
    const profile = await EditorProfile.findOne({ user: req.params.id })
      .populate('user', 'name email avatar createdAt');
    if (!profile) return res.status(404).json({ message: 'Editor not found' });

    const reviews = await Review.find({ editor: req.params.id })
      .populate('client', 'name avatar')
      .sort({ createdAt: -1 });

    res.json({ profile, reviews });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/editors/profile - Update editor profile
router.put('/profile', auth, requireRole('editor'), async (req, res) => {
  try {
    const updates = req.body;
    const profile = await EditorProfile.findOneAndUpdate(
      { user: req.user._id },
      updates,
      { new: true, runValidators: true }
    ).populate('user', 'name email avatar');

    if (!profile) return res.status(404).json({ message: 'Profile not found' });
    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/editors/profile/me - Get own profile
router.get('/profile/me', auth, requireRole('editor'), async (req, res) => {
  try {
    const profile = await EditorProfile.findOne({ user: req.user._id })
      .populate('user', 'name email avatar');
    if (!profile) return res.status(404).json({ message: 'Profile not found' });
    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// POST /api/editors/portfolio/add
router.post('/portfolio/add', auth, requireRole('editor'), async (req, res) => {
  try {
    const { title, url, type, thumbnail } = req.body;
    const profile = await EditorProfile.findOneAndUpdate(
      { user: req.user._id },
      { $push: { portfolio: { title, url, type, thumbnail } } },
      { new: true }
    ).populate('user', 'name email avatar');
    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/editors/portfolio/:index
router.delete('/portfolio/:index', auth, requireRole('editor'), async (req, res) => {
  try {
    const profile = await EditorProfile.findOne({ user: req.user._id });
    profile.portfolio.splice(req.params.index, 1);
    await profile.save();
    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
module.exports = router;
