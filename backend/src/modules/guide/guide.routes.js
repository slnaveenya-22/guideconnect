const express = require('express');
const router = express.Router();
const { create, getMine, update, getVerification, submitVerification } = require('./guide.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { requireRole } = require('../../middleware/role.middleware');

router.post('/profile', authenticate, requireRole('GUIDE'), create);
router.get('/profile', authenticate, requireRole('GUIDE'), getMine);
router.patch('/profile', authenticate, requireRole('GUIDE'), update);

router.get('/verification', authenticate, requireRole('GUIDE'), getVerification);
router.post('/verification', authenticate, requireRole('GUIDE'), submitVerification);

module.exports = router;