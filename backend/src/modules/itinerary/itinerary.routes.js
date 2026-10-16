const express = require('express');
const router = express.Router({ mergeParams: true });

const ctrl = require('./itinerary.controller');
const { authenticate } = require('../../middleware/auth.middleware');

router.use(authenticate);

// Itinerary root
router.get('/', ctrl.getItinerary);
router.post('/', ctrl.createItinerary);
router.patch('/', ctrl.updateItinerary);

// Items
router.post('/items', ctrl.addItem);
router.patch('/items/reorder', ctrl.reorderItems);
router.patch('/items/:itemId', ctrl.updateItem);
router.delete('/items/:itemId', ctrl.deleteItem);

// Suggestions
router.post('/suggestions', ctrl.createSuggestion);
router.get('/suggestions', ctrl.listSuggestions);
router.patch('/suggestions/:suggestionId', ctrl.respondToSuggestion);

module.exports = router;