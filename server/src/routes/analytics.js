import express from 'express';
import prisma from '../prisma.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();
router.use(requireAuth);

// Comprehensive Dashboard Analytics & Calculations
router.get('/dashboard', async (req, res) => {
  try {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-indexed
    const currentYearMonth = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;

    // Previous month string
    const prevMonthDate = new Date(currentYear, currentMonth - 1, 1);
    const prevYearMonth = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, '0')}`;

    // Current month transactions
    const currentMonthTx = await prisma.transaction.findMany({
      where: {
        userId: req.userId,
        date: { startsWith: currentYearMonth },
      },
    });

    const totalIncome = currentMonthTx
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = currentMonthTx
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const currentBalance = totalIncome - totalExpenses;

    // Previous month totals for % change
    const prevMonthTx = await prisma.transaction.findMany({
      where: {
        userId: req.userId,
        date: { startsWith: prevYearMonth },
      },
    });

    const prevIncome = prevMonthTx
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const prevExpenses = prevMonthTx
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const incomeChangePct = prevIncome > 0
      ? Number((((totalIncome - prevIncome) / prevIncome) * 100).toFixed(1))
      : 0;

    const expenseChangePct = prevExpenses > 0
      ? Number((((totalExpenses - prevExpenses) / prevExpenses) * 100).toFixed(1))
      : 0;

    // Savings goals total
    const savingsGoals = await prisma.savingsGoal.findMany({
      where: { userId: req.userId },
    });
    const totalSavings = savingsGoals.reduce((sum, g) => sum + g.currentAmount, 0);

    // Days in current month and days left for Safe Daily Spend calculation
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const currentDay = now.getDate();
    const daysLeftInMonth = Math.max(1, daysInMonth - currentDay + 1);

    // Total monthly budget limit
    const budgets = await prisma.budget.findMany({
      where: { userId: req.userId },
    });
    const totalBudgetLimit = budgets.reduce((sum, b) => sum + b.monthlyLimit, 0);
    const remainingBudget = Math.max(0, totalBudgetLimit - totalExpenses);

    // Safe Daily Spend = Remaining Budget / Days Left
    const safeDailySpend = totalBudgetLimit > 0
      ? Math.round(remainingBudget / daysLeftInMonth)
      : Math.round(Math.max(0, currentBalance) / daysLeftInMonth);

    // Average daily burn rate so far this month
    const dailyAverageBurn = currentDay > 0 ? Math.round(totalExpenses / currentDay) : 0;

    // Category breakdown for Doughnut Chart
    const categoryGroup = await prisma.transaction.groupBy({
      by: ['category'],
      where: {
        userId: req.userId,
        type: 'expense',
        date: { startsWith: currentYearMonth },
      },
      _sum: { amount: true },
      orderBy: { _sum: { amount: 'desc' } },
    });

    const categoryBreakdown = categoryGroup.map((item) => ({
      category: item.category,
      amount: item._sum.amount || 0,
      percentage: totalExpenses > 0
        ? Number((((item._sum.amount || 0) / totalExpenses) * 100).toFixed(1))
        : 0,
    }));

    // Category spend map
    const categorySpendMap = {};
    categoryBreakdown.forEach((c) => {
      categorySpendMap[c.category] = c.amount;
    });

    // Past 6 Months breakdown for Income vs Expenses Bar Chart
    const monthlyBreakdown = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(currentYear, currentMonth - i, 1);
      const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString('en-US', { month: 'short' });

      const txs = await prisma.transaction.findMany({
        where: {
          userId: req.userId,
          date: { startsWith: ym },
        },
      });

      const inc = txs.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
      const exp = txs.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

      monthlyBreakdown.push({
        key: ym,
        month: label,
        year: d.getFullYear(),
        income: inc,
        expenses: exp,
        balance: inc - exp,
      });
    }

    // Recent transactions (last 6)
    const recentTransactions = await prisma.transaction.findMany({
      where: { userId: req.userId },
      orderBy: { date: 'desc' },
      take: 6,
    });

    res.json({
      summary: {
        totalIncome,
        totalExpenses,
        currentBalance,
        totalSavings,
        incomeChangePct,
        expenseChangePct,
        safeDailySpend,
        dailyAverageBurn,
        daysLeftInMonth,
        remainingBudget,
        totalBudgetLimit,
      },
      categoryBreakdown,
      categorySpendMap,
      monthlyBreakdown,
      recentTransactions,
    });
  } catch (error) {
    console.error('Analytics dashboard error:', error);
    res.status(500).json({ error: 'Failed to calculate analytics.' });
  }
});

export default router;
