import express from 'express';
import prisma from '../prisma.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();
router.use(requireAuth);

// Get user notifications
router.get('/', async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    res.json({ notifications });
  } catch (error) {
    console.error('Fetch notifications error:', error);
    res.status(500).json({ error: 'Failed to fetch notifications.' });
  }
});

// Mark single notification as read
router.put('/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.notification.updateMany({
      where: { id, userId: req.userId },
      data: { read: true },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Mark read error:', error);
    res.status(500).json({ error: 'Failed to mark notification as read.' });
  }
});

// Mark all as read
router.put('/read-all', async (req, res) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.userId },
      data: { read: true },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Mark all read error:', error);
    res.status(500).json({ error: 'Failed to mark all notifications as read.' });
  }
});

// Clear all notifications
router.delete('/', async (req, res) => {
  try {
    await prisma.notification.deleteMany({
      where: { userId: req.userId },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Clear notifications error:', error);
    res.status(500).json({ error: 'Failed to clear notifications.' });
  }
});

export default router;
