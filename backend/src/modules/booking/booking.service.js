const prisma = require('../../config/prisma');

// ---------- Helpers ----------

function timeToMinutes(timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

function intervalsOverlap(start1, dur1, start2, dur2) {
  const s1 = timeToMinutes(start1);
  const e1 = s1 + dur1;
  const s2 = timeToMinutes(start2);
  const e2 = s2 + dur2;
  return s1 < e2 && s2 < e1;
}

function sameDay(d1, d2) {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

// ---------- Create Booking ----------

async function createBooking(touristId, data) {
  const experience = await prisma.experience.findUnique({
    where: { id: parseInt(data.experienceId) },
    include: { guideProfile: true },
  });

  if (!experience) {
    const err = new Error('Experience not found');
    err.status = 404;
    err.code = 'EXPERIENCE_NOT_FOUND';
    throw err;
  }

  if (!experience.isActive) {
    const err = new Error('This experience is no longer available');
    err.status = 400;
    err.code = 'VALIDATION_FAILED';
    throw err;
  }

  // Tourist cannot book their own guide profile
  if (experience.guideProfile.userId === touristId) {
    const err = new Error('You cannot book your own experience');
    err.status = 400;
    err.code = 'VALIDATION_FAILED';
    throw err;
  }

  // Group size within limit
  if (data.groupSize > experience.maxGroupSize) {
    const err = new Error(`Group size cannot exceed ${experience.maxGroupSize}`);
    err.status = 400;
    err.code = 'VALIDATION_FAILED';
    throw err;
  }

  const booking = await prisma.booking.create({
    data: {
      touristId,
      guideProfileId: experience.guideProfileId,
      experienceId: experience.id,
      scheduledDate: new Date(data.scheduledDate),
      startTime: data.startTime,
      durationMinutes: experience.durationMinutes,
      groupSize: data.groupSize,
      agreedPrice: experience.price * data.groupSize,
      message: data.message ?? null,
      status: 'PENDING',
    },
  });

  return booking;
}

// ---------- List Own Bookings ----------

async function getMyBookings(userId, role) {
  if (role === 'TOURIST') {
    return prisma.booking.findMany({
      where: { touristId: userId },
      orderBy: { createdAt: 'desc' },
      include: {
        experience: { select: { id: true, title: true, category: true, city: true } },
        guideProfile: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
      },
    });
  }

  if (role === 'GUIDE') {
    const profile = await prisma.guideProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      const err = new Error('Guide profile not found');
      err.status = 404;
      err.code = 'GUIDE_NOT_FOUND';
      throw err;
    }

    return prisma.booking.findMany({
      where: { guideProfileId: profile.id },
      orderBy: { createdAt: 'desc' },
      include: {
        experience: { select: { id: true, title: true, category: true, city: true } },
        tourist: { select: { id: true, name: true, email: true } },
      },
    });
  }

  // ADMIN
  return prisma.booking.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: {
      experience: { select: { id: true, title: true, city: true } },
    },
  });
}

// ---------- Get One Booking ----------

async function getBookingById(bookingId, userId, role) {
  const booking = await prisma.booking.findUnique({
    where: { id: parseInt(bookingId) },
    include: {
      experience: true,
      tourist: { select: { id: true, name: true, email: true } },
      guideProfile: {
        include: { user: { select: { id: true, name: true, email: true } } },
      },
    },
  });

  if (!booking) {
    const err = new Error('Booking not found');
    err.status = 404;
    err.code = 'BOOKING_NOT_FOUND';
    throw err;
  }

  // Only participants (or admin) can view
  const isTourist = booking.touristId === userId;
  const isGuide = booking.guideProfile.userId === userId;
  const isAdmin = role === 'ADMIN';

  if (!isTourist && !isGuide && !isAdmin) {
    const err = new Error('You do not have access to this booking');
    err.status = 403;
    err.code = 'FORBIDDEN';
    throw err;
  }

  return booking;
}

// ---------- Accept Booking ----------

async function acceptBooking(bookingId, guideUserId) {
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

  if (booking.guideProfile.userId !== guideUserId) {
    const err = new Error('You do not own this booking');
    err.status = 403;
    err.code = 'FORBIDDEN';
    throw err;
  }

  if (booking.status !== 'PENDING') {
    const err = new Error('Only pending bookings can be accepted');
    err.status = 400;
    err.code = 'INVALID_STATUS_TRANSITION';
    throw err;
  }

  // Double-booking check inside a transaction
  const updated = await prisma.$transaction(async (tx) => {
    // Find other ACCEPTED bookings for this guide on the same day
    const conflicting = await tx.booking.findMany({
      where: {
        guideProfileId: booking.guideProfileId,
        status: 'ACCEPTED',
        id: { not: booking.id },
        scheduledDate: {
          gte: new Date(new Date(booking.scheduledDate).setHours(0, 0, 0, 0)),
          lt: new Date(new Date(booking.scheduledDate).setHours(23, 59, 59, 999)),
        },
      },
    });

    const hasConflict = conflicting.some((b) =>
      intervalsOverlap(
        b.startTime,
        b.durationMinutes,
        booking.startTime,
        booking.durationMinutes
      )
    );

    if (hasConflict) {
      const err = new Error('You already have a booking at this time');
      err.status = 409;
      err.code = 'SLOT_UNAVAILABLE';
      throw err;
    }

    return tx.booking.update({
      where: { id: booking.id },
      data: { status: 'ACCEPTED' },
    });
  });

  return updated;
}

// ---------- Reject Booking ----------

async function rejectBooking(bookingId, guideUserId, reason) {
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

  if (booking.guideProfile.userId !== guideUserId) {
    const err = new Error('You do not own this booking');
    err.status = 403;
    err.code = 'FORBIDDEN';
    throw err;
  }

  if (booking.status !== 'PENDING') {
    const err = new Error('Only pending bookings can be rejected');
    err.status = 400;
    err.code = 'INVALID_STATUS_TRANSITION';
    throw err;
  }

  return prisma.booking.update({
    where: { id: booking.id },
    data: {
      status: 'REJECTED',
      message: reason ? `${booking.message || ''}\n[Guide: ${reason}]`.trim() : booking.message,
    },
  });
}

// ---------- Cancel Booking ----------

async function cancelBooking(bookingId, userId, role) {
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

  if (!['PENDING', 'ACCEPTED'].includes(booking.status)) {
    const err = new Error('Only pending or accepted bookings can be cancelled');
    err.status = 400;
    err.code = 'INVALID_STATUS_TRANSITION';
    throw err;
  }

  return prisma.booking.update({
    where: { id: booking.id },
    data: { status: 'CANCELLED' },
  });
}

// ---------- Complete Booking ----------

async function completeBooking(bookingId, guideUserId) {
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

  if (booking.guideProfile.userId !== guideUserId) {
    const err = new Error('Only the guide can complete this booking');
    err.status = 403;
    err.code = 'FORBIDDEN';
    throw err;
  }

  if (booking.status !== 'ACCEPTED') {
    const err = new Error('Only accepted bookings can be completed');
    err.status = 400;
    err.code = 'INVALID_STATUS_TRANSITION';
    throw err;
  }

  return prisma.booking.update({
    where: { id: booking.id },
    data: { status: 'COMPLETED' },
  });
}

module.exports = {
  createBooking,
  getMyBookings,
  getBookingById,
  acceptBooking,
  rejectBooking,
  cancelBooking,
  completeBooking,
};