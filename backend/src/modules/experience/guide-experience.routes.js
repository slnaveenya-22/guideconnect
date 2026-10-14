const express = require('express');
const router = express.Router();

const { listMine } = require('./experience.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { requireRole } = require('../../middleware/role.middleware');

router.get('/', authenticate, requireRole('GUIDE'), listMine);

module.exports = router;