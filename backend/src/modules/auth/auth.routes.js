const express = require('express');
const router = express.Router();

const { register, login, google, me } = require('./auth.controller');
const { authenticate } = require('../../middleware/auth.middleware');

router.post('/register', register);
router.post('/login', login);
router.post('/google', google);
router.get('/me', authenticate, me);

module.exports = router;