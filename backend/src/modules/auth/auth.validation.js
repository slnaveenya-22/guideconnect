function validateRegister(body) {
  const errors = [];
  if (!body.name || body.name.trim().length < 2) {
    errors.push('Name must be at least 2 characters');
  }
  if (!body.email || !/^\S+@\S+\.\S+$/.test(body.email)) {
    errors.push('Valid email is required');
  }
  if (!body.password || body.password.length < 6) {
    errors.push('Password must be at least 6 characters');
  }
  if (!body.role || !['TOURIST', 'GUIDE'].includes(body.role)) {
    errors.push('Role must be either TOURIST or GUIDE');
  }
  return errors;
}

function validateLogin(body) {
  const errors = [];
  if (!body.email) errors.push('Email is required');
  if (!body.password) errors.push('Password is required');
  return errors;
}

module.exports = { validateRegister, validateLogin };