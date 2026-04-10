const express = require('express');
const router = express.Router();
const Conversation = require('../models/Conversation');
const { auth } = require('../middleware/auth');

// GET /api/messages - Get all conversations for user
router.get('/', auth, async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id
    })
      .populate('participants', 'name avatar role')
      .sort({ lastMessage: -1 });
    res.json(conversations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/messages/:userId - Get or create conversation
router.get('/:userId', auth, async (req, res) => {
  try {
    let conv = await Conversation.findOne({
      participants: { $all: [req.user._id, req.params.userId] }
    }).populate('participants', 'name avatar role');

    if (!conv) {
      conv = await Conversation.create({
        participants: [req.user._id, req.params.userId],
        messages: []
      });
      conv = await conv.populate('participants', 'name avatar role');
    }

    // Mark messages as read
    conv.messages.forEach(m => {
      if (m.receiver.toString() === req.user._id.toString()) m.read = true;
    });
    await conv.save();

    res.json(conv);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/messages/:userId - Send a message
router.post('/:userId', auth, async (req, res) => {
  try {
    const { content } = req.body;
    let conv = await Conversation.findOne({
      participants: { $all: [req.user._id, req.params.userId] }
    });

    if (!conv) {
      conv = await Conversation.create({
        participants: [req.user._id, req.params.userId],
        messages: []
      });
    }

    const newMsg = {
      sender: req.user._id,
      receiver: req.params.userId,
      content,
      read: false
    };

    conv.messages.push(newMsg);
    conv.lastMessage = Date.now();
    await conv.save();

    const populatedConv = await Conversation.findById(conv._id)
      .populate('participants', 'name avatar role');

    const msg = populatedConv.messages[populatedConv.messages.length - 1];
    res.status(201).json(msg);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
