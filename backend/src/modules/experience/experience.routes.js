const express = require('express');
const router = express.Router();

const {
  create,
  list,
  getOne,
  update,
  archive,
} = require('./experience.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { requireRole } = require('../../middleware/role.middleware');

// Public
router.get('/', list);
router.get('/:id', getOne);

// Guide-only
router.post('/', authenticate, requireRole('GUIDE'), create);
router.patch('/:id', authenticate, requireRole('GUIDE'), update);
router.delete('/:id', authenticate, requireRole('GUIDE'), archive);

module.exports = router;