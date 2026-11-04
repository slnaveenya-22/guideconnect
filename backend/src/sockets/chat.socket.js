const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');

function setupChatSocket(io) {
  // Middleware: verify JWT on connection
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) {
        return next(new Error('AUTH_TOKEN_MISSING'));
      }

      const payload = jwt.verify(token, process.env.JWT_SECRET);
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: { id: true, name: true, role: true, isActive: true },
      });

      if (!user || !user.isActive) {
        return next(new Error('AUTH_TOKEN_EXPIRED'));
      }

      socket.user = user;
      next();
    } catch (err) {
      next(new Error('AUTH_TOKEN_EXPIRED'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`[Socket] User ${socket.user.id} (${socket.user.role}) connected`);

    // Join a conversation room
    socket.on('conversation:join', async (conversationId, callback) => {
      try {
        const conversation = await prisma.conversation.findUnique({
          where: { id: parseInt(conversationId) },
          include: { booking: { include: { guideProfile: true } } },
        });

        if (!conversation) {
          return callback?.({ success: false, message: 'Conversation not found' });
        }

        const { booking } = conversation;
        
        // ✅ FIX 1: Convert both to integers so 1 === 1 is true
        const isTourist = parseInt(booking.touristId) === parseInt(socket.user.id);
        const isGuide = parseInt(booking.guideProfile.userId) === parseInt(socket.user.id);

        if (!isTourist && !isGuide) {
          return callback?.({ success: false, message: 'Forbidden' });
        }

        socket.join(`conversation:${conversationId}`);
        callback?.({ success: true });
      } catch (err) {
        callback?.({ success: false, message: 'Server error' });
      }
    });

    // Send message
    socket.on('message:send', async ({ conversationId, content }, callback) => {
      try {
        if (!content || content.trim().length === 0) {
          return callback?.({ success: false, message: 'Empty message' });
        }

        const conversation = await prisma.conversation.findUnique({
          where: { id: parseInt(conversationId) },
          include: { booking: { include: { guideProfile: true } } },
        });

        if (!conversation) {
          return callback?.({ success: false, message: 'Conversation not found' });
        }

        const { booking } = conversation;
        
        // ✅ FIX 2: Convert both to integers here too
        const isTourist = parseInt(booking.touristId) === parseInt(socket.user.id);
        const isGuide = parseInt(booking.guideProfile.userId) === parseInt(socket.user.id);

        if (!isTourist && !isGuide) {
          return callback?.({ success: false, message: 'Forbidden' });
        }

        // Save message to DB first
        const message = await prisma.message.create({
          data: {
            conversationId: conversation.id,
            senderId: socket.user.id,
            content: content.trim(),
          },
          include: { sender: { select: { id: true, name: true, role: true } } },
        });

        // Then broadcast
        io.to(`conversation:${conversationId}`).emit('message:new', message);
        callback?.({ success: true, data: message });
      } catch (err) {
        console.error('[Socket] message:send error', err);
        callback?.({ success: false, message: 'Server error' });
      }
    });

    socket.on('disconnect', () => {
      console.log(`[Socket] User ${socket.user.id} disconnected`);
    });
  });
}

module.exports = { setupChatSocket };