const express = require('express');
const router = express.Router();
const { list, approve, reject } = require('./verification.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { requireRole } = require('../../middleware/role.middleware');

router.get('/verifications', authenticate, requireRole('ADMIN'), list);

router.patch('/verifications/:id', authenticate, requireRole('ADMIN'), async (req, res, next) => {
  if (req.body.status === 'APPROVED') {
    return approve(req, res, next);
  } else if (req.body.status === 'REJECTED') {
    req.body.reason = req.body.rejectionReason; // map her field name
    return reject(req, res, next);
  } else {
    return res.status(400).json({ success: false, message: 'Status must be APPROVED or REJECTED' });
  }
});

module.exports = router;