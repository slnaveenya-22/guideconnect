function validateSuspend(body) {
  const errors = [];
  if (typeof body.isActive !== 'boolean') {
    errors.push('isActive must be a boolean');
  }
  return errors;
}

function validateExperienceStatus(body) {
  const errors = [];
  if (typeof body.isActive !== 'boolean') {
    errors.push('isActive must be a boolean');
  }
  return errors;
}

module.exports = { validateSuspend, validateExperienceStatus };