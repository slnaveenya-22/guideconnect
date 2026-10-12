const express = require('express');
const router = express.Router();

const { list, getOne } = require('./guide.controller');

router.get('/', list);
router.get('/:id', getOne);

module.exports = router;