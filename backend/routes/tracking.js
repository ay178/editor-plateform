const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const HiringRequest = require('../models/HiringRequest');
const Notification = require('../models/Notification');
const { auth, requireRole } = require('../middleware/auth');
const { STAGES, STAGE_PROGRESS, TRACKABLE, ACTIVE, roomOf } = require('../utils/tracking');

const isMember = (request, userId) =>
  [request.client, request.editor].some(u => String(u._id || u) === String(userId));

// GET /api/tracking/:id — live-tracking data for one project (client or editor of it only)
router.get('/:id', auth, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: 'Project not found' });
    const request = await HiringRequest.findById(req.params.id)
      .select('projectTitle status deadline client editor tracking')
      .populate('client', 'name avatar')
      .populate('editor', 'name avatar')
      .populate('tracking.updates.by', 'name');
    if (!request || !isMember(request, req.user._id))
      return res.status(404).json({ message: 'Project not found' });
    if (!TRACKABLE.includes(request.status))
      return res.status(409).json({ message: 'Tracking starts once the editor accepts the request' });

    res.json({
      _id: request._id,
      projectTitle: request.projectTitle,
      status: request.status,
      deadline: request.deadline,
      client: request.client,
      editor: request.editor,
      tracking: request.tracking,
      stages: STAGES.map(s => ({ key: s, progress: STAGE_PROGRESS[s] }))
    });
  } catch (err) {
    res.status(500).json({ message: 'Could not load tracking' });
  }
});

// POST /api/tracking/:id/update — editor posts a progress update
// Body: { stage, progress?, note? }
router.post('/:id/update', auth, requireRole('editor'), async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: 'Project not found' });

    const stage = String(req.body.stage || '');
    if (!STAGES.includes(stage)) return res.status(400).json({ message: 'Invalid stage' });

    let progress = STAGE_PROGRESS[stage];
    if (req.body.progress !== undefined && req.body.progress !== '') {
      progress = Number(req.body.progress);
      if (!Number.isInteger(progress) || progress < 0 || progress > 100)
        return res.status(400).json({ message: 'Progress must be a whole number from 0 to 100' });
    }
    const note = String(req.body.note || '').trim().slice(0, 500);

    const entry = {
      _id: new mongoose.Types.ObjectId(),
      kind: 'update', stage, progress, note, by: req.user._id, createdAt: new Date()
    };

    // Atomic: only the project's own editor, and only while the project is active.
    const before = await HiringRequest.findOneAndUpdate(
      { _id: req.params.id, editor: req.user._id, status: { $in: ACTIVE } },
      { $set: { 'tracking.stage': stage, 'tracking.progress': progress, 'tracking.updatedAt': new Date() },
        $push: { 'tracking.updates': { $each: [entry], $slice: -200 } } },
      { new: false }
    ).select('client projectTitle tracking.stage');

    if (!before) return res.status(404).json({ message: 'Project not found or no longer active' });

    const io = req.app.get('io');
    const payload = { requestId: String(req.params.id), stage, progress,
      entry: { ...entry, by: { _id: req.user._id, name: req.user.name } } };
    if (io) io.to(roomOf(req.params.id)).emit('tracking:update', payload);

    // Tell the client when the stage actually changes (not for every small note).
    if (before.tracking?.stage !== stage) {
      Notification.create({
        recipient: before.client, sender: req.user._id, hiringRequest: before._id,
        type: 'project_update',
        message: `${req.user.name} moved "${before.projectTitle}" to ${stage.replace(/_/g, ' ')} (${progress}%)`
      }).catch(e => console.error('tracking notification error:', e.message));
    }

    res.status(201).json(payload);
  } catch (err) {
    console.error('tracking update error:', err.message);
    res.status(500).json({ message: 'Could not save update' });
  }
});

module.exports = router;
