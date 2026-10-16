const express = require('express');
const router = express.Router();

const {
  create,
  listMine,
  getOne,
  accept,
  reject,
  cancel,
  complete,
} = require('./booking.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { requireRole } = require('../../middleware/role.middleware');

// All booking routes require authentication
router.use(authenticate);

// Create — tourists only
router.post('/', requireRole('TOURIST'), create);

// List own bookings
router.get('/my', listMine);

// Get one booking (participants only — enforced in service)
router.get('/:id', getOne);

// Guide-only actions
router.patch('/:id/accept', requireRole('GUIDE'), accept);
router.patch('/:id/reject', requireRole('GUIDE'), reject);
router.patch('/:id/complete', requireRole('GUIDE'), complete);

// Cancel — tourist or guide
router.patch('/:id/cancel', cancel);

module.exports = router;