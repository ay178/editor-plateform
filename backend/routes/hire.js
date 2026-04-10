const express = require('express');
const router = express.Router();
const HiringRequest = require('../models/HiringRequest');
const EditorProfile = require('../models/Editorprofile');
const { auth, requireRole } = require('../middleware/auth');

// POST /api/hire - Client sends hire request
router.post('/', auth, requireRole('client'), async (req, res) => {
  try {
    const { editorId, projectTitle, description, budget, deadline, skills } = req.body;
    const request = await HiringRequest.create({
      client: req.user._id,
      editor: editorId,
      projectTitle,
      description,
      budget,
      deadline,
      skills
    });
    await request.populate(['client', 'editor'], 'name email avatar');
    res.status(201).json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/hire - Get all requests (for current user)
router.get('/', auth, async (req, res) => {
  try {
    const query = req.user.role === 'client'
      ? { client: req.user._id }
      : { editor: req.user._id };

    const requests = await HiringRequest.find(query)
      .populate('client', 'name email avatar')
      .populate('editor', 'name email avatar')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/hire/:id/status - Editor accepts/rejects or client completes
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const request = await HiringRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    const isEditor = req.user._id.toString() === request.editor.toString();
    const isClient = req.user._id.toString() === request.client.toString();

    if (!isEditor && !isClient)
      return res.status(403).json({ message: 'Not authorized' });

    if (isEditor && !['accepted', 'rejected'].includes(status))
      return res.status(400).json({ message: 'Editor can only accept or reject' });

    if (isClient && status !== 'completed' && status !== 'cancelled')
      return res.status(400).json({ message: 'Client can only mark completed or cancelled' });

    request.status = status;
    await request.save();

    if (status === 'completed') {
      await EditorProfile.findOneAndUpdate(
        { user: request.editor },
        { $inc: { completedProjects: 1 } }
      );
    }

    await request.populate(['client', 'editor'], 'name email avatar');
    res.json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
