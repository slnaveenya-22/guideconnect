const {
  createExperience,
  listExperiences,
  getExperienceById,
  updateExperience,
  archiveExperience,
  listOwnExperiences,
} = require('./experience.service');
const { validateCreate, validateUpdate } = require('./experience.validation');

async function create(req, res, next) {
  try {
    const errors = validateCreate(req.body);
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: errors[0],
        code: 'VALIDATION_FAILED',
      });
    }

    // Prepare clean data for the database
    const cleanData = {
      ...req.body,
      price: Number(req.body.price),
      durationMinutes: Number(req.body.durationMinutes),
      maxGroupSize: Number(req.body.maxGroupSize),
      languages: Array.isArray(req.body.languages) ? req.body.languages : [req.body.languages],
      images: req.files ? req.files.map(f => f.path) : [],
    };

    const exp = await createExperience(req.user.id, cleanData);
    res.status(201).json({
      success: true,
      message: 'Experience created',
      data: exp,
    });
  } catch (err) {
    next(err);
  }
}

async function list(req, res, next) {
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

async function getOne(req, res, next) {
  try {
    const exp = await getExperienceById(req.params.id);
    res.json({ success: true, data: exp });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const errors = validateUpdate(req.body);
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: errors[0],
        code: 'VALIDATION_FAILED',
      });
    }

    const cleanData = {
      ...req.body,
      ...(req.body.price !== undefined && { price: Number(req.body.price) }),
      ...(req.body.durationMinutes !== undefined && { durationMinutes: Number(req.body.durationMinutes) }),
      ...(req.body.maxGroupSize !== undefined && { maxGroupSize: Number(req.body.maxGroupSize) }),
      ...(req.body.languages !== undefined && { languages: Array.isArray(req.body.languages) ? req.body.languages : [req.body.languages] }),
      ...(req.files && req.files.length > 0 && { newImages: req.files.map(f => f.path) }),
    };

    const exp = await updateExperience(req.user.id, req.params.id, cleanData);
    res.json({ success: true, data: exp });
  } catch (err) {
    next(err);
  }
}

async function archive(req, res, next) {
  try {
    const result = await archiveExperience(req.user.id, req.params.id);
    res.json({
      success: true,
      message: 'Experience archived',
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

async function listMine(req, res, next) {
  try {
    const experiences = await listOwnExperiences(req.user.id);
    res.json({ success: true, data: experiences });
  } catch (err) {
    next(err);
  }
}

module.exports = { create, list, getOne, update, archive, listMine };