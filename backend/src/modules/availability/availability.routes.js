const express = require('express');
const router = express.Router();
const prisma = require('../../config/prisma');
const { authenticate } = require('../../middleware/auth.middleware');
const { requireRole } = require('../../middleware/role.middleware');

router.use(authenticate);
router.use(requireRole('GUIDE'));

router.post('/', async (req, res, next) => {
  try {
    const profile = await prisma.guideProfile.findUnique({ where: { userId: req.user.id } });
    const slot = await prisma.availability.create({
      data: { guideProfileId: profile.id, date: new Date(req.body.date), startTime: req.body.startTime, endTime: req.body.endTime }
    });
    res.status(201).json({ success: true, data: slot });
  } catch (err) { next(err); }
});

router.get('/mine', async (req, res, next) => {
  try {
    const profile = await prisma.guideProfile.findUnique({ where: { userId: req.user.id } });
    const slots = await prisma.availability.findMany({ where: { guideProfileId: profile.id }, orderBy: { date: 'asc' } });
    res.json({ success: true, data: slots });
  } catch (err) { next(err); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await prisma.availability.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ success: true, message: 'Slot deleted' });
  } catch (err) { next(err); }
});

module.exports = router;