const express = require('express');
const router = express.Router();
const prisma = require('../../config/prisma');

// GET /api/experiences/:experienceId/availability
router.get('/:experienceId/availability', async (req, res, next) => {
  try {
    const experienceId = parseInt(req.params.experienceId);

    // Kavya updated the schema so Availability links directly to Experience!
    const slots = await prisma.availability.findMany({
      where: {
        experienceId: experienceId,
        date: { gte: new Date() },
      },
      orderBy: { date: 'asc' },
    });
    
    res.json({ success: true, data: slots });
  } catch (err) { 
    next(err); 
  }
});

module.exports = router;