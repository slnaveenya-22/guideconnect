const express = require('express');
const router = express.Router();

const { submit, getMine } = require('./verification.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { requireRole } = require('../../middleware/role.middleware');

router.post('/', authenticate, requireRole('GUIDE'), submit);
router.get('/', authenticate, requireRole('GUIDE'), getMine);

module.exports = router;