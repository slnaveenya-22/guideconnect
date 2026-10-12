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

module.exports = { create, getMine, update, list, getOne };