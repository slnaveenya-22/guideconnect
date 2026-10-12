const express = require('express');
const router = express.Router();

const { list, approve, reject } = require('./verification.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { requireRole } = require('../../middleware/role.middleware');

router.get('/verification-requests', authenticate, requireRole('ADMIN'), list);
router.patch('/verification-requests/:id/approve', authenticate, requireRole('ADMIN'), approve);
router.patch('/verification-requests/:id/reject', authenticate, requireRole('ADMIN'), reject);

module.exports = router;