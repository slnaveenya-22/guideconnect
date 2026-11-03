const CATEGORIES = ['FOOD', 'HERITAGE', 'SHOPPING', 'CULTURE', 'SIGHTSEEING', 'NATURE', 'OTHER'];
const LANGUAGES = ['English', 'Tamil', 'Hindi', 'Malayalam', 'Kannada', 'Telugu', 'French', 'German', 'Spanish'];
const TAMIL_NADU_CITIES = [
  'Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 
  'Tirunelveli', 'Tiruppur', 'Vellore', 'Erode', 'Thoothukkudi', 
  'Dindigul', 'Thanjavur', 'Ranipet', 'Sivakasi', 'Karur', 
  'Udhagamandalam (Ooty)', 'Hosur', 'Nagercoil', 'Kanchipuram', 
  'Kumarapalayam', 'Karaikkudi', 'Neyveli', 'Cuddalore', 'Kumbakonam', 
  'Tiruvannamalai', 'Pollachi', 'Rajapalayam', 'Gudiyatham', 'Pudukkottai', 
  'Vaniyambadi', 'Ambur', 'Nagapattinam', 'Kanyakumari', 'Kodaikanal'
];

function validateCreate(body) {
  const errors = [];

  if (!body.title || body.title.trim().length < 5 || body.title.length > 120) {
    errors.push('Title must be between 5 and 120 characters');
  }
  
  if (!body.category || !CATEGORIES.includes(body.category)) {
    errors.push('Category must be one of: ' + CATEGORIES.join(', '));
  }

  if (!body.city || !TAMIL_NADU_CITIES.includes(body.city.trim())) {
    errors.push('City must be a valid city in Tamil Nadu.');
  }

  if (!body.description || body.description.trim().length < 20) {
    errors.push('Description must be at least 20 characters');
  }

  const duration = Number(body.durationMinutes);
  if (isNaN(duration) || duration < 30 || duration > 1440) {
    errors.push('Duration must be between 30 and 1440 minutes');
  }

  const price = Number(body.price);
  if (isNaN(price) || price <= 0) {
    errors.push('Price must be a positive number (in paise)');
  }

  const groupSize = Number(body.maxGroupSize);
  if (isNaN(groupSize) || groupSize < 1 || groupSize > 20) {
    errors.push('Max group size must be between 1 and 20');
  }

  // Validate Languages
  if (!body.languages) {
    errors.push('At least one language is required');
  } else {
    const langs = Array.isArray(body.languages) ? body.languages : [body.languages];
    const invalidLangs = langs.filter(l => !LANGUAGES.includes(l));
    if (invalidLangs.length > 0) {
      errors.push('Invalid languages selected. Allowed: ' + LANGUAGES.join(', '));
    }
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

  if (body.city !== undefined && !TAMIL_NADU_CITIES.includes(body.city.trim())) {
    errors.push('City must be a valid city in Tamil Nadu.');
  }

  if (body.description !== undefined && body.description.trim().length < 20) {
    errors.push('Description must be at least 20 characters');
  }
  
  if (body.durationMinutes !== undefined) {
    const duration = Number(body.durationMinutes);
    if (isNaN(duration) || duration < 30 || duration > 1440) errors.push('Duration must be between 30 and 1440 minutes');
  }
  
  if (body.price !== undefined) {
    const price = Number(body.price);
    if (isNaN(price) || price <= 0) errors.push('Price must be positive');
  }
  
  if (body.maxGroupSize !== undefined) {
    const groupSize = Number(body.maxGroupSize);
    if (isNaN(groupSize) || groupSize < 1 || groupSize > 20) errors.push('Max group size must be between 1 and 20');
  }
  
  if (body.languages !== undefined) {
    const langs = Array.isArray(body.languages) ? body.languages : [body.languages];
    const invalidLangs = langs.filter(l => !LANGUAGES.includes(l));
    if (invalidLangs.length > 0) {
      errors.push('Invalid languages selected. Allowed: ' + LANGUAGES.join(', '));
    }
  }
  
  return errors;
}

module.exports = { 
  validateCreate, 
  validateUpdate, 
  CATEGORIES,
  LANGUAGES,
  TAMIL_NADU_CITIES
};