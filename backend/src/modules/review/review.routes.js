const express = require('express');
const router = express.Router({ mergeParams: true });
const prisma = require('../../config/prisma'); // Added import for the new routes

const { create } = require('./review.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { requireRole } = require('../../middleware/role.middleware');

// Existing route: POST /api/bookings/:id/review
router.post('/', authenticate, requireRole('TOURIST'), create);

// --- NEW DASHBOARD ROUTES ---
// Tourist Dashboard Reviews: GET /api/users/me/reviews
router.get('/users/me/reviews', authenticate, requireRole('TOURIST'), async (req, res, next) => {
  try {
    const reviews = await prisma.review.findMany({
      where: { touristId: req.user.id },
      include: {
        guideProfile: { include: { user: { select: { name: true } } } },
        booking: { include: { experience: { select: { title: true } } } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: reviews });
  } catch (err) { next(err); }
});

// Guide Dashboard Reviews: GET /api/guide/reviews
router.get('/guide/reviews', authenticate, requireRole('GUIDE'), async (req, res, next) => {
  try {
    const profile = await prisma.guideProfile.findUnique({ where: { userId: req.user.id } });
    if (!profile) return res.status(404).json({ success: false, message: 'Guide profile not found' });
    
    const reviews = await prisma.review.findMany({
      where: { guideProfileId: profile.id },
      include: {
        tourist: { select: { name: true } },
        booking: { include: { experience: { select: { title: true } } } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: reviews });
  } catch (err) { next(err); }
});

module.exports = router;