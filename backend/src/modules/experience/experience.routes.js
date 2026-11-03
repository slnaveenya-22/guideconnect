const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

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
router.post('/', authenticate, requireRole('GUIDE'), upload.array('images', 5), create);
router.patch('/:id', authenticate, requireRole('GUIDE'), upload.array('images', 5), update);
router.delete('/:id', authenticate, requireRole('GUIDE'), archive);

module.exports = router;