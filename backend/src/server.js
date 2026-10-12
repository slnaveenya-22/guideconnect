require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// Global middleware
app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'GuideConnect API is running',
  });
});

// Routes
const authRoutes = require('./modules/auth/auth.routes');
app.use('/api/auth', authRoutes);

const guideRoutes = require('./modules/guide/guide.routes');
const guidePublicRoutes = require('./modules/guide/guide.public.routes');
app.use('/api/guide', guideRoutes);
app.use('/api/guides', guidePublicRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    code: 'NOT_FOUND',
  });
});

// Global error handler
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