const express = require('express');
const router = express.Router();

const { create, getMine, update } = require('./guide.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { requireRole } = require('../../middleware/role.middleware');

router.post('/profile', authenticate, requireRole('GUIDE'), create);
router.get('/profile', authenticate, requireRole('GUIDE'), getMine);
router.patch('/profile', authenticate, requireRole('GUIDE'), update);

module.exports = router;