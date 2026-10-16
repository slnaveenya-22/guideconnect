const service = require('./itinerary.service');
const {
  validateCreateItinerary,
  validateUpdateItinerary,
  validateCreateItem,
  validateUpdateItem,
  validateReorder,
  validateSuggestion,
  validateSuggestionResponse,
} = require('./itinerary.validation');

function fail(res, message) {
  return res.status(400).json({
    success: false,
    message,
    code: 'VALIDATION_FAILED',
  });
}

async function getItinerary(req, res, next) {
  try {
    const itinerary = await service.getItinerary(req.params.id, req.user.id, req.user.role);
    res.json({ success: true, data: itinerary });
  } catch (err) {
    next(err);
  }
}

async function createItinerary(req, res, next) {
  try {
    const errors = validateCreateItinerary(req.body);
    if (errors.length) return fail(res, errors[0]);

    const itinerary = await service.createItinerary(
      req.params.id,
      req.user.id,
      req.user.role,
      req.body
    );
    res.status(201).json({
      success: true,
      message: 'Itinerary created',
      data: itinerary,
    });
  } catch (err) {
    next(err);
  }
}

async function updateItinerary(req, res, next) {
  try {
    const errors = validateUpdateItinerary(req.body);
    if (errors.length) return fail(res, errors[0]);

    const itinerary = await service.updateItinerary(
      req.params.id,
      req.user.id,
      req.user.role,
      req.body
    );
    res.json({ success: true, data: itinerary });
  } catch (err) {
    next(err);
  }
}

async function addItem(req, res, next) {
  try {
    const errors = validateCreateItem(req.body);
    if (errors.length) return fail(res, errors[0]);

    const item = await service.addItem(
      req.params.id,
      req.user.id,
      req.user.role,
      req.body
    );
    res.status(201).json({
      success: true,
      message: 'Item added',
      data: item,
    });
  } catch (err) {
    next(err);
  }
}

async function updateItem(req, res, next) {
  try {
    const errors = validateUpdateItem(req.body);
    if (errors.length) return fail(res, errors[0]);

    const item = await service.updateItem(
      req.params.id,
      req.params.itemId,
      req.user.id,
      req.user.role,
      req.body
    );
    res.json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
}

async function deleteItem(req, res, next) {
  try {
    const result = await service.deleteItem(
      req.params.id,
      req.params.itemId,
      req.user.id,
      req.user.role
    );
    res.json({ success: true, message: 'Item deleted', data: result });
  } catch (err) {
    next(err);
  }
}

async function reorderItems(req, res, next) {
  try {
    const errors = validateReorder(req.body);
    if (errors.length) return fail(res, errors[0]);

    const itinerary = await service.reorderItems(
      req.params.id,
      req.user.id,
      req.user.role,
      req.body.itemIds
    );
    res.json({ success: true, data: itinerary });
  } catch (err) {
    next(err);
  }
}

async function createSuggestion(req, res, next) {
  try {
    const errors = validateSuggestion(req.body);
    if (errors.length) return fail(res, errors[0]);

    const suggestion = await service.createSuggestion(
      req.params.id,
      req.user.id,
      req.user.role,
      req.body
    );
    res.status(201).json({
      success: true,
      message: 'Suggestion submitted',
      data: suggestion,
    });
  } catch (err) {
    next(err);
  }
}

async function listSuggestions(req, res, next) {
  try {
    const suggestions = await service.listSuggestions(
      req.params.id,
      req.user.id,
      req.user.role
    );
    res.json({ success: true, data: suggestions });
  } catch (err) {
    next(err);
  }
}

async function respondToSuggestion(req, res, next) {
  try {
    const errors = validateSuggestionResponse(req.body);
    if (errors.length) return fail(res, errors[0]);

    const suggestion = await service.respondToSuggestion(
      req.params.id,
      req.params.suggestionId,
      req.user.id,
      req.user.role,
      req.body
    );
    res.json({ success: true, data: suggestion });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getItinerary,
  createItinerary,
  updateItinerary,
  addItem,
  updateItem,
  deleteItem,
  reorderItems,
  createSuggestion,
  listSuggestions,
  respondToSuggestion,
};