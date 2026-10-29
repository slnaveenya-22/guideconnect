const express = require('express');
const router = express.Router({ mergeParams: true });

const ctrl = require('./chat.controller');
const { authenticate } = require('../../middleware/auth.middleware');

router.use(authenticate);

// Under /api/bookings/:id/conversation
router.get('/', ctrl.getConversation);

module.exports = router;