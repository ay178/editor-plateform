const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const HiringRequest = require('../models/HiringRequest');
const { auth } = require('../middleware/auth');

// GET /api/notifications - Get all notifications for current user
router.get('/', auth, async (req, res) => {
  try {
    const notifications = await Notification.find({ 
      recipient: req.user._id 
    })
      .populate('sender', 'name avatar')
      .populate('hiringRequest', 'projectTitle')
      .sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/notifications/:id/read - Mark as read
router.patch('/:id/read', auth, async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );
    res.json(notification);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/notifications/read-all - Mark all as read
router.patch('/read-all', auth, async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, read: false },
      { read: true }
    );
    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/notifications/schedule - Editor proposes a date
router.post('/schedule', auth, async (req, res) => {
  try {
    const { hiringRequestId, scheduledDate, message } = req.body;

    const request = await HiringRequest.findById(hiringRequestId)
      .populate('client', 'name')
      .populate('editor', 'name');

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.editor._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Update hiring request with scheduled date
    request.scheduledDate = scheduledDate;
    request.status = 'scheduled';
    await request.save();

    // Send notification to client
    await Notification.create({
      recipient: request.client._id,
      sender: req.user._id,
      hiringRequest: hiringRequestId,
      type: 'schedule_proposal',
      message: message || 
        `${request.editor.name} is available on ${new Date(scheduledDate)
          .toLocaleDateString('en-US', { 
            day: 'numeric', month: 'long', year: 'numeric' 
          })} for your project "${request.projectTitle}"`,
      scheduledDate
    });

    res.json({ message: 'Schedule proposal sent to client' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/notifications/schedule/respond - Client accepts or rejects schedule
router.post('/schedule/respond', auth, async (req, res) => {
  try {
    const { hiringRequestId, notificationId, response } = req.body;

    const request = await HiringRequest.findById(hiringRequestId)
      .populate('editor', 'name')
      .populate('client', 'name');

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.client._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Mark notification as read
    await Notification.findByIdAndUpdate(notificationId, { read: true });

    if (response === 'accepted') {
      request.status = 'accepted';
      await request.save();

      // Notify editor
      await Notification.create({
        recipient: request.editor._id,
        sender: req.user._id,
        hiringRequest: hiringRequestId,
        type: 'schedule_accepted',
        message: `${request.client.name} accepted your schedule proposal for "${request.projectTitle}". Project starts on ${new Date(request.scheduledDate).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}`
      });
    } else {
      request.status = 'rejected';
      await request.save();

      // Notify editor
      await Notification.create({
        recipient: request.editor._id,
        sender: req.user._id,
        hiringRequest: hiringRequestId,
        type: 'schedule_rejected',
        message: `${request.client.name} declined your schedule proposal for "${request.projectTitle}"`
      });
    }

    res.json({ message: `Schedule ${response} successfully` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;