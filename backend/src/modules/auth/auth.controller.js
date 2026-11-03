const { registerUser, loginUser, googleLogin, forgotPassword, resetPassword } = require('./auth.service');
const {
  validateRegister,
  validateLogin,
  validateGoogleLogin,
} = require('./auth.validation');

async function register(req, res, next) {
  try {
    const errors = validateRegister(req.body);
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: errors[0],
        code: 'VALIDATION_FAILED',
      });
    }
    const user = await registerUser(req.body);
    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: user,
    });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const errors = validateLogin(req.body);
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: errors[0],
        code: 'VALIDATION_FAILED',
      });
    }
    const result = await loginUser(req.body);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

async function google(req, res, next) {
  try {
    const errors = validateGoogleLogin(req.body);
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: errors[0],
        code: 'VALIDATION_FAILED',
      });
    }
    const result = await googleLogin(req.body);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

async function me(req, res) {
  res.json({
    success: true,
    data: {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    },
  });
}

async function forgotPasswordCtrl(req, res, next) {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email required' });
    await forgotPassword(email);
    res.json({ success: true, message: 'OTP sent' });
  } catch (err) { next(err); }
}

async function resetPasswordCtrl(req, res, next) {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) return res.status(400).json({ success: false, message: 'Missing fields' });
    
    // Validate new password
    if (newPassword.length < 6) return res.status(400).json({ success: false, message: 'Password too short' });
    
    await resetPassword(email, otp, newPassword);
    res.json({ success: true, message: 'Password reset successful' });
  } catch (err) { next(err); }
}

module.exports = { register, login, google, me, forgotPasswordCtrl, resetPasswordCtrl };