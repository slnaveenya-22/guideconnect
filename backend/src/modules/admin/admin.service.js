const prisma = require('../../config/prisma');

// ---------- List Users ----------

async function listUsers(query) {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 20));
  const skip = (page - 1) * limit;

  const where = {};

  if (query.role && ['TOURIST', 'GUIDE', 'ADMIN'].includes(query.role)) {
    where.role = query.role;
  }
  if (query.isActive === 'true') where.isActive = true;
  if (query.isActive === 'false') where.isActive = false;
  if (query.q) {
    where.OR = [
      { name: { contains: query.q } },
      { email: { contains: query.q } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        authProvider: true,
        createdAt: true,
      },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    data: users,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

// ---------- Suspend / Reactivate User ----------

async function setUserActiveStatus(adminId, userId, isActive) {
  const target = await prisma.user.findUnique({
    where: { id: parseInt(userId) },
  });

  if (!target) {
    const err = new Error('User not found');
    err.status = 404;
    err.code = 'USER_NOT_FOUND';
    throw err;
  }

  if (target.id === adminId) {
    const err = new Error('You cannot suspend your own account');
    err.status = 400;
    err.code = 'VALIDATION_FAILED';
    throw err;
  }

  if (target.role === 'ADMIN' && !isActive) {
    const err = new Error('Cannot suspend another admin');
    err.status = 400;
    err.code = 'VALIDATION_FAILED';
    throw err;
  }

  const updated = await prisma.user.update({
    where: { id: target.id },
    data: { isActive },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
    },
  });

  return updated;
}

// ---------- List Experiences ----------

async function listExperiences(query) {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 20));
  const skip = (page - 1) * limit;

  const where = {};

  if (query.isActive === 'true') where.isActive = true;
  if (query.isActive === 'false') where.isActive = false;
  if (query.city) where.city = { contains: query.city };
  if (query.category) where.category = query.category;
  if (query.q) where.title = { contains: query.q };

  const [experiences, total] = await Promise.all([
    prisma.experience.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        guideProfile: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
      },
    }),
    prisma.experience.count({ where }),
  ]);

  const data = experiences.map((e) => ({
    id: e.id,
    title: e.title,
    category: e.category,
    city: e.city,
    price: e.price,
    isActive: e.isActive,
    createdAt: e.createdAt,
    guide: {
      id: e.guideProfile.user.id,
      name: e.guideProfile.user.name,
      email: e.guideProfile.user.email,
    },
  }));

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

// ---------- Hide / Restore Experience ----------

async function setExperienceStatus(experienceId, isActive) {
  const experience = await prisma.experience.findUnique({
    where: { id: parseInt(experienceId) },
  });

  if (!experience) {
    const err = new Error('Experience not found');
    err.status = 404;
    err.code = 'EXPERIENCE_NOT_FOUND';
    throw err;
  }

  const updated = await prisma.experience.update({
    where: { id: experience.id },
    data: { isActive },
    select: {
      id: true,
      title: true,
      isActive: true,
    },
  });

  return updated;
}

// ---------- Platform Stats ----------

async function getStats() {
  const [
    totalUsers,
    totalTourists,
    totalGuides,
    totalAdmins,
    suspendedUsers,
    totalExperiences,
    activeExperiences,
    totalBookings,
    pendingBookings,
    acceptedBookings,
    completedBookings,
    cancelledBookings,
    rejectedBookings,
    totalReviews,
    pendingVerifications,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: 'TOURIST' } }),
    prisma.user.count({ where: { role: 'GUIDE' } }),
    prisma.user.count({ where: { role: 'ADMIN' } }),
    prisma.user.count({ where: { isActive: false } }),
    prisma.experience.count(),
    prisma.experience.count({ where: { isActive: true } }),
    prisma.booking.count(),
    prisma.booking.count({ where: { status: 'PENDING' } }),
    prisma.booking.count({ where: { status: 'ACCEPTED' } }),
    prisma.booking.count({ where: { status: 'COMPLETED' } }),
    prisma.booking.count({ where: { status: 'CANCELLED' } }),
    prisma.booking.count({ where: { status: 'REJECTED' } }),
    prisma.review.count(),
    prisma.guideVerification.count({ where: { status: 'PENDING' } }),
  ]);

  return {
    users: {
      total: totalUsers,
      tourists: totalTourists,
      guides: totalGuides,
      admins: totalAdmins,
      suspended: suspendedUsers,
    },
    experiences: {
      total: totalExperiences,
      active: activeExperiences,
    },
    bookings: {
      total: totalBookings,
      pending: pendingBookings,
      accepted: acceptedBookings,
      completed: completedBookings,
      cancelled: cancelledBookings,
      rejected: rejectedBookings,
    },
    reviews: {
      total: totalReviews,
    },
    verifications: {
      pending: pendingVerifications,
    },
  };
}

module.exports = {
  listUsers,
  setUserActiveStatus,
  listExperiences,
  setExperienceStatus,
  getStats,
};