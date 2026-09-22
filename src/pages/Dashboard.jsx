import { useState } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Plus,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Clock,
  AlertCircle,
  Zap,
  ShieldCheck,
  Calendar,
} from 'lucide-react';
import '../utils/chartSetup';
import { getChartColors } from '../utils/chartSetup';
import StatCard from '../components/StatCard';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency, formatRelativeTime, getGreeting } from '../utils/formatters';

function Dashboard({ onOpenAddTransaction, onNavigate }) {
  const {
    totalIncome,
    totalExpenses,
    currentBalance,
    totalSavings,
    safeDailySpend,
    dailyAverageBurn,
    daysLeftInMonth,
    incomeChangePct,
    expenseChangePct,
    monthlyBreakdown,
    categoryBreakdown,
    transactions,
    budgets,
    categorySpendMap,
    settings,
    addTransaction,
  } = useFinance();

  const [selectedYear, setSelectedYear] = useState('2026');
  const [quickTitle, setQuickTitle] = useState('');
  const [quickAmount, setQuickAmount] = useState('');
  const [quickCategory, setQuickCategory] = useState('Food & Dining');
  const [quickSuccess, setQuickSuccess] = useState(false);
  const [quickLoading, setQuickLoading] = useState(false);

  const isDark = settings.theme !== 'light';
  const colors = getChartColors(isDark);

  // Income vs Expenses Bar Chart Data
  const barChartData = {
    labels: (monthlyBreakdown || []).map((m) => m.month),
    datasets: [
      {
        label: 'Income',
        data: (monthlyBreakdown || []).map((m) => m.income),
        backgroundColor: colors.incomeBarBg,
        borderColor: colors.incomeBar,
        borderWidth: 1.5,
        borderRadius: 6,
        barPercentage: 0.6,
        categoryPercentage: 0.6,
      },
      {
        label: 'Expenses',
        data: (monthlyBreakdown || []).map((m) => m.expenses),
        backgroundColor: colors.expenseBarBg,
        borderColor: colors.expenseBar,
        borderWidth: 1.5,
        borderRadius: 6,
        barPercentage: 0.6,
        categoryPercentage: 0.6,
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        align: 'end',
        labels: {
          color: colors.text,
          boxWidth: 12,
          usePointStyle: true,
          font: { family: 'inherit', size: 12 },
        },
      },
      tooltip: {
        backgroundColor: colors.tooltipBg,
        titleColor: colors.tooltipText,
        bodyColor: colors.tooltipText,
        borderColor: colors.tooltipBorder,
        borderWidth: 1,
        padding: 10,
        callbacks: {
          label: (context) => ` ${context.dataset.label}: ${formatCurrency(context.parsed.y, settings.currency)}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: colors.text, font: { family: 'inherit', size: 12 } },
      },
      y: {
        grid: { color: colors.grid },
        ticks: {
          color: colors.text,
          font: { family: 'inherit', size: 12 },
          callback: (value) => `${settings.currency}${value >= 1000 ? value / 1000 + 'k' : value}`,
        },
      },
    },
  };

  // Category Breakdown Doughnut Data
  const topCategories = (categoryBreakdown || []).slice(0, 5);
  const otherSum = (categoryBreakdown || []).slice(5).reduce((sum, c) => sum + c.amount, 0);
  const chartCategories = [...topCategories];
  if (otherSum > 0) {
    chartCategories.push({
      category: 'Other',
      amount: otherSum,
      percentage: totalExpenses > 0 ? Number(((otherSum / totalExpenses) * 100).toFixed(1)) : 0,
    });
  }

  const doughnutData = {
    labels: chartCategories.map((c) => c.category),
    datasets: [
      {
        data: chartCategories.map((c) => c.amount),
        backgroundColor: colors.categoryPalette.slice(0, chartCategories.length),
        borderColor: isDark ? '#1E293B' : '#FFFFFF',
        borderWidth: 2,
        hoverOffset: 6,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: colors.tooltipBg,
        titleColor: colors.tooltipText,
        bodyColor: colors.tooltipText,
        borderColor: colors.tooltipBorder,
        borderWidth: 1,
        padding: 10,
        callbacks: {
          label: (context) => ` ${context.label}: ${formatCurrency(context.parsed, settings.currency)}`,
        },
      },
    },
  };

  // Quick Daily Expense Presets
  const presets = [
    { title: 'Chai & Snacks', amount: 40, category: 'Food & Dining', icon: '☕' },
    { title: 'Daily Lunch', amount: 180, category: 'Food & Dining', icon: '🍱' },
    { title: 'Auto / Metro', amount: 80, category: 'Transport', icon: '🚕' },
    { title: 'Fresh Veggies', amount: 250, category: 'Groceries', icon: '🥦' },
  ];

  const handleApplyPreset = (p) => {
    setQuickTitle(p.title);
    setQuickAmount(p.amount);
    setQuickCategory(p.category);
  };

  const handleQuickLog = async (e) => {
    e.preventDefault();
    if (!quickTitle.trim() || !quickAmount) return;
    setQuickLoading(true);

    try {
      await addTransaction({
        title: quickTitle.trim(),
        amount: parseFloat(quickAmount),
        type: 'expense',
        category: quickCategory,
        date: new Date().toISOString().split('T')[0],
        paymentMethod: 'UPI',
        notes: 'Logged via Quick Daily Expense',
      });

      setQuickTitle('');
      setQuickAmount('');
      setQuickSuccess(true);
      setTimeout(() => setQuickSuccess(false), 2500);
    } catch (err) {
      alert(err.message || 'Failed to log quick expense.');
    } finally {
      setQuickLoading(false);
    }
  };

  // Recent Transactions (top 5)
  const recentTransactions = (transactions || []).slice(0, 5);

  return (
    <main className="dashboard">
      <div className="page-heading">
        <div>
          <h1>{getGreeting(settings.userName)}</h1>
          <p>Real-time personal finance & daily spend analytics powered by PostgreSQL.</p>
        </div>

        <button className="primary-button" onClick={onOpenAddTransaction}>
          <Plus size={18} />
          <span>Add Transaction</span>
        </button>
      </div>

      {/* 4 Stat Cards */}
      <section className="stats-grid">
        <StatCard
          title="Total Income"
          amount={formatCurrency(totalIncome, settings.currency)}
          change={incomeChangePct !== undefined ? incomeChangePct : 12.5}
          type="income"
          icon="↗"
        />

        <StatCard
          title="Total Expenses"
          amount={formatCurrency(totalExpenses, settings.currency)}
          change={expenseChangePct !== undefined ? expenseChangePct : -4.2}
          type="expense"
          icon="↘"
        />

        <StatCard
          title="Current Balance"
          amount={formatCurrency(currentBalance, settings.currency)}
          change={8.4}
          type="balance"
          icon={settings.currency}
        />

        <StatCard
          title="Savings"
          amount={formatCurrency(totalSavings, settings.currency)}
          change={15.8}
          type="savings"
          icon="★"
        />
      </section>

      {/* Daily Safe Spend & Quick Expense Strip */}
      <section className="dashboard-daily-flow-grid">
        {/* Safe Daily Spend Indicator */}
        <div className="content-card daily-safe-card">
          <div className="daily-safe-header">
            <div className="daily-safe-icon">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h4>Calculated Safe Daily Spend</h4>
              <span className="daily-safe-sub">Based on remaining budget & days left in month</span>
            </div>
          </div>

          <div className="daily-safe-metric">
            <h2 className="positive">{formatCurrency(safeDailySpend, settings.currency)}</h2>
            <span className="daily-safe-unit">/ day</span>
          </div>

          <div className="daily-safe-meta">
            <div className="meta-pill">
              <Calendar size={13} />
              <span>{daysLeftInMonth} days left this month</span>
            </div>
            <div className="meta-pill">
              <Zap size={13} />
              <span>Avg burn: {formatCurrency(dailyAverageBurn, settings.currency)}/day</span>
            </div>
          </div>
        </div>

        {/* Quick Daily Expense Entry */}
        <div className="content-card quick-expense-card">
          <div className="card-heading">
            <div>
              <h3>Quick Log Daily Expense</h3>
              <p>Record small everyday spends in 2 clicks</p>
            </div>
            {quickSuccess && <span className="quick-success-badge">✓ Saved to Database!</span>}
          </div>

          <div className="quick-presets-row">
            {presets.map((p) => (
              <button
                key={p.title}
                type="button"
                className="preset-btn"
                onClick={() => handleApplyPreset(p)}
              >
                <span>{p.icon}</span>
                <span>{p.title}</span>
                <strong>({formatCurrency(p.amount, settings.currency)})</strong>
              </button>
            ))}
          </div>

          <form onSubmit={handleQuickLog} className="quick-expense-form">
            <input
              type="text"
              placeholder="Expense title (e.g. Chai, Lunch)"
              value={quickTitle}
              onChange={(e) => setQuickTitle(e.target.value)}
              required
            />
            <div className="quick-amount-wrapper">
              <span className="currency-prefix">{settings.currency}</span>
              <input
                type="number"
                step="any"
                placeholder="Amount"
                value={quickAmount}
                onChange={(e) => setQuickAmount(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="primary-button quick-submit-btn" disabled={quickLoading}>
              <Plus size={16} />
              <span>{quickLoading ? 'Saving...' : 'Log'}</span>
            </button>
          </form>
        </div>
      </section>

      {/* Main Charts Section */}
      <section className="dashboard-grid">
        {/* Income vs Expenses Chart */}
        <div className="chart-card">
          <div className="card-heading">
            <div>
              <h3>Income vs Expenses</h3>
              <p>Monthly financial overview</p>
            </div>

            <div className="card-actions-right">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="select-filter"
              >
                <option value="2026">2026</option>
                <option value="2025">2025</option>
              </select>
            </div>
          </div>

          <div className="chart-wrapper">
            <Bar data={barChartData} options={barChartOptions} />
          </div>
        </div>

        {/* Expenses by Category */}
        <div className="chart-card">
          <div className="card-heading">
            <div>
              <h3>Expense Categories</h3>
              <p>Where your money goes</p>
            </div>
            <button className="text-link-btn" onClick={() => onNavigate('budgets')}>
              Budgets
            </button>
          </div>

          <div className="category-chart-layout">
            <div className="doughnut-chart-wrapper">
              {chartCategories.length > 0 ? (
                <Doughnut data={doughnutData} options={doughnutOptions} />
              ) : (
                <div className="empty-chart-msg">No expense data recorded</div>
              )}
            </div>

            <div className="category-legend-list">
              {chartCategories.slice(0, 4).map((item, idx) => (
                <div key={item.category} className="legend-row">
                  <div className="legend-label-col">
                    <span
                      className="legend-dot"
                      style={{ backgroundColor: colors.categoryPalette[idx] }}
                    />
                    <span className="legend-name">{item.category}</span>
                  </div>
                  <div className="legend-values-col">
                    <strong>{formatCurrency(item.amount, settings.currency)}</strong>
                    <span className="legend-percent">{item.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Bottom Section: Recent Transactions & Budget Health */}
      <section className="dashboard-bottom-grid">
        {/* Recent Transactions List */}
        <div className="content-card recent-transactions-card">
          <div className="card-heading">
            <div>
              <h3>Recent Transactions</h3>
              <p>Latest activity logged into database</p>
            </div>

            <button className="view-all-btn" onClick={() => onNavigate('transactions')}>
              <span>View All</span>
              <ArrowRight size={16} />
            </button>
          </div>

          <div className="recent-list">
            {recentTransactions.length === 0 ? (
              <div className="empty-list-placeholder">
                <Clock size={28} />
                <p>No transactions yet</p>
                <button className="btn-secondary" onClick={onOpenAddTransaction}>
                  Add your first transaction
                </button>
              </div>
            ) : (
              recentTransactions.map((tx) => {
                const isIncome = tx.type === 'income';
                return (
                  <div key={tx.id} className="recent-tx-item">
                    <div className="tx-item-left">
                      <div className={`tx-type-badge ${isIncome ? 'income' : 'expense'}`}>
                        {isIncome ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                      </div>
                      <div className="tx-info">
                        <strong>{tx.title}</strong>
                        <div className="tx-meta">
                          <span className="tx-category">{tx.category}</span>
                          <span className="bullet-sep">•</span>
                          <span className="tx-method">{tx.paymentMethod}</span>
                          <span className="bullet-sep">•</span>
                          <span className="tx-date">{formatRelativeTime(tx.date)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="tx-item-right">
                      <span className={`tx-amount ${isIncome ? 'positive' : 'negative'}`}>
                        {isIncome ? '+' : '-'}{formatCurrency(tx.amount, settings.currency)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Budget Health Pulse */}
        <div className="content-card budget-pulse-card">
          <div className="card-heading">
            <div>
              <h3>Monthly Budget Health</h3>
              <p>Current spend vs set limits</p>
            </div>
            <button className="view-all-btn" onClick={() => onNavigate('budgets')}>
              <span>Manage</span>
              <ArrowRight size={16} />
            </button>
          </div>

          <div className="budget-pulse-list">
            {(budgets || []).slice(0, 4).map((bg) => {
              const spent = (categorySpendMap || {})[bg.category] || 0;
              const pct = Math.min(100, Math.round((spent / bg.monthlyLimit) * 100));
              const isOver = spent > bg.monthlyLimit;
              const statusClass = isOver ? 'danger' : pct > 80 ? 'warning' : 'healthy';

              return (
                <div key={bg.id} className="budget-pulse-item">
                  <div className="budget-pulse-header">
                    <span className="budget-pulse-name">{bg.category}</span>
                    <span className="budget-pulse-numbers">
                      <strong>{formatCurrency(spent, settings.currency)}</strong>
                      <span className="budget-limit"> / {formatCurrency(bg.monthlyLimit, settings.currency)}</span>
                    </span>
                  </div>

                  <div className="progress-track">
                    <div
                      className={`progress-fill ${statusClass}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <div className="budget-pulse-footer">
                    <span className={`budget-status-tag ${statusClass}`}>
                      {isOver ? (
                        <>
                          <AlertCircle size={12} /> Over Budget by {formatCurrency(spent - bg.monthlyLimit, settings.currency)}
                        </>
                      ) : (
                        `${pct}% utilized`
                      )}
                    </span>
                    <span className="remaining-text">
                      {isOver ? '0 remaining' : `${formatCurrency(bg.monthlyLimit - spent, settings.currency)} left`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}

export default Dashboard;