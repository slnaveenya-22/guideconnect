const express = require('express');
const router = express.Router({ mergeParams: true });

const { listByGuide } = require('./review.controller');

router.get('/', listByGuide);

module.exports = router;