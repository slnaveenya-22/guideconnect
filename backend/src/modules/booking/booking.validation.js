function validateCreate(body) {
  const errors = [];

  if (!body.experienceId || isNaN(parseInt(body.experienceId))) {
    errors.push('experienceId is required');
  }
  if (!body.scheduledDate || isNaN(Date.parse(body.scheduledDate))) {
    errors.push('A valid scheduledDate (ISO format) is required');
  } else {
    const d = new Date(body.scheduledDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (d < today) {
      errors.push('scheduledDate cannot be in the past');
    }
  }
  if (!body.startTime || !/^\d{2}:\d{2}$/.test(body.startTime)) {
    errors.push('startTime must be in HH:MM format');
  }
  if (typeof body.groupSize !== 'number' || body.groupSize < 1) {
    errors.push('groupSize must be a positive number');
  }
  if (body.message !== undefined && body.message.length > 1000) {
    errors.push('message must be at most 1000 characters');
  }

  return errors;
}

function validateReject(body) {
  const errors = [];
  if (body.reason !== undefined && body.reason.length > 500) {
    errors.push('rejection reason must be at most 500 characters');
  }
  return errors;
}

module.exports = { validateCreate, validateReject };