const {
  submitVerification,
  getOwnVerification,
  listPending,
  approveVerification,
  rejectVerification,
} = require('./verification.service');

async function submit(req, res, next) {
  try {
    // 1. Check if the user actually uploaded a file
    if (!req.files || !req.files.govIdDocument) {
      return res.status(400).json({
        success: false,
        message: 'Government ID document is required',
        code: 'VALIDATION_FAILED',
      });
    }

    // 2. Extract the Cloudinary URLs
    const govIdUrl = req.files.govIdDocument[0].path;
    const credentialsUrl = req.files.credentialsDocument ? req.files.credentialsDocument[0].path : null;

    // 3. Package the data exactly like the service expects
    const data = {
      govIdUrl,
      credentialsUrl,
      notes: req.body.notes || null,
    };

    const verification = await submitVerification(req.user.id, data);
    
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
    // Note: for rejection, you might want to validate req.body.reason
    // but we'll keep it simple as we didn't add validation for it here
    const result = await rejectVerification(
      req.user.id,
      req.params.id,
      req.body.reason || 'Does not meet requirements'
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