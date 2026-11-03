const express = require('express');
const router = express.Router();
const prisma = require('../../config/prisma');
const { authenticate } = require('../../middleware/auth.middleware');
const { requireRole } = require('../../middleware/role.middleware');

router.use(authenticate);
router.use(requireRole('GUIDE'));

// CREATE a slot for a specific experience
router.post('/', async (req, res, next) => {
  try {
    const { experienceId, date, startTime, endTime } = req.body;
    
    const profile = await prisma.guideProfile.findUnique({ where: { userId: req.user.id } });
    const experience = await prisma.experience.findUnique({ where: { id: parseInt(experienceId) } });
    
    if (!experience || experience.guideProfileId !== profile.id) {
      return res.status(403).json({ success: false, message: 'Not your experience' });
    }

    const slot = await prisma.availability.create({
      data: { 
        experienceId: parseInt(experienceId), // 👈 Fixed to Int
        date: new Date(date), 
        startTime, 
        endTime 
      }
    });
    res.status(201).json({ success: true, data: slot });
  } catch (err) { next(err); }
});

// GET slots for a specific experience
router.get('/experience/:experienceId', async (req, res, next) => {
  try {
    const profile = await prisma.guideProfile.findUnique({ where: { userId: req.user.id } });
    const experience = await prisma.experience.findUnique({ where: { id: parseInt(req.params.experienceId) } });
    
    if (!experience || experience.guideProfileId !== profile.id) {
      return res.status(403).json({ success: false, message: 'Not your experience' });
    }

    const slots = await prisma.availability.findMany({
      where: { experienceId: parseInt(req.params.experienceId) },
      orderBy: { date: 'asc' }
    });
    res.json({ success: true, data: slots });
  } catch (err) { next(err); }
});

// DELETE a slot
router.delete('/:id', async (req, res, next) => {
  try {
    const slot = await prisma.availability.findUnique({ where: { id: parseInt(req.params.id) }, include: { experience: true } });
    const profile = await prisma.guideProfile.findUnique({ where: { userId: req.user.id } });
    
    if (!slot || slot.experience.guideProfileId !== profile.id) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    await prisma.availability.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ success: true, message: 'Slot deleted' });
  } catch (err) { next(err); }
});

module.exports = router;