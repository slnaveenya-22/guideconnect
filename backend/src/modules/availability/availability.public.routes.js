const express = require('express');
const router = express.Router();
const prisma = require('../../config/prisma');

// GET /api/experiences/:experienceId/availability
router.get('/:experienceId/availability', async (req, res, next) => {
  try {
    const slots = await prisma.availability.findMany({
      where: { 
        experienceId: parseInt(req.params.experienceId),
        date: { gte: new Date() } // Only fetch future dates
      },
      orderBy: { date: 'asc' },
    });
    
    res.json({ success: true, data: slots });
  } catch (err) { 
    next(err); 
  }
});

module.exports = router;