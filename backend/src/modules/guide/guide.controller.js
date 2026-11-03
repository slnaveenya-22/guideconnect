const {
  createProfile,
  getOwnProfile,
  updateProfile,
  listGuides,
  getGuideById,
} = require('./guide.service');
const {
  validateCreateProfile,
  validateUpdateProfile,
} = require('./guide.validation');
const prisma = require('../../config/prisma'); // Added for getExperiences and verification

// --- Profile Management ---

async function create(req, res, next) {
  try {
    const errors = validateCreateProfile(req.body);
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: errors[0],
        code: 'VALIDATION_FAILED',
      });
    }

    const profile = await createProfile(req.user.id, req.body);
    res.status(201).json({
      success: true,
      message: 'Guide profile created',
      data: profile,
    });
  } catch (err) {
    next(err);
  }
}

async function getMine(req, res, next) {
  try {
    const profile = await getOwnProfile(req.user.id);
    res.json({ success: true, data: profile });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const errors = validateUpdateProfile(req.body);
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: errors[0],
        code: 'VALIDATION_FAILED',
      });
    }

    const profile = await updateProfile(req.user.id, req.body);
    res.json({ success: true, data: profile });
  } catch (err) {
    next(err);
  }
}

// --- Public Guide Directory ---

async function list(req, res, next) {
  try {
    const result = await listGuides(req.query);
    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (err) {
    next(err);
  }
}

async function getOne(req, res, next) {
  try {
    const guide = await getGuideById(req.params.id);
    res.json({ success: true, data: guide });
  } catch (err) {
    next(err);
  }
}

async function getExperiences(req, res, next) {
  try {
    const experiences = await prisma.experience.findMany({
      where: { 
        guideProfileId: parseInt(req.params.id),
        isActive: true 
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json({ success: true, data: experiences });
  } catch (err) {
    next(err);
  }
}

// --- Verification Management ---

async function getVerification(req, res, next) {
  try {
    const profile = await prisma.guideProfile.findUnique({ 
      where: { userId: req.user.id } 
    });
    
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Guide profile not found' });
    }

    const verification = await prisma.guideVerification.findFirst({
      where: { guideProfileId: profile.id },
      orderBy: { submittedAt: 'desc' }
    });

    if (!verification) {
      return res.json({ success: true, data: { status: 'NOT_SUBMITTED' } });
    }

    res.json({ success: true, data: verification });
  } catch (err) {
    next(err);
  }
}

async function submitVerification(req, res, next) {
  try {
    const profile = await prisma.guideProfile.findUnique({ 
      where: { userId: req.user.id } 
    });
    
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Guide profile not found' });
    }

    const verification = await prisma.guideVerification.create({
      data: {
        guideProfileId: profile.id,
        status: 'PENDING',
        notes: req.body.notes || '',
        // If you are handling file uploads, you'd add the file URLs here:
        // govIdDocumentUrl: req.files?.govId?.[0]?.path,
        // credentialsUrl: req.files?.credentials?.[0]?.path
      }
    });

    await prisma.guideProfile.update({
      where: { id: profile.id },
      data: { verificationStatus: 'PENDING' }
    });

    res.status(201).json({ success: true, data: verification });
  } catch (err) {
    next(err);
  }
}

module.exports = { 
  create, 
  getMine, 
  update, 
  list, 
  getOne, 
  getExperiences,
  getVerification,
  submitVerification
};