require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json());

// Health
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'GuideConnect API is running' });
});

// Auth
const authRoutes = require('./modules/auth/auth.routes');
app.use('/api/auth', authRoutes);

// Guide own profile
const guideRoutes = require('./modules/guide/guide.routes');
app.use('/api/guide', guideRoutes);

// Guides public
const guidePublicRoutes = require('./modules/guide/guide.public.routes');
app.use('/api/guides', guidePublicRoutes);

// Verification (guide side)
const verificationRoutes = require('./modules/verification/verification.routes');
app.use('/api/guide/verification', verificationRoutes);

// Admin
const adminRoutes = require('./modules/verification/admin.routes');
app.use('/api/admin', adminRoutes);

// 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    code: 'NOT_FOUND',
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('[ERROR]', err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    code: err.code || 'SERVER_ERROR',
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 GuideConnect API running on http://localhost:${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
});