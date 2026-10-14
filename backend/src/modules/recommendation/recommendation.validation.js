const CATEGORIES = ['FOOD', 'HERITAGE', 'SHOPPING', 'CULTURE', 'SIGHTSEEING', 'NATURE', 'OTHER'];

function validateQuery(query) {
  const errors = [];

  if (!query.city || !query.city.trim()) {
    errors.push('city is required');
  }

  if (query.category && !CATEGORIES.includes(query.category)) {
    errors.push('category must be one of: ' + CATEGORIES.join(', '));
  }

  if (query.maxPrice && (isNaN(parseInt(query.maxPrice)) || parseInt(query.maxPrice) < 0)) {
    errors.push('maxPrice must be a positive number');
  }

  if (query.limit && (isNaN(parseInt(query.limit)) || parseInt(query.limit) < 1 || parseInt(query.limit) > 30)) {
    errors.push('limit must be between 1 and 30');
  }

  return errors;
}

module.exports = { validateQuery, CATEGORIES };