const { recommendGuides } = require('./recommendation.service');
const { validateQuery } = require('./recommendation.validation');

async function getRecommendations(req, res, next) {
  try {
    const errors = validateQuery(req.query);
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: errors[0],
        code: 'VALIDATION_FAILED',
      });
    }

    const results = await recommendGuides(req.query);
    res.json({
      success: true,
      data: results,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getRecommendations };
