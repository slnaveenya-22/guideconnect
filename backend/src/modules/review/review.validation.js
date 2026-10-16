function validateCreate(body) {
  const errors = [];

  if (typeof body.rating !== 'number' || body.rating < 1 || body.rating > 5) {
    errors.push('Rating must be a number between 1 and 5');
  }
  if (body.comment !== undefined && body.comment !== null) {
    if (typeof body.comment !== 'string') {
      errors.push('Comment must be a string');
    } else if (body.comment.length > 1000) {
      errors.push('Comment must be at most 1000 characters');
    }
  }

  return errors;
}

module.exports = { validateCreate };