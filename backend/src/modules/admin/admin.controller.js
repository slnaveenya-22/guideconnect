const {
  listUsers,
  setUserActiveStatus,
  listExperiences,
  setExperienceStatus,
  getStats,
} = require('./admin.service');
const {
  validateSuspend,
  validateExperienceStatus,
} = require('./admin.validation');

async function getUsers(req, res, next) {
  try {
    const result = await listUsers(req.query);
    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (err) {
    next(err);
  }
}

async function suspendUser(req, res, next) {
  try {
    const errors = validateSuspend(req.body);
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: errors[0],
        code: 'VALIDATION_FAILED',
      });
    }

    const user = await setUserActiveStatus(
      req.user.id,
      req.params.id,
      req.body.isActive
    );

    res.json({
      success: true,
      message: req.body.isActive ? 'User reactivated' : 'User suspended',
      data: user,
    });
  } catch (err) {
    next(err);
  }
}

async function getExperiences(req, res, next) {
  try {
    const result = await listExperiences(req.query);
    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (err) {
    next(err);
  }
}

async function updateExperienceStatus(req, res, next) {
  try {
    const errors = validateExperienceStatus(req.body);
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: errors[0],
        code: 'VALIDATION_FAILED',
      });
    }

    const experience = await setExperienceStatus(
      req.params.id,
      req.body.isActive
    );

    res.json({
      success: true,
      message: req.body.isActive ? 'Experience restored' : 'Experience hidden',
      data: experience,
    });
  } catch (err) {
    next(err);
  }
}

async function stats(req, res, next) {
  try {
    const result = await getStats();
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getUsers,
  suspendUser,
  getExperiences,
  updateExperienceStatus,
  stats,
};