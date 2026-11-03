const express = require('express');
const router = express.Router();
const { submit, getMine } = require('./verification.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { requireRole } = require('../../middleware/role.middleware');
const { upload } = require('../../config/cloudinary');

// Add upload.fields to catch the files
router.post(
  '/', 
  authenticate, 
  requireRole('GUIDE'), 
  upload.fields([
    { name: 'govIdDocument', maxCount: 1 }, 
    { name: 'credentialsDocument', maxCount: 1 }
  ]),
  submit
);

router.get('/', authenticate, requireRole('GUIDE'), getMine);

module.exports = router;