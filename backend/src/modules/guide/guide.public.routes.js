const express = require('express');
const router = express.Router();
const { list, getOne, getExperiences } = require('./guide.controller'); // 👈 Add getExperiences

router.get('/', list);
router.get('/:id', getOne);
router.get('/:id/experiences', getExperiences); // 👈 Add this exact line

module.exports = router;