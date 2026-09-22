import express from 'express';
import prisma from '../prisma.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();
router.use(requireAuth);

// Get all savings goals
router.get('/', async (req, res) => {
  try {
    const goals = await prisma.savingsGoal.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
    });

    const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
    const totalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0);

    res.json({
      goals,
      summary: {
        totalTarget,
        totalSaved,
        percentage: totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0,
      },
    });
  } catch (error) {
    console.error('Fetch savings goals error:', error);
    res.status(500).json({ error: 'Failed to fetch savings goals.' });
  }
});

// Create savings goal
router.post('/', async (req, res) => {
  try {
    const { title, targetAmount, currentAmount, category, targetDate, icon } = req.body;

    if (!title || targetAmount === undefined) {
      return res.status(400).json({ error: 'Please provide goal title and target amount.' });
    }

    const target = parseFloat(targetAmount);
    if (isNaN(target) || target <= 0) {
      return res.status(400).json({ error: 'Target amount must be greater than 0.' });
    }

    const goal = await prisma.savingsGoal.create({
      data: {
        userId: req.userId,
        title: title.trim(),
        targetAmount: target,
        currentAmount: parseFloat(currentAmount) || 0,
        category: category ? category.trim() : 'Personal',
        targetDate: targetDate || null,
        icon: icon || '🎯',
      },
    });

    res.status(201).json({ goal });
  } catch (error) {
    console.error('Create savings goal error:', error);
    res.status(500).json({ error: 'Failed to create savings goal.' });
  }
});

// Adjust goal funds (Deposit / Withdraw)
router.post('/:id/adjust', async (req, res) => {
  try {
    const { id } = req.params;
    const { delta } = req.body; // positive for deposit, negative for withdraw

    const amount = parseFloat(delta);
    if (isNaN(amount) || amount === 0) {
      return res.status(400).json({ error: 'Invalid delta amount.' });
    }

    const existing = await prisma.savingsGoal.findFirst({
      where: { id, userId: req.userId },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Savings goal not found.' });
    }

    const newAmount = Math.max(0, existing.currentAmount + amount);

    const updated = await prisma.savingsGoal.update({
      where: { id },
      data: { currentAmount: newAmount },
    });

    // Milestone celebration notification
    if (newAmount >= existing.targetAmount && existing.currentAmount < existing.targetAmount) {
      await prisma.notification.create({
        data: {
          userId: req.userId,
          title: 'Goal Achieved! 🏆',
          message: `Congratulations! You reached your savings target for "${existing.title}"!`,
          type: 'success',
        },
      });
    }

    res.json({ goal: updated });
  } catch (error) {
    console.error('Adjust savings error:', error);
    res.status(500).json({ error: 'Failed to adjust savings goal.' });
  }
});

// Update savings goal
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, targetAmount, currentAmount, category, targetDate, icon } = req.body;

    const existing = await prisma.savingsGoal.findFirst({
      where: { id, userId: req.userId },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Savings goal not found.' });
    }

    const data = {};
    if (title !== undefined) data.title = title.trim();
    if (targetAmount !== undefined) data.targetAmount = parseFloat(targetAmount);
    if (currentAmount !== undefined) data.currentAmount = parseFloat(currentAmount);
    if (category !== undefined) data.category = category;
    if (targetDate !== undefined) data.targetDate = targetDate;
    if (icon !== undefined) data.icon = icon;

    const updated = await prisma.savingsGoal.update({
      where: { id },
      data,
    });

    res.json({ goal: updated });
  } catch (error) {
    console.error('Update goal error:', error);
    res.status(500).json({ error: 'Failed to update goal.' });
  }
});

// Delete savings goal
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.savingsGoal.findFirst({
      where: { id, userId: req.userId },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Savings goal not found.' });
    }

    await prisma.savingsGoal.delete({
      where: { id },
    });

    res.json({ success: true, message: 'Savings goal deleted.' });
  } catch (error) {
    console.error('Delete goal error:', error);
    res.status(500).json({ error: 'Failed to delete goal.' });
  }
});

export default router;
