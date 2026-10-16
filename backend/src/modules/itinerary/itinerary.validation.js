function validateCreateItinerary(body) {
  const errors = [];
  if (body.title !== undefined && body.title !== null && body.title.length > 120) {
    errors.push('Title must be at most 120 characters');
  }
  if (body.notes !== undefined && body.notes !== null && body.notes.length > 2000) {
    errors.push('Notes must be at most 2000 characters');
  }
  return errors;
}

function validateUpdateItinerary(body) {
  return validateCreateItinerary(body);
}

function validateCreateItem(body) {
  const errors = [];
  if (!body.title || body.title.trim().length < 2 || body.title.length > 120) {
    errors.push('Item title must be between 2 and 120 characters');
  }
  if (body.description !== undefined && body.description !== null && body.description.length > 1000) {
    errors.push('Description must be at most 1000 characters');
  }
  if (body.startTime !== undefined && body.startTime !== null && !/^\d{2}:\d{2}$/.test(body.startTime)) {
    errors.push('startTime must be HH:MM format');
  }
  if (body.endTime !== undefined && body.endTime !== null && !/^\d{2}:\d{2}$/.test(body.endTime)) {
    errors.push('endTime must be HH:MM format');
  }
  if (body.latitude !== undefined && body.latitude !== null && (typeof body.latitude !== 'number' || body.latitude < -90 || body.latitude > 90)) {
    errors.push('latitude must be between -90 and 90');
  }
  if (body.longitude !== undefined && body.longitude !== null && (typeof body.longitude !== 'number' || body.longitude < -180 || body.longitude > 180)) {
    errors.push('longitude must be between -180 and 180');
  }
  return errors;
}

function validateUpdateItem(body) {
  const errors = [];
  if (body.title !== undefined && (body.title.trim().length < 2 || body.title.length > 120)) {
    errors.push('Title must be between 2 and 120 characters');
  }
  if (body.startTime !== undefined && body.startTime !== null && !/^\d{2}:\d{2}$/.test(body.startTime)) {
    errors.push('startTime must be HH:MM format');
  }
  if (body.endTime !== undefined && body.endTime !== null && !/^\d{2}:\d{2}$/.test(body.endTime)) {
    errors.push('endTime must be HH:MM format');
  }
  return errors;
}

function validateReorder(body) {
  const errors = [];
  if (!Array.isArray(body.itemIds) || body.itemIds.length === 0) {
    errors.push('itemIds must be a non-empty array');
  }
  return errors;
}

function validateSuggestion(body) {
  const errors = [];
  if (!body.title || body.title.trim().length < 2 || body.title.length > 120) {
    errors.push('Suggestion title must be between 2 and 120 characters');
  }
  if (body.description !== undefined && body.description !== null && body.description.length > 1000) {
    errors.push('Description must be at most 1000 characters');
  }
  return errors;
}

function validateSuggestionResponse(body) {
  const errors = [];
  if (!['ACCEPTED', 'REJECTED'].includes(body.status)) {
    errors.push('status must be ACCEPTED or REJECTED');
  }
  if (body.guideResponse !== undefined && body.guideResponse !== null && body.guideResponse.length > 500) {
    errors.push('Guide response must be at most 500 characters');
  }
  return errors;
}

module.exports = {
  validateCreateItinerary,
  validateUpdateItinerary,
  validateCreateItem,
  validateUpdateItem,
  validateReorder,
  validateSuggestion,
  validateSuggestionResponse,
};