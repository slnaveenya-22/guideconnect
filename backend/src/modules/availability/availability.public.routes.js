const express = require('express');
const router = express.Router();
const prisma = require('../../config/prisma');

// GET /api/experiences/:experienceId/availability
router.get('/:experienceId/availability', async (req, res, next) => {
  try {
    const experienceId = parseInt(req.params.experienceId);

    // 1. Set "today" to midnight (00:00:00)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 2. Fetch slots that are today or in the future
    const slots = await prisma.availability.findMany({
      where: {
        experienceId: experienceId,
        date: { gte: today }, // 👈 This now includes today's slots
      },
      orderBy: { date: 'asc' },
    });
    
    res.json({ success: true, data: slots });
  } catch (err) { 
    next(err); 
  }
});

module.exports = router;