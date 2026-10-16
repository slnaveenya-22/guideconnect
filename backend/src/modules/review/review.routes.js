const express = require('express');
const router = express.Router({ mergeParams: true });

const { create } = require('./review.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { requireRole } = require('../../middleware/role.middleware');

router.post('/', authenticate, requireRole('TOURIST'), create);

module.exports = router;