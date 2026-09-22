import express from 'express';
import prisma from '../prisma.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();
router.use(requireAuth);

// Get transactions with filter, search, and sorting
router.get('/', async (req, res) => {
  try {
    const { search, type, category, dateRange, sortBy } = req.query;

    const where = {
      userId: req.userId,
    };

    if (type && type !== 'all') {
      where.type = type;
    }

    if (category && category !== 'all') {
      where.category = category;
    }

    // Date range filter
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
    const thisYearMonth = `${currentYear}-${currentMonth}`;

    if (dateRange === 'this_month') {
      where.date = { startsWith: thisYearMonth };
    } else if (dateRange === 'last_month') {
      const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastYearMonth = `${lastMonthDate.getFullYear()}-${String(lastMonthDate.getMonth() + 1).padStart(2, '0')}`;
      where.date = { startsWith: lastYearMonth };
    }

    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { category: { contains: q, mode: 'insensitive' } },
        { paymentMethod: { contains: q, mode: 'insensitive' } },
        { notes: { contains: q, mode: 'insensitive' } },
      ];
    }

    // Sorting
    let orderBy = { date: 'desc' };
    if (sortBy === 'date-asc') orderBy = { date: 'asc' };
    else if (sortBy === 'amount-desc') orderBy = { amount: 'desc' };
    else if (sortBy === 'amount-asc') orderBy = { amount: 'asc' };

    const transactions = await prisma.transaction.findMany({
      where,
      orderBy,
    });

    res.json({ transactions });
  } catch (error) {
    console.error('Fetch transactions error:', error);
    res.status(500).json({ error: 'Failed to fetch transactions.' });
  }
});

// Create new transaction
router.post('/', async (req, res) => {
  try {
    const { title, amount, type, category, date, paymentMethod, notes } = req.body;

    if (!title || amount === undefined || !type || !category) {
      return res.status(400).json({ error: 'Please provide title, amount, type, and category.' });
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({ error: 'Amount must be greater than 0.' });
    }

    const transaction = await prisma.transaction.create({
      data: {
        userId: req.userId,
        title: title.trim(),
        amount: numAmount,
        type,
        category,
        date: date || new Date().toISOString().split('T')[0],
        paymentMethod: paymentMethod || 'UPI',
        notes: notes ? notes.trim() : null,
      },
    });

    // Check budget alert if it's an expense
    if (type === 'expense') {
      const budget = await prisma.budget.findUnique({
        where: {
          userId_category: {
            userId: req.userId,
            category,
          },
        },
      });

      if (budget) {
        const now = new Date();
        const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

        const monthExpenses = await prisma.transaction.aggregate({
          where: {
            userId: req.userId,
            category,
            type: 'expense',
            date: { startsWith: ym },
          },
          _sum: { amount: true },
        });

        const totalSpent = monthExpenses._sum.amount || 0;
        if (totalSpent > budget.monthlyLimit) {
          await prisma.notification.create({
            data: {
              userId: req.userId,
              title: 'Budget Exceeded! ⚠️',
              message: `You've exceeded your monthly limit for ${category} (Spent: ${totalSpent.toLocaleString()} / Limit: ${budget.monthlyLimit.toLocaleString()})`,
              type: 'warning',
            },
          });
        }
      }
    }

    res.status(201).json({ transaction });
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({ error: 'Failed to create transaction.' });
  }
});

// Update transaction
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, amount, type, category, date, paymentMethod, notes } = req.body;

    const existing = await prisma.transaction.findFirst({
      where: { id, userId: req.userId },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Transaction not found.' });
    }

    const data = {};
    if (title !== undefined) data.title = title.trim();
    if (amount !== undefined) data.amount = parseFloat(amount);
    if (type !== undefined) data.type = type;
    if (category !== undefined) data.category = category;
    if (date !== undefined) data.date = date;
    if (paymentMethod !== undefined) data.paymentMethod = paymentMethod;
    if (notes !== undefined) data.notes = notes ? notes.trim() : null;

    const updated = await prisma.transaction.update({
      where: { id },
      data,
    });

    res.json({ transaction: updated });
  } catch (error) {
    console.error('Update transaction error:', error);
    res.status(500).json({ error: 'Failed to update transaction.' });
  }
});

// Delete transaction
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.transaction.findFirst({
      where: { id, userId: req.userId },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Transaction not found.' });
    }

    await prisma.transaction.delete({
      where: { id },
    });

    res.json({ success: true, message: 'Transaction deleted.' });
  } catch (error) {
    console.error('Delete transaction error:', error);
    res.status(500).json({ error: 'Failed to delete transaction.' });
  }
});

export default router;
