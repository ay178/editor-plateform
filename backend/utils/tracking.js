const mongoose = require('mongoose');
const HiringRequest = require('../models/HiringRequest');

// Fixed milestones an editor moves a project through, with the progress % each one means.
const STAGES = ['accepted', 'footage_received', 'rough_cut', 'fine_cut', 'color_audio', 'review', 'delivered'];
const STAGE_PROGRESS = {
  accepted: 0,
  footage_received: 10,
  rough_cut: 30,
  fine_cut: 55,
  color_audio: 75,
  review: 90,
  delivered: 100
};

// Tracking is only available once the editor has accepted the request.
const TRACKABLE = ['accepted', 'scheduled', 'completed'];
const ACTIVE = ['accepted', 'scheduled'];

const roomOf = (requestId) => `project:${requestId}`;

// Append a system line ("Editor accepted the project") to the timeline and broadcast it.
const addSystemEntry = async (io, requestId, note, set = {}) => {
  const entry = { _id: new mongoose.Types.ObjectId(), kind: 'system', note, createdAt: new Date() };
  await HiringRequest.updateOne(
    { _id: requestId },
    { $set: { ...set, 'tracking.updatedAt': new Date() },
      $push: { 'tracking.updates': { $each: [entry], $slice: -200 } } }
  );
  if (io) io.to(roomOf(requestId)).emit('tracking:update', { requestId: String(requestId), entry, ...Object.fromEntries(
    Object.entries(set).map(([k, v]) => [k.replace('tracking.', ''), v])) });
};

module.exports = { STAGES, STAGE_PROGRESS, TRACKABLE, ACTIVE, roomOf, addSystemEntry };
