const { createReview, listGuideReviews } = require('./review.service');
const { validateCreate } = require('./review.validation');

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

    const review = await createReview(req.user.id, req.params.id, req.body);
    res.status(201).json({
      success: true,
      message: 'Review submitted',
      data: review,
    });
  } catch (err) {
    next(err);
  }
}

async function listByGuide(req, res, next) {
  try {
    const result = await listGuideReviews(req.params.id);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

module.exports = { create, listByGuide };