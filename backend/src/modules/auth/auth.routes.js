const express = require('express');
const router = express.Router();
const prisma = require('../../config/prisma'); // Added import

const { register, login, google, me, forgotPasswordCtrl, resetPasswordCtrl } = require('./auth.controller');
const { authenticate } = require('../../middleware/auth.middleware');

router.post('/register', register);
router.post('/login', login);
router.post('/google', google);
router.get('/me', authenticate, me);
router.post('/forgot-password', forgotPasswordCtrl);
router.post('/reset-password', resetPasswordCtrl);

// Update Logged-in User Profile: PATCH /api/auth/me
router.patch('/me', authenticate, async (req, res, next) => {
  try {
    if (!req.body.name || req.body.name.trim().length < 2) {
      return res.status(400).json({ success: false, message: 'Name must be at least 2 characters' });
    }
    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: { name: req.body.name },
      select: { id: true, name: true, email: true, role: true }
    });
    res.json({ success: true, data: updated });
  } catch (err) { next(err); }
});

module.exports = router;