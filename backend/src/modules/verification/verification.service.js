const prisma = require('../../config/prisma');

async function submitVerification(userId, data) {
  const profile = await prisma.guideProfile.findUnique({
    where: { userId },
  });

  if (!profile) {
    const err = new Error('Guide profile not found');
    err.status = 404;
    err.code = 'GUIDE_NOT_FOUND';
    throw err;
  }

  const existing = await prisma.guideVerification.findUnique({
    where: { guideProfileId: profile.id },
  });

  if (existing) {
    if (existing.status === 'PENDING') {
      const err = new Error('Verification already pending review');
      err.status = 409;
      err.code = 'VALIDATION_FAILED';
      throw err;
    }
    if (existing.status === 'APPROVED') {
      const err = new Error('Verification already approved');
      err.status = 409;
      err.code = 'VALIDATION_FAILED';
      throw err;
    }
  }

  const verification = await prisma.$transaction(async (tx) => {
    const v = await tx.guideVerification.upsert({
      where: { guideProfileId: profile.id },
      create: {
        guideProfileId: profile.id,
        govIdUrl: data.govIdUrl,
        credentialsUrl: data.credentialsUrl ?? null,
        notes: data.notes ?? null,
        status: 'PENDING',
        submittedAt: new Date(),
      },
      update: {
        govIdUrl: data.govIdUrl,
        credentialsUrl: data.credentialsUrl ?? null,
        notes: data.notes ?? null,
        status: 'PENDING',
        rejectionReason: null,
        submittedAt: new Date(),
        reviewedAt: null,
        reviewedBy: null,
      },
    });

    await tx.guideProfile.update({
      where: { id: profile.id },
      data: { verificationStatus: 'PENDING' },
    });

    return v;
  });

  return verification;
}

async function getOwnVerification(userId) {
  const profile = await prisma.guideProfile.findUnique({
    where: { userId },
  });

  if (!profile) {
    const err = new Error('Guide profile not found');
    err.status = 404;
    err.code = 'GUIDE_NOT_FOUND';
    throw err;
  }

  const verification = await prisma.guideVerification.findUnique({
    where: { guideProfileId: profile.id },
  });

  if (!verification) {
    const err = new Error('Verification not submitted');
    err.status = 404;
    err.code = 'VERIFICATION_NOT_FOUND';
    throw err;
  }

  return verification;
}

async function listPending(query) {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(query.limit) || 12));
  const skip = (page - 1) * limit;

  const status = query.status || 'PENDING';

  const [items, total] = await Promise.all([
    prisma.guideVerification.findMany({
      where: { status },
      skip,
      take: limit,
      orderBy: { submittedAt: 'asc' },
      include: {
        guideProfile: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
    }),
    prisma.guideVerification.count({ where: { status } }),
  ]);

  const data = items.map((v) => ({
    id: v.id,
    guideProfileId: v.guideProfileId,
    guide: {
      id: v.guideProfile.user.id,
      name: v.guideProfile.user.name,
      email: v.guideProfile.user.email,
      city: v.guideProfile.city,
      languages: v.guideProfile.languages,
      expertise: v.guideProfile.expertise,
    },
    govIdUrl: v.govIdUrl,
    credentialsUrl: v.credentialsUrl,
    notes: v.notes,
    status: v.status,
    submittedAt: v.submittedAt,
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

async function approveVerification(adminId, verificationId) {
  const verification = await prisma.guideVerification.findUnique({
    where: { id: parseInt(verificationId) },
  });

  if (!verification) {
    const err = new Error('Verification not found');
    err.status = 404;
    err.code = 'VERIFICATION_NOT_FOUND';
    throw err;
  }

  if (verification.status !== 'PENDING') {
    const err = new Error('Only pending verifications can be approved');
    err.status = 400;
    err.code = 'INVALID_STATUS_TRANSITION';
    throw err;
  }

  await prisma.$transaction([
    prisma.guideVerification.update({
      where: { id: verification.id },
      data: {
        status: 'APPROVED',
        reviewedAt: new Date(),
        reviewedBy: adminId,
      },
    }),
    prisma.guideProfile.update({
      where: { id: verification.guideProfileId },
      data: { verificationStatus: 'APPROVED' },
    }),
  ]);

  return { status: 'APPROVED', id: verification.id };
}

async function rejectVerification(adminId, verificationId, reason) {
  const verification = await prisma.guideVerification.findUnique({
    where: { id: parseInt(verificationId) },
  });

  if (!verification) {
    const err = new Error('Verification not found');
    err.status = 404;
    err.code = 'VERIFICATION_NOT_FOUND';
    throw err;
  }

  if (verification.status !== 'PENDING') {
    const err = new Error('Only pending verifications can be rejected');
    err.status = 400;
    err.code = 'INVALID_STATUS_TRANSITION';
    throw err;
  }

  await prisma.$transaction([
    prisma.guideVerification.update({
      where: { id: verification.id },
      data: {
        status: 'REJECTED',
        rejectionReason: reason,
        reviewedAt: new Date(),
        reviewedBy: adminId,
      },
    }),
    prisma.guideProfile.update({
      where: { id: verification.guideProfileId },
      data: { verificationStatus: 'REJECTED' },
    }),
  ]);

  return { status: 'REJECTED', id: verification.id };
}

module.exports = {
  submitVerification,
  getOwnVerification,
  listPending,
  approveVerification,
  rejectVerification,
};