const prisma = require('../../config/prisma');

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

function assertEditable(booking) {
  if (!['ACCEPTED', 'COMPLETED'].includes(booking.status)) {
    const err = new Error('Itinerary can only be managed for accepted or completed bookings');
    err.status = 400;
    err.code = 'INVALID_STATUS_TRANSITION';
    throw err;
  }
}

async function getItinerary(bookingId, userId, role) {
  const { booking } = await loadBookingWithAccess(bookingId, userId, role);

  const itinerary = await prisma.itinerary.findUnique({
    where: { bookingId: booking.id },
    include: {
      items: { orderBy: { order: 'asc' } },
      suggestions: {
        orderBy: { createdAt: 'desc' },
        include: { tourist: { select: { id: true, name: true } } },
      },
    },
  });

  return itinerary;
}

async function createItinerary(bookingId, userId, role, data) {
  const { booking, isGuide, isAdmin } = await loadBookingWithAccess(bookingId, userId, role);

  if (!isGuide && !isAdmin) {
    const err = new Error('Only the assigned guide can create the itinerary');
    err.status = 403;
    err.code = 'FORBIDDEN';
    throw err;
  }

  assertEditable(booking);

  const existing = await prisma.itinerary.findUnique({
    where: { bookingId: booking.id },
  });

  if (existing) {
    const err = new Error('Itinerary already exists for this booking');
    err.status = 409;
    err.code = 'VALIDATION_FAILED';
    throw err;
  }

  const itinerary = await prisma.itinerary.create({
    data: {
      bookingId: booking.id,
      title: data.title ?? null,
      notes: data.notes ?? null,
    },
    include: { items: true, suggestions: true },
  });

  return itinerary;
}

async function updateItinerary(bookingId, userId, role, data) {
  const { booking, isGuide, isAdmin } = await loadBookingWithAccess(bookingId, userId, role);

  if (!isGuide && !isAdmin) {
    const err = new Error('Only the assigned guide can update the itinerary');
    err.status = 403;
    err.code = 'FORBIDDEN';
    throw err;
  }

  const itinerary = await prisma.itinerary.findUnique({
    where: { bookingId: booking.id },
  });

  if (!itinerary) {
    const err = new Error('Itinerary not found');
    err.status = 404;
    err.code = 'NOT_FOUND';
    throw err;
  }

  const updated = await prisma.itinerary.update({
    where: { id: itinerary.id },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.notes !== undefined && { notes: data.notes }),
    },
    include: {
      items: { orderBy: { order: 'asc' } },
      suggestions: { orderBy: { createdAt: 'desc' } },
    },
  });

  return updated;
}

async function addItem(bookingId, userId, role, data) {
  const { booking, isGuide, isAdmin } = await loadBookingWithAccess(bookingId, userId, role);

  if (!isGuide && !isAdmin) {
    const err = new Error('Only the guide can add itinerary items');
    err.status = 403;
    err.code = 'FORBIDDEN';
    throw err;
  }

  assertEditable(booking);

  const itinerary = await prisma.itinerary.findUnique({
    where: { bookingId: booking.id },
  });

  if (!itinerary) {
    const err = new Error('Itinerary not found — create it first');
    err.status = 404;
    err.code = 'NOT_FOUND';
    throw err;
  }

  const lastItem = await prisma.itineraryItem.findFirst({
    where: { itineraryId: itinerary.id },
    orderBy: { order: 'desc' },
  });

  const nextOrder = lastItem ? lastItem.order + 1 : 0;

  const item = await prisma.itineraryItem.create({
    data: {
      itineraryId: itinerary.id,
      order: nextOrder,
      title: data.title,
      description: data.description ?? null,
      startTime: data.startTime ?? null,
      endTime: data.endTime ?? null,
      locationName: data.locationName ?? null,
      latitude: data.latitude ?? null,
      longitude: data.longitude ?? null,
      notes: data.notes ?? null,
    },
  });

  return item;
}

async function updateItem(bookingId, itemId, userId, role, data) {
  const { booking, isGuide, isAdmin } = await loadBookingWithAccess(bookingId, userId, role);

  if (!isGuide && !isAdmin) {
    const err = new Error('Only the guide can update itinerary items');
    err.status = 403;
    err.code = 'FORBIDDEN';
    throw err;
  }

  const itinerary = await prisma.itinerary.findUnique({
    where: { bookingId: booking.id },
  });

  if (!itinerary) {
    const err = new Error('Itinerary not found');
    err.status = 404;
    err.code = 'NOT_FOUND';
    throw err;
  }

  const item = await prisma.itineraryItem.findUnique({
    where: { id: parseInt(itemId) },
  });

  if (!item || item.itineraryId !== itinerary.id) {
    const err = new Error('Item not found');
    err.status = 404;
    err.code = 'NOT_FOUND';
    throw err;
  }

  const updated = await prisma.itineraryItem.update({
    where: { id: item.id },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.startTime !== undefined && { startTime: data.startTime }),
      ...(data.endTime !== undefined && { endTime: data.endTime }),
      ...(data.locationName !== undefined && { locationName: data.locationName }),
      ...(data.latitude !== undefined && { latitude: data.latitude }),
      ...(data.longitude !== undefined && { longitude: data.longitude }),
      ...(data.notes !== undefined && { notes: data.notes }),
    },
  });

  return updated;
}

async function deleteItem(bookingId, itemId, userId, role) {
  const { booking, isGuide, isAdmin } = await loadBookingWithAccess(bookingId, userId, role);

  if (!isGuide && !isAdmin) {
    const err = new Error('Only the guide can delete itinerary items');
    err.status = 403;
    err.code = 'FORBIDDEN';
    throw err;
  }

  const itinerary = await prisma.itinerary.findUnique({
    where: { bookingId: booking.id },
  });

  if (!itinerary) {
    const err = new Error('Itinerary not found');
    err.status = 404;
    err.code = 'NOT_FOUND';
    throw err;
  }

  const item = await prisma.itineraryItem.findUnique({
    where: { id: parseInt(itemId) },
  });

  if (!item || item.itineraryId !== itinerary.id) {
    const err = new Error('Item not found');
    err.status = 404;
    err.code = 'NOT_FOUND';
    throw err;
  }

  await prisma.itineraryItem.delete({ where: { id: item.id } });

  return { id: item.id, deleted: true };
}

async function reorderItems(bookingId, userId, role, itemIds) {
  const { booking, isGuide, isAdmin } = await loadBookingWithAccess(bookingId, userId, role);

  if (!isGuide && !isAdmin) {
    const err = new Error('Only the guide can reorder itinerary items');
    err.status = 403;
    err.code = 'FORBIDDEN';
    throw err;
  }

  const itinerary = await prisma.itinerary.findUnique({
    where: { bookingId: booking.id },
    include: { items: true },
  });

  if (!itinerary) {
    const err = new Error('Itinerary not found');
    err.status = 404;
    err.code = 'NOT_FOUND';
    throw err;
  }

  const existingIds = new Set(itinerary.items.map((i) => i.id));
  for (const id of itemIds) {
    if (!existingIds.has(id)) {
      const err = new Error(`Item ${id} does not belong to this itinerary`);
      err.status = 400;
      err.code = 'VALIDATION_FAILED';
      throw err;
    }
  }

  await prisma.$transaction(
    itemIds.map((id, index) =>
      prisma.itineraryItem.update({
        where: { id },
        data: { order: index },
      })
    )
  );

  const updated = await prisma.itinerary.findUnique({
    where: { id: itinerary.id },
    include: { items: { orderBy: { order: 'asc' } }, suggestions: true },
  });

  return updated;
}

async function createSuggestion(bookingId, userId, role, data) {
  const { booking, isTourist } = await loadBookingWithAccess(bookingId, userId, role);

  if (!isTourist) {
    const err = new Error('Only the tourist on this booking can suggest changes');
    err.status = 403;
    err.code = 'FORBIDDEN';
    throw err;
  }

  assertEditable(booking);

  const itinerary = await prisma.itinerary.findUnique({
    where: { bookingId: booking.id },
  });

  if (!itinerary) {
    const err = new Error('Itinerary not found — guide has not created one yet');
    err.status = 404;
    err.code = 'NOT_FOUND';
    throw err;
  }

  const suggestion = await prisma.itinerarySuggestion.create({
    data: {
      itineraryId: itinerary.id,
      touristId: userId,
      title: data.title,
      description: data.description ?? null,
      locationName: data.locationName ?? null,
      status: 'PENDING',
    },
  });

  return suggestion;
}

async function listSuggestions(bookingId, userId, role) {
  const { booking } = await loadBookingWithAccess(bookingId, userId, role);

  const itinerary = await prisma.itinerary.findUnique({
    where: { bookingId: booking.id },
  });

  if (!itinerary) {
    return [];
  }

  const suggestions = await prisma.itinerarySuggestion.findMany({
    where: { itineraryId: itinerary.id },
    orderBy: { createdAt: 'desc' },
    include: { tourist: { select: { id: true, name: true } } },
  });

  return suggestions;
}

async function respondToSuggestion(bookingId, suggestionId, userId, role, data) {
  const { booking, isGuide, isAdmin } = await loadBookingWithAccess(bookingId, userId, role);

  if (!isGuide && !isAdmin) {
    const err = new Error('Only the guide can respond to suggestions');
    err.status = 403;
    err.code = 'FORBIDDEN';
    throw err;
  }

  const itinerary = await prisma.itinerary.findUnique({
    where: { bookingId: booking.id },
  });

  if (!itinerary) {
    const err = new Error('Itinerary not found');
    err.status = 404;
    err.code = 'NOT_FOUND';
    throw err;
  }

  const suggestion = await prisma.itinerarySuggestion.findUnique({
    where: { id: parseInt(suggestionId) },
  });

  if (!suggestion || suggestion.itineraryId !== itinerary.id) {
    const err = new Error('Suggestion not found');
    err.status = 404;
    err.code = 'NOT_FOUND';
    throw err;
  }

  const updated = await prisma.itinerarySuggestion.update({
    where: { id: suggestion.id },
    data: {
      status: data.status,
      guideResponse: data.guideResponse ?? null,
    },
  });

  return updated;
}

module.exports = {
  getItinerary,
  createItinerary,
  updateItinerary,
  addItem,
  updateItem,
  deleteItem,
  reorderItems,
  createSuggestion,
  listSuggestions,
  respondToSuggestion,
};