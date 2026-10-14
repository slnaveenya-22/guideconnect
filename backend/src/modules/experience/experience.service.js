const prisma = require('../../config/prisma');

async function createExperience(userId, data) {
  const profile = await prisma.guideProfile.findUnique({ where: { userId } });
  if (!profile) {
    const err = new Error('Guide profile not found');
    err.status = 404;
    err.code = 'GUIDE_NOT_FOUND';
    throw err;
  }

  const experience = await prisma.experience.create({
    data: {
      guideProfileId: profile.id,
      title: data.title,
      category: data.category,
      city: data.city,
      description: data.description,
      durationMinutes: data.durationMinutes,
      price: data.price,
      maxGroupSize: data.maxGroupSize,
      languages: data.languages,
      images: data.images ?? [],
    },
  });

  return experience;
}

async function listExperiences(query) {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(query.limit) || 12));
  const skip = (page - 1) * limit;

  const where = { isActive: true };

  if (query.city) where.city = { contains: query.city };
  if (query.category) where.category = query.category;
  if (query.minPrice || query.maxPrice) {
    where.price = {};
    if (query.minPrice) where.price.gte = parseInt(query.minPrice);
    if (query.maxPrice) where.price.lte = parseInt(query.maxPrice);
  }
  if (query.minDuration || query.maxDuration) {
    where.durationMinutes = {};
    if (query.minDuration) where.durationMinutes.gte = parseInt(query.minDuration);
    if (query.maxDuration) where.durationMinutes.lte = parseInt(query.maxDuration);
  }

  let orderBy = { createdAt: 'desc' };
  if (query.sort === 'price_asc') orderBy = { price: 'asc' };
  else if (query.sort === 'price_desc') orderBy = { price: 'desc' };

  const [items, total] = await Promise.all([
    prisma.experience.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: {
        guideProfile: {
          include: { user: { select: { id: true, name: true } } },
        },
      },
    }),
    prisma.experience.count({ where }),
  ]);

  let filtered = items;
  if (query.language) {
    filtered = filtered.filter(
      (e) => Array.isArray(e.languages) && e.languages.includes(query.language)
    );
  }
  if (query.q) {
    const q = query.q.toLowerCase();
    filtered = filtered.filter(
      (e) => e.title.toLowerCase().includes(q) || e.description.toLowerCase().includes(q)
    );
  }

  const data = filtered.map((e) => ({
    id: e.id,
    title: e.title,
    category: e.category,
    city: e.city,
    durationMinutes: e.durationMinutes,
    price: e.price,
    maxGroupSize: e.maxGroupSize,
    languages: e.languages,
    images: e.images,
    isActive: e.isActive,
    guide: {
      id: e.guideProfile.id,
      name: e.guideProfile.user.name,
      verificationStatus: e.guideProfile.verificationStatus,
      avgRating: e.guideProfile.avgRating,
      reviewCount: e.guideProfile.reviewCount,
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

async function getExperienceById(id) {
  const exp = await prisma.experience.findUnique({
    where: { id: parseInt(id) },
    include: {
      guideProfile: {
        include: { user: { select: { id: true, name: true } } },
      },
    },
  });

  if (!exp) {
    const err = new Error('Experience not found');
    err.status = 404;
    err.code = 'EXPERIENCE_NOT_FOUND';
    throw err;
  }

  return {
    id: exp.id,
    guideProfileId: exp.guideProfileId,
    guide: {
      id: exp.guideProfile.id,
      name: exp.guideProfile.user.name,
      avatarUrl: exp.guideProfile.avatarUrl,
      city: exp.guideProfile.city,
      verificationStatus: exp.guideProfile.verificationStatus,
      avgRating: exp.guideProfile.avgRating,
    },
    title: exp.title,
    category: exp.category,
    city: exp.city,
    description: exp.description,
    durationMinutes: exp.durationMinutes,
    price: exp.price,
    maxGroupSize: exp.maxGroupSize,
    languages: exp.languages,
    images: exp.images,
    isActive: exp.isActive,
    createdAt: exp.createdAt,
  };
}

async function updateExperience(userId, experienceId, data) {
  const profile = await prisma.guideProfile.findUnique({ where: { userId } });
  if (!profile) {
    const err = new Error('Guide profile not found');
    err.status = 404;
    err.code = 'GUIDE_NOT_FOUND';
    throw err;
  }

  const exp = await prisma.experience.findUnique({
    where: { id: parseInt(experienceId) },
  });

  if (!exp) {
    const err = new Error('Experience not found');
    err.status = 404;
    err.code = 'EXPERIENCE_NOT_FOUND';
    throw err;
  }

  if (exp.guideProfileId !== profile.id) {
    const err = new Error('You do not own this experience');
    err.status = 403;
    err.code = 'FORBIDDEN';
    throw err;
  }

  const updated = await prisma.experience.update({
    where: { id: exp.id },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.category !== undefined && { category: data.category }),
      ...(data.city !== undefined && { city: data.city }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.durationMinutes !== undefined && { durationMinutes: data.durationMinutes }),
      ...(data.price !== undefined && { price: data.price }),
      ...(data.maxGroupSize !== undefined && { maxGroupSize: data.maxGroupSize }),
      ...(data.languages !== undefined && { languages: data.languages }),
      ...(data.images !== undefined && { images: data.images }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
    },
  });

  return updated;
}

async function archiveExperience(userId, experienceId) {
  const profile = await prisma.guideProfile.findUnique({ where: { userId } });
  if (!profile) {
    const err = new Error('Guide profile not found');
    err.status = 404;
    err.code = 'GUIDE_NOT_FOUND';
    throw err;
  }

  const exp = await prisma.experience.findUnique({
    where: { id: parseInt(experienceId) },
  });

  if (!exp) {
    const err = new Error('Experience not found');
    err.status = 404;
    err.code = 'EXPERIENCE_NOT_FOUND';
    throw err;
  }

  if (exp.guideProfileId !== profile.id) {
    const err = new Error('You do not own this experience');
    err.status = 403;
    err.code = 'FORBIDDEN';
    throw err;
  }

  await prisma.experience.update({
    where: { id: exp.id },
    data: { isActive: false },
  });

  return { id: exp.id, isActive: false };
}

async function listOwnExperiences(userId) {
  const profile = await prisma.guideProfile.findUnique({ where: { userId } });
  if (!profile) {
    const err = new Error('Guide profile not found');
    err.status = 404;
    err.code = 'GUIDE_NOT_FOUND';
    throw err;
  }

  const experiences = await prisma.experience.findMany({
    where: { guideProfileId: profile.id },
    orderBy: { createdAt: 'desc' },
  });

  return experiences;
}

module.exports = {
  createExperience,
  listExperiences,
  getExperienceById,
  updateExperience,
  archiveExperience,
  listOwnExperiences,
};