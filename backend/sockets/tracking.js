const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const HiringRequest = require('../models/HiringRequest');
const redis = require('../utils/redis');
const { TRACKABLE, roomOf } = require('../utils/tracking');

// A socket may only listen to a project's live updates after proving, with its JWT,
// that it is the client or the editor of that project. (The older chat/collab events
// trust a client-supplied userId; tracking does not.)
module.exports = (io, socket) => {
  socket.on('tracking:join', async (payload, ack) => {
    const reply = (ok) => { if (typeof ack === 'function') ack({ ok }); };
    try {
      const { requestId, token } = payload || {};
      if (typeof requestId !== 'string' || typeof token !== 'string' || !mongoose.isValidObjectId(requestId))
        return reply(false);

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      try {
        if (await redis.get(`blacklist:${token}`)) return reply(false);
      } catch (_) { /* redis down: fall through, JWT is still valid */ }

      const ok = await HiringRequest.exists({
        _id: requestId,
        status: { $in: TRACKABLE },
        $or: [{ client: decoded.id }, { editor: decoded.id }]
      });
      if (!ok) return reply(false);

      socket.join(roomOf(requestId));
      reply(true);
    } catch (_) {
      reply(false);
    }
  });

  socket.on('tracking:leave', (payload) => {
    if (payload && typeof payload.requestId === 'string') socket.leave(roomOf(payload.requestId));
  });
};
