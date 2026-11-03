function validateRegister(body) {
  const errors = [];
  if (!body.name || body.name.trim().length < 2) {
    errors.push('Name must be at least 2 characters');
  }
  
  // Standard Email Regex
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!body.email || !emailRegex.test(body.email)) {
    errors.push('Valid standard email is required');
  }

  // Password Rules: 6 chars + 1 special
  if (!body.password || body.password.length < 6) {
    errors.push('Password must be at least 6 characters');
  }
  const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/;
  if (body.password && !specialCharRegex.test(body.password)) {
    errors.push('Password must contain at least 1 special character');
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

function validateGoogleLogin(body) {
  const errors = [];
  if (!body.idToken || typeof body.idToken !== 'string') {
    errors.push('Google idToken is required');
  }
  if (body.role !== undefined && !['TOURIST', 'GUIDE'].includes(body.role)) {
    errors.push('Role must be either TOURIST or GUIDE');
  }
  return errors;
}

module.exports = { validateRegister, validateLogin, validateGoogleLogin };