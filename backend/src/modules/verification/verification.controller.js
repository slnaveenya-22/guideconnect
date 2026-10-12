const {
  submitVerification,
  getOwnVerification,
  listPending,
  approveVerification,
  rejectVerification,
} = require('./verification.service');
const { validateSubmit, validateReject } = require('./verification.validation');

async function submit(req, res, next) {
  try {
    const errors = validateSubmit(req.body);
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: errors[0],
        code: 'VALIDATION_FAILED',
      });
    }

    const verification = await submitVerification(req.user.id, req.body);
    res.status(201).json({
      success: true,
      message: 'Verification submitted for review',
      data: verification,
    });
  } catch (err) {
    next(err);
  }
}

async function getMine(req, res, next) {
  try {
    const verification = await getOwnVerification(req.user.id);
    res.json({ success: true, data: verification });
  } catch (err) {
    next(err);
  }
}

async function list(req, res, next) {
  try {
    const result = await listPending(req.query);
    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (err) {
    next(err);
  }
}

async function approve(req, res, next) {
  try {
    const result = await approveVerification(req.user.id, req.params.id);
    res.json({
      success: true,
      message: 'Verification approved',
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

async function reject(req, res, next) {
  try {
    const errors = validateReject(req.body);
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: errors[0],
        code: 'VALIDATION_FAILED',
      });
    }

    const result = await rejectVerification(
      req.user.id,
      req.params.id,
      req.body.reason
    );
    res.json({
      success: true,
      message: 'Verification rejected',
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { submit, getMine, list, approve, reject };