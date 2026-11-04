const prisma = require('../../config/prisma');

async function createProfile(userId, data) {
  const existing = await prisma.guideProfile.findUnique({
    where: { userId },
  });

  if (existing) {
    const err = new Error('Guide profile already exists');
    err.status = 409;
    err.code = 'VALIDATION_FAILED';
    throw err;
  }

  const profile = await prisma.guideProfile.create({
    data: {
      userId,
      bio: data.bio,
      city: data.city,
      country: data.country || 'India',
      languages: data.languages,
      expertise: data.expertise,
      yearsOfExperience: data.yearsOfExperience ?? 0,
      hourlyRate: data.hourlyRate ?? null,
      serviceAreas: data.serviceAreas,
      avatarUrl: data.avatarUrl ?? null,
    },
  });

  return profile;
}

async function getOwnProfile(userId) {
  const profile = await prisma.guideProfile.findUnique({
    where: { userId },
  });

  if (!profile) {
    const err = new Error('Guide profile not found');
    err.status = 404;
    err.code = 'GUIDE_NOT_FOUND';
    throw err;
  }

  return profile;
}

async function updateProfile(userId, data) {
  const existing = await prisma.guideProfile.findUnique({
    where: { userId },
  });

  if (!existing) {
    const err = new Error('Guide profile not found');
    err.status = 404;
    err.code = 'GUIDE_NOT_FOUND';
    throw err;
  }

  const updated = await prisma.guideProfile.update({
    where: { userId },
    data: {
      ...(data.bio !== undefined && { bio: data.bio }),
      ...(data.city !== undefined && { city: data.city }),
      ...(data.country !== undefined && { country: data.country }),
      ...(data.languages !== undefined && { languages: data.languages }),
      ...(data.expertise !== undefined && { expertise: data.expertise }),
      ...(data.yearsOfExperience !== undefined && {
        yearsOfExperience: data.yearsOfExperience,
      }),
      ...(data.hourlyRate !== undefined && { hourlyRate: data.hourlyRate }),
      ...(data.serviceAreas !== undefined && {
        serviceAreas: data.serviceAreas,
      }),
      ...(data.avatarUrl !== undefined && { avatarUrl: data.avatarUrl }),
    },
  });

  return updated;
}

async function listGuides(query) {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(query.limit) || 12));
  const skip = (page - 1) * limit;

  let orderBy = { avgRating: 'desc' };
  if (query.sort === 'price_asc') orderBy = { hourlyRate: 'asc' };
  else if (query.sort === 'price_desc') orderBy = { hourlyRate: 'desc' };
  else if (query.sort === 'newest') orderBy = { createdAt: 'desc' };

  // Fetch ALL guides (we do the filtering in JS to avoid MySQL case-sensitivity bugs)
  const allGuides = await prisma.guideProfile.findMany({
    where: {
      verificationStatus: { in: ['APPROVED', 'PENDING', 'NOT_SUBMITTED'] },
    },
    orderBy,
    include: {
      user: { select: { id: true, name: true } },
    },
  });

  let filtered = allGuides;
  
  // 1. Filter by City (only check the main city they live in)
  if (query.city) {
    const searchCity = query.city.toLowerCase();
    filtered = filtered.filter((g) => {
      return g.city.toLowerCase().includes(searchCity);
    });
  }

  // 2. Filter by Max Price
  if (query.maxPrice) {
    const maxPrice = parseInt(query.maxPrice);
    filtered = filtered.filter((g) => g.hourlyRate && g.hourlyRate <= maxPrice);
  }

  // 3. Filter by Min Rating
  if (query.minRating) {
    const minRating = parseFloat(query.minRating);
    filtered = filtered.filter((g) => g.avgRating >= minRating);
  }

  // 4. Filter by Language
  if (query.language) {
    const searchLang = query.language.toLowerCase();
    filtered = filtered.filter(
      (g) => Array.isArray(g.languages) && g.languages.some(l => l.toLowerCase() === searchLang)
    );
  }

  // 5. Filter by Expertise
  if (query.expertise) {
    const searchExp = query.expertise.toLowerCase();
    filtered = filtered.filter(
      (g) => Array.isArray(g.expertise) && g.expertise.some(e => e.toLowerCase() === searchExp)
    );
  }

  // 6. Filter by Search Text (q)
  if (query.q) {
    const q = query.q.toLowerCase();
    filtered = filtered.filter(
      (g) =>
        g.user.name.toLowerCase().includes(q) ||
        g.bio.toLowerCase().includes(q)
    );
  }

  // Paginate the final filtered results
  const total = filtered.length;
  const paginated = filtered.slice(skip, skip + limit);

  const data = paginated.map((g) => ({
    id: g.id,
    userId: g.userId,
    name: g.user.name,
    avatarUrl: g.avatarUrl,
    bio: g.bio,
    city: g.city,
    country: g.country,
    languages: g.languages,
    expertise: g.expertise,
    yearsOfExperience: g.yearsOfExperience,
    hourlyRate: g.hourlyRate,
    verificationStatus: g.verificationStatus,
    avgRating: g.avgRating,
    reviewCount: g.reviewCount,
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

async function getGuideById(id) {
  const guide = await prisma.guideProfile.findUnique({
    where: { id: parseInt(id) },
    include: {
      user: { select: { id: true, name: true } },
    },
  });

  if (!guide) {
    const err = new Error('Guide not found');
    err.status = 404;
    err.code = 'GUIDE_NOT_FOUND';
    throw err;
  }

  return {
    id: guide.id,
    userId: guide.userId,
    name: guide.user.name,
    avatarUrl: guide.avatarUrl,
    bio: guide.bio,
    city: guide.city,
    country: guide.country,
    languages: guide.languages,
    expertise: guide.expertise,
    yearsOfExperience: guide.yearsOfExperience,
    hourlyRate: guide.hourlyRate,
    serviceAreas: guide.serviceAreas,
    verificationStatus: guide.verificationStatus,
    avgRating: guide.avgRating,
    reviewCount: guide.reviewCount,
    createdAt: guide.createdAt,
  };
}

module.exports = {
  createProfile,
  getOwnProfile,
  updateProfile,
  listGuides,
  getGuideById,
};