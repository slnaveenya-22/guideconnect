require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

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

// Guides (own)
const guideRoutes = require('./modules/guide/guide.routes');
app.use('/api/guide', guideRoutes);

// Guide own experiences
const guideExperienceRoutes = require('./modules/experience/guide-experience.routes');
app.use('/api/guide/experiences', guideExperienceRoutes);

// Guide own verification
const verificationRoutes = require('./modules/verification/verification.routes');
app.use('/api/guide/verification', verificationRoutes);

// Guides (public)
const guidePublicRoutes = require('./modules/guide/guide.public.routes');
app.use('/api/guides', guidePublicRoutes);

// Experiences
const experienceRoutes = require('./modules/experience/experience.routes');
app.use('/api/experiences', experienceRoutes);

// Recommendations
const recommendationRoutes = require('./modules/recommendation/recommendation.routes');
app.use('/api/recommendations', recommendationRoutes);

// Bookings
const bookingRoutes = require('./modules/booking/booking.routes');
app.use('/api/bookings', bookingRoutes);

// Itineraries
const itineraryRoutes = require('./modules/itinerary/itinerary.routes');
app.use('/api/bookings/:id/itinerary', itineraryRoutes);

// Chat (REST)
const chatBookingRoutes = require('./modules/chat/chat.routes');
app.use('/api/bookings/:id/conversation', chatBookingRoutes);

const conversationRoutes = require('./modules/chat/conversation.routes');
app.use('/api/conversations/:id/messages', conversationRoutes);

// Reviews
const reviewBookingRoutes = require('./modules/review/review.routes');
app.use('/api/bookings/:id/review', reviewBookingRoutes);

const guideReviewsRoutes = require('./modules/review/guide-reviews.routes');
app.use('/api/guides/:id/reviews', guideReviewsRoutes);

// Admin
const adminVerificationRoutes = require('./modules/verification/admin.routes');
app.use('/api/admin', adminVerificationRoutes);

const adminModerationRoutes = require('./modules/admin/admin.routes');
app.use('/api/admin', adminModerationRoutes);

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

// Create HTTP server + Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    credentials: true,
  },
});

// Setup chat socket
const { setupChatSocket } = require('./sockets/chat.socket');
setupChatSocket(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 GuideConnect API running on http://localhost:${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔌 Socket.IO ready`);
});