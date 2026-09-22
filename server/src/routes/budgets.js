import express from 'express';
import prisma from '../prisma.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();
router.use(requireAuth);

// Get all budgets with live month-to-date spent calculation
router.get('/', async (req, res) => {
  try {
    const budgets = await prisma.budget.findMany({
      where: { userId: req.userId },
      orderBy: { category: 'asc' },
    });

    const now = new Date();
    const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    // Get all expenses this month grouped by category
    const monthExpenses = await prisma.transaction.groupBy({
      by: ['category'],
      where: {
        userId: req.userId,
        type: 'expense',
        date: { startsWith: ym },
      },
      _sum: {
        amount: true,
      },
    });

    const spendMap = {};
    monthExpenses.forEach((item) => {
      spendMap[item.category] = item._sum.amount || 0;
    });

    const budgetsWithSpent = budgets.map((b) => ({
      ...b,
      spent: spendMap[b.category] || 0,
      remaining: Math.max(0, b.monthlyLimit - (spendMap[b.category] || 0)),
      percentage: Math.round(((spendMap[b.category] || 0) / b.monthlyLimit) * 100),
    }));

    res.json({ budgets: budgetsWithSpent, spendMap });
  } catch (error) {
    console.error('Fetch budgets error:', error);
    res.status(500).json({ error: 'Failed to fetch budgets.' });
  }
});

// Create or update a budget
router.post('/', async (req, res) => {
  try {
    const { category, monthlyLimit } = req.body;

    if (!category || monthlyLimit === undefined) {
      return res.status(400).json({ error: 'Please provide category and monthly limit.' });
    }

    const limit = parseFloat(monthlyLimit);
    if (isNaN(limit) || limit <= 0) {
      return res.status(400).json({ error: 'Monthly limit must be greater than 0.' });
    }

    const budget = await prisma.budget.upsert({
      where: {
        userId_category: {
          userId: req.userId,
          category,
        },
      },
      update: {
        monthlyLimit: limit,
      },
      create: {
        userId: req.userId,
        category,
        monthlyLimit: limit,
      },
    });

    res.status(201).json({ budget });
  } catch (error) {
    console.error('Save budget error:', error);
    res.status(500).json({ error: 'Failed to save budget.' });
  }
});

// Update budget
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { monthlyLimit } = req.body;

    const limit = parseFloat(monthlyLimit);
    if (isNaN(limit) || limit <= 0) {
      return res.status(400).json({ error: 'Monthly limit must be greater than 0.' });
    }

    const existing = await prisma.budget.findFirst({
      where: { id, userId: req.userId },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Budget not found.' });
    }

    const updated = await prisma.budget.update({
      where: { id },
      data: { monthlyLimit: limit },
    });

    res.json({ budget: updated });
  } catch (error) {
    console.error('Update budget error:', error);
    res.status(500).json({ error: 'Failed to update budget.' });
  }
});

// Delete budget
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.budget.findFirst({
      where: { id, userId: req.userId },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Budget not found.' });
    }

    await prisma.budget.delete({
      where: { id },
    });

    res.json({ success: true, message: 'Budget deleted.' });
  } catch (error) {
    console.error('Delete budget error:', error);
    res.status(500).json({ error: 'Failed to delete budget.' });
  }
});

export default router;
