const CATEGORIES = ['FOOD', 'HERITAGE', 'SHOPPING', 'CULTURE', 'SIGHTSEEING', 'NATURE', 'OTHER'];

function validateCreate(body) {
  const errors = [];

  if (!body.title || body.title.trim().length < 5 || body.title.length > 120) {
    errors.push('Title must be between 5 and 120 characters');
  }
  if (!body.category || !CATEGORIES.includes(body.category)) {
    errors.push('Category must be one of: ' + CATEGORIES.join(', '));
  }
  if (!body.city || !body.city.trim()) {
    errors.push('City is required');
  }
  if (!body.description || body.description.trim().length < 20) {
    errors.push('Description must be at least 20 characters');
  }
  if (typeof body.durationMinutes !== 'number' || body.durationMinutes < 30 || body.durationMinutes > 1440) {
    errors.push('Duration must be between 30 and 1440 minutes');
  }
  if (typeof body.price !== 'number' || body.price <= 0) {
    errors.push('Price must be a positive number (in paise)');
  }
  if (typeof body.maxGroupSize !== 'number' || body.maxGroupSize < 1 || body.maxGroupSize > 20) {
    errors.push('Max group size must be between 1 and 20');
  }
  if (!Array.isArray(body.languages) || body.languages.length === 0) {
    errors.push('At least one language is required');
  }
  if (body.images !== undefined && (!Array.isArray(body.images) || body.images.length > 5)) {
    errors.push('Images must be an array with max 5 items');
  }

  return errors;
}

function validateUpdate(body) {
  const errors = [];

  if (body.title !== undefined && (body.title.trim().length < 5 || body.title.length > 120)) {
    errors.push('Title must be between 5 and 120 characters');
  }
  if (body.category !== undefined && !CATEGORIES.includes(body.category)) {
    errors.push('Invalid category');
  }
  if (body.description !== undefined && body.description.trim().length < 20) {
    errors.push('Description must be at least 20 characters');
  }
  if (body.durationMinutes !== undefined && (body.durationMinutes < 30 || body.durationMinutes > 1440)) {
    errors.push('Duration must be between 30 and 1440 minutes');
  }
  if (body.price !== undefined && body.price <= 0) {
    errors.push('Price must be positive');
  }
  if (body.maxGroupSize !== undefined && (body.maxGroupSize < 1 || body.maxGroupSize > 20)) {
    errors.push('Max group size must be between 1 and 20');
  }
  if (body.languages !== undefined && (!Array.isArray(body.languages) || body.languages.length === 0)) {
    errors.push('Languages must be a non-empty array');
  }
  if (body.isActive !== undefined && typeof body.isActive !== 'boolean') {
    errors.push('isActive must be a boolean');
  }

  return errors;
}

module.exports = { validateCreate, validateUpdate, CATEGORIES };