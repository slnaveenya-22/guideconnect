function validateSubmit(body) {
  const errors = [];
  if (!body.govIdUrl || typeof body.govIdUrl !== 'string') {
    errors.push('Government ID document is required');
  }
  if (body.notes !== undefined && body.notes.length > 1000) {
    errors.push('Notes must be at most 1000 characters');
  }
  return errors;
}

function validateReject(body) {
  const errors = [];
  if (!body.reason || body.reason.trim().length < 5) {
    errors.push('Rejection reason is required (min 5 characters)');
  }
  return errors;
}

module.exports = { validateSubmit, validateReject };