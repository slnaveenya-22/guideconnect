const prisma = require('../../config/prisma');

// Helper: load booking and verify access
async function loadBookingWithAccess(bookingId, userId, role) {
  const booking = await prisma.booking.findUnique({
    where: { id: parseInt(bookingId) },
    include: { guideProfile: true },
  });

  if (!booking) {
    const err = new Error('Booking not found');
    err.status = 404;
    err.code = 'BOOKING_NOT_FOUND';
    throw err;
  }

  const isTourist = booking.touristId === userId;
  const isGuide = booking.guideProfile.userId === userId;
  const isAdmin = role === 'ADMIN';

  if (!isTourist && !isGuide && !isAdmin) {
    const err = new Error('You do not have access to this booking');
    err.status = 403;
    err.code = 'FORBIDDEN';
    throw err;
  }

  return { booking, isTourist, isGuide, isAdmin };
}

function assertChatEnabled(booking) {
  if (!['ACCEPTED', 'COMPLETED'].includes(booking.status)) {
    const err = new Error('Chat is only available for accepted or completed bookings');
    err.status = 400;
    err.code = 'INVALID_STATUS_TRANSITION';
    throw err;
  }
}

async function getOrCreateConversation(bookingId, userId, role) {
  const { booking } = await loadBookingWithAccess(bookingId, userId, role);
  assertChatEnabled(booking);

  let conversation = await prisma.conversation.findUnique({
    where: { bookingId: booking.id },
    include: {
      messages: {
        orderBy: { createdAt: 'asc' },
        include: { sender: { select: { id: true, name: true, role: true } } },
      },
    },
  });

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: { bookingId: booking.id },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          include: { sender: { select: { id: true, name: true, role: true } } },
        },
      },
    });
  }

  return conversation;
}

async function getMessages(conversationId, userId, role) {
  const conversation = await prisma.conversation.findUnique({
    where: { id: parseInt(conversationId) },
    include: {
      booking: { include: { guideProfile: true } },
      messages: {
        orderBy: { createdAt: 'asc' },
        include: { sender: { select: { id: true, name: true, role: true } } },
      },
    },
  });

  if (!conversation) {
    const err = new Error('Conversation not found');
    err.status = 404;
    err.code = 'NOT_FOUND';
    throw err;
  }

  const { booking } = conversation;
  const isTourist = booking.touristId === userId;
  const isGuide = booking.guideProfile.userId === userId;
  const isAdmin = role === 'ADMIN';

  if (!isTourist && !isGuide && !isAdmin) {
    const err = new Error('You do not have access to this conversation');
    err.status = 403;
    err.code = 'FORBIDDEN';
    throw err;
  }

  return conversation.messages;
}

async function sendMessageRest(conversationId, userId, role, content) {
  if (!content || typeof content !== 'string' || content.trim().length === 0) {
    const err = new Error('Message content cannot be empty');
    err.status = 400;
    err.code = 'VALIDATION_FAILED';
    throw err;
  }

  const conversation = await prisma.conversation.findUnique({
    where: { id: parseInt(conversationId) },
    include: { booking: { include: { guideProfile: true } } },
  });

  if (!conversation) {
    const err = new Error('Conversation not found');
    err.status = 404;
    err.code = 'NOT_FOUND';
    throw err;
  }

  const { booking } = conversation;
  const isTourist = booking.touristId === userId;
  const isGuide = booking.guideProfile.userId === userId;

  if (!isTourist && !isGuide) {
    const err = new Error('You do not have access to this conversation');
    err.status = 403;
    err.code = 'FORBIDDEN';
    throw err;
  }

  return prisma.message.create({
    data: {
      conversationId: conversation.id,
      senderId: userId,
      content: content.trim(),
    },
    include: { sender: { select: { id: true, name: true, role: true } } },
  });
}

module.exports = {
  getOrCreateConversation,
  getMessages,
  sendMessageRest,
};