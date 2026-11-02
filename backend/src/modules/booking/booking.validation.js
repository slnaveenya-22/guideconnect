function validateCreate(body) {
  const errors = [];

  if (!body.experienceId || isNaN(parseInt(body.experienceId))) {
    errors.push('experienceId is required');
  }
  
  // Accept both 'scheduledDate' and 'date'
  const dateToParse = body.scheduledDate || body.date;
  
  let parsedDate = null;
  if (dateToParse) {
    if (dateToParse.includes('-')) {
      const parts = dateToParse.split('-');
      // Handle DD-MM-YYYY just in case
      if (parts[0].length === 2) {
        parsedDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
      } else {
        // Handle YYYY-MM-DD (what she is sending)
        parsedDate = new Date(dateToParse);
      }
    }
  }

  if (!parsedDate || isNaN(parsedDate.getTime())) {
    errors.push('A valid scheduledDate is required');
  } else {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (parsedDate < today) {
      errors.push('scheduledDate cannot be in the past');
    }
  }
  
  // Default startTime to 09:00 if the frontend forgot to send it
  const timeToCheck = body.startTime || '09:00';
  if (!/^\d{2}:\d{2}$/.test(timeToCheck)) {
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