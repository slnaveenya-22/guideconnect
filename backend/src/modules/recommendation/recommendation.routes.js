const express = require('express');
const router = express.Router();

const { getRecommendations } = require('./recommendation.controller');

router.get('/guides', getRecommendations);

module.exports = router;
