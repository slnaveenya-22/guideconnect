const prisma = require('../../config/prisma');

async function createReview(touristId, bookingId, data) {
  const booking = await prisma.booking.findUnique({
    where: { id: parseInt(bookingId) },
    include: { review: true },
  });

  if (!booking) {
    const err = new Error('Booking not found');
    err.status = 404;
    err.code = 'BOOKING_NOT_FOUND';
    throw err;
  }

  if (booking.touristId !== touristId) {
    const err = new Error('Only the booking\'s tourist can leave a review');
    err.status = 403;
    err.code = 'FORBIDDEN';
    throw err;
  }

  if (booking.status !== 'COMPLETED') {
    const err = new Error('You can only review completed bookings');
    err.status = 400;
    err.code = 'INVALID_STATUS_TRANSITION';
    throw err;
  }

  if (booking.review) {
    const err = new Error('You have already reviewed this booking');
    err.status = 409;
    err.code = 'VALIDATION_FAILED';
    throw err;
  }

  const review = await prisma.$transaction(async (tx) => {
    const created = await tx.review.create({
      data: {
        bookingId: booking.id,
        touristId,
        guideProfileId: booking.guideProfileId,
        rating: data.rating,
        comment: data.comment ?? null,
      },
    });

    // Recalculate guide's avg rating and count
    const aggregate = await tx.review.aggregate({
      where: { guideProfileId: booking.guideProfileId },
      _avg: { rating: true },
      _count: { rating: true },
    });

    await tx.guideProfile.update({
      where: { id: booking.guideProfileId },
      data: {
        avgRating: aggregate._avg.rating ?? 0,
        reviewCount: aggregate._count.rating ?? 0,
      },
    });

    return created;
  });

  return review;
}

async function listGuideReviews(guideId) {
  const guide = await prisma.guideProfile.findUnique({
    where: { id: parseInt(guideId) },
  });

  if (!guide) {
    const err = new Error('Guide not found');
    err.status = 404;
    err.code = 'GUIDE_NOT_FOUND';
    throw err;
  }

  const reviews = await prisma.review.findMany({
    where: { guideProfileId: guide.id },
    orderBy: { createdAt: 'desc' },
    include: {
      tourist: { select: { id: true, name: true } },
      booking: {
        select: {
          experience: { select: { id: true, title: true, city: true } },
        },
      },
    },
  });

  return {
    guideId: guide.id,
    avgRating: guide.avgRating,
    reviewCount: guide.reviewCount,
    reviews: reviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt,
      tourist: {
        id: r.tourist.id,
        name: r.tourist.name,
      },
      experience: r.booking.experience,
    })),
  };
}

module.exports = { createReview, listGuideReviews };