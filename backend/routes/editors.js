const express = require('express');
const router = express.Router();
const EditorProfile = require('../models/EditorProfile');
const { auth, requireRole } = require('../middleware/auth');
const redis = require('../utils/redis');

// GET /api/editors — Browse editors with Redis cache
router.get('/', async (req, res) => {
  try {
    const { skill, minPrice, maxPrice, minRating, search, sort } = req.query;

    // Cache key based on query params
    const cacheKey = `editors:${JSON.stringify(req.query)}`;

    // Check cache first
    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        return res.json(typeof cached === 'string' ? JSON.parse(cached) : cached);
      }
    } catch (redisErr) {
      console.error('Redis get error:', redisErr.message);
    }

    // Build query
    let query = {};
    if (skill) query.skills = skill;
    if (minRating) query.averageRating = { $gte: parseFloat(minRating) };
    if (minPrice) query.price = { ...query.price, $gte: parseFloat(minPrice) };
    if (maxPrice) query.price = { ...query.price, $lte: parseFloat(maxPrice) };

    let editors = await EditorProfile.find(query)
      .populate('user', 'name email avatar')
      .lean();
editors = editors.filter(e => e.user);
    // Text search
    if (search) {
      const s = search.toLowerCase();
      editors = editors.filter(e =>
        e.user?.name?.toLowerCase().includes(s) ||
        e.bio?.toLowerCase().includes(s) ||
        e.skills?.some(sk => sk.includes(s))
      );
    }

    // Sort
   if (sort === 'rating' || !sort) {
  // Rated editors (jinke reviews hain) — rating ke hisaab se sort
  const rated = editors.filter(e => e.totalReviews > 0);
  rated.sort((a, b) => b.averageRating - a.averageRating);

  // Naye editors (koi review nahi) — har baar shuffle taaki different editors rotate ho top pe
  const newOnes = editors.filter(e => e.totalReviews === 0);
  for (let i = newOnes.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newOnes[i], newOnes[j]] = [newOnes[j], newOnes[i]];
  }

  // Interleave — har 4 rated editors ke baad 1 naya editor dikhao
  const merged = [];
  let newIdx = 0;
  rated.forEach((editor, i) => {
    merged.push(editor);
    if ((i + 1) % 4 === 0 && newIdx < newOnes.length) {
      merged.push(newOnes[newIdx++]);
    }
  });
  while (newIdx < newOnes.length) merged.push(newOnes[newIdx++]);

  editors = merged;
} else if (sort === 'price-asc') {
  editors.sort((a, b) => a.price - b.price);
} else if (sort === 'price-desc') {
  editors.sort((a, b) => b.price - a.price);
}
    // Cache for 30 seconds only — keeps data fresh for new signups
    try {
      await redis.set(cacheKey, JSON.stringify(editors), { ex: 30 });
    } catch (redisErr) {
      console.error('Redis set error:', redisErr.message);
    }

    res.json(editors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/editors/profile/me
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

// GET /api/editors/:userId
router.get('/:userId', async (req, res) => {
  try {
    const cacheKey = `editor:${req.params.userId}`;

    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        return res.json(typeof cached === 'string' ? JSON.parse(cached) : cached);
      }
    } catch (redisErr) {
      console.error('Redis get error:', redisErr.message);
    }

    const profile = await EditorProfile.findOne({ user: req.params.userId })
      .populate('user', 'name email avatar');
    if (!profile) return res.status(404).json({ message: 'Editor not found' });

    try {
      await redis.set(cacheKey, JSON.stringify(profile), { ex: 60 });
    } catch (redisErr) {
      console.error('Redis set error:', redisErr.message);
    }

    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/editors/profile
router.put('/profile', auth, requireRole('editor'), async (req, res) => {
  try {
    const profile = await EditorProfile.findOneAndUpdate(
      { user: req.user._id },
      { $set: req.body },
      { new: true }
    ).populate('user', 'name email avatar');

    // Invalidate this editor's specific cache
    try {
      await redis.del(`editor:${req.user._id}`);
    } catch (redisErr) {
      console.error('Redis del error:', redisErr.message);
    }

    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;