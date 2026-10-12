function validateCreateProfile(body) {
  const errors = [];

  if (!body.bio || body.bio.trim().length < 20) {
    errors.push('Bio must be at least 20 characters');
  }
  if (body.bio && body.bio.length > 1000) {
    errors.push('Bio must be at most 1000 characters');
  }
  if (!body.city || !body.city.trim()) {
    errors.push('City is required');
  }
  if (!Array.isArray(body.languages) || body.languages.length === 0) {
    errors.push('At least one language is required');
  }
  if (!Array.isArray(body.expertise) || body.expertise.length === 0) {
    errors.push('At least one area of expertise is required');
  }
  if (
    body.yearsOfExperience !== undefined &&
    (typeof body.yearsOfExperience !== 'number' || body.yearsOfExperience < 0)
  ) {
    errors.push('Years of experience must be a non-negative number');
  }
  if (
    body.hourlyRate !== undefined &&
    (typeof body.hourlyRate !== 'number' || body.hourlyRate < 0)
  ) {
    errors.push('Hourly rate must be a non-negative number');
  }
  if (!Array.isArray(body.serviceAreas) || body.serviceAreas.length === 0) {
    errors.push('At least one service area is required');
  }

  return errors;
}

function validateUpdateProfile(body) {
  const errors = [];

  if (
    body.bio !== undefined &&
    (body.bio.trim().length < 20 || body.bio.length > 1000)
  ) {
    errors.push('Bio must be between 20 and 1000 characters');
  }
  if (body.city !== undefined && !body.city.trim()) {
    errors.push('City cannot be empty');
  }
  if (
    body.languages !== undefined &&
    (!Array.isArray(body.languages) || body.languages.length === 0)
  ) {
    errors.push('Languages must be a non-empty array');
  }
  if (
    body.expertise !== undefined &&
    (!Array.isArray(body.expertise) || body.expertise.length === 0)
  ) {
    errors.push('Expertise must be a non-empty array');
  }
  if (
    body.serviceAreas !== undefined &&
    (!Array.isArray(body.serviceAreas) || body.serviceAreas.length === 0)
  ) {
    errors.push('Service areas must be a non-empty array');
  }
  if (
    body.hourlyRate !== undefined &&
    (typeof body.hourlyRate !== 'number' || body.hourlyRate < 0)
  ) {
    errors.push('Hourly rate must be a non-negative number');
  }

  return errors;
}

module.exports = { validateCreateProfile, validateUpdateProfile };