const express = require('express');
const router = express.Router();

const {
  getUsers,
  suspendUser,
  getExperiences,
  updateExperienceStatus,
  stats,
} = require('./admin.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { requireRole } = require('../../middleware/role.middleware');

// All admin routes require authentication + ADMIN role
router.use(authenticate);
router.use(requireRole('ADMIN'));

// Users
router.get('/users', getUsers);
router.patch('/users/:id/suspend', suspendUser);

// Experiences
router.get('/experiences', getExperiences);
router.patch('/experiences/:id/status', updateExperienceStatus);

// Stats
router.get('/stats', stats);

module.exports = router;