const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const prisma = require('../../config/prisma');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

function generateToken(user) {
  return jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

function safeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

async function registerUser({ name, email, password, role }) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    const err = new Error('Email already registered');
    err.status = 409;
    err.code = 'EMAIL_ALREADY_EXISTS';
    throw err;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role,
      authProvider: 'LOCAL',
    },
  });

  return safeUser(user);
}

async function loginUser({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !user.isActive) {
    const err = new Error('Invalid email or password');
    err.status = 401;
    err.code = 'AUTH_INVALID_CREDENTIALS';
    throw err;
  }

  if (!user.passwordHash) {
    const err = new Error('This account uses Google sign-in. Please use "Continue with Google".');
    err.status = 400;
    err.code = 'USE_GOOGLE_SIGNIN';
    throw err;
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatches) {
    const err = new Error('Invalid email or password');
    err.status = 401;
    err.code = 'AUTH_INVALID_CREDENTIALS';
    throw err;
  }

  const token = generateToken(user);
  return { token, user: safeUser(user) };
}

async function googleLogin({ idToken, role }) {
  let payload;
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    payload = ticket.getPayload();
  } catch (err) {
    const e = new Error('Invalid Google token');
    e.status = 401;
    e.code = 'AUTH_INVALID_GOOGLE_TOKEN';
    throw e;
  }

  const { sub: googleId, email, name, email_verified } = payload;

  if (!email || !email_verified) {
    const err = new Error('Google account email is not verified');
    err.status = 400;
    err.code = 'GOOGLE_EMAIL_NOT_VERIFIED';
    throw err;
  }

  let user = await prisma.user.findUnique({ where: { googleId } });

  if (!user) {
    const existing = await prisma.user.findUnique({ where: { email } });

    if (existing) {
      user = await prisma.user.update({
        where: { id: existing.id },
        data: { googleId, authProvider: 'GOOGLE' },
      });
    } else {
      const finalRole = role === 'GUIDE' ? 'GUIDE' : 'TOURIST';
      user = await prisma.user.create({
        data: {
          name: name || email.split('@')[0],
          email,
          googleId,
          authProvider: 'GOOGLE',
          role: finalRole,
        },
      });
    }
  }

  if (!user.isActive) {
    const err = new Error('Account is deactivated');
    err.status = 401;
    err.code = 'AUTH_ACCOUNT_DISABLED';
    throw err;
  }

  const token = generateToken(user);
  return { token, user: safeUser(user) };
}

module.exports = { registerUser, loginUser, googleLogin };