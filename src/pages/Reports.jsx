import { Line, Bar } from 'react-chartjs-2';
import { Download, Activity, DollarSign, Award, ArrowDownRight } from 'lucide-react';
import '../utils/chartSetup';
import { getChartColors } from '../utils/chartSetup';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency } from '../utils/formatters';
import { exportToCSV } from '../utils/exportImport';

function Reports() {
  const {
    monthlyBreakdown,
    categoryBreakdown,
    transactions,
    totalIncome,
    totalExpenses,
    currentBalance,
    settings,
  } = useFinance();

  const isDark = settings.theme !== 'light';
  const colors = getChartColors(isDark);

  // Financial Health Metrics
  const savingsRate = totalIncome > 0 ? Math.max(0, Math.round((currentBalance / totalIncome) * 100)) : 0;
  const dailyAverageSpend = Math.round(totalExpenses / 30);
  const expenseTransactions = transactions.filter((t) => t.type === 'expense');
  const largestExpense = expenseTransactions.length > 0
    ? expenseTransactions.reduce((max, t) => (t.amount > max.amount ? t : max), expenseTransactions[0])
    : null;

  // Multi-line Cash Flow Trend
  const trendLineData = {
    labels: monthlyBreakdown.map((m) => m.month),
    datasets: [
      {
        label: 'Income',
        data: monthlyBreakdown.map((m) => m.income),
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.35,
        fill: true,
        pointBackgroundColor: '#10B981',
        pointRadius: 4,
      },
      {
        label: 'Expenses',
        data: monthlyBreakdown.map((m) => m.expenses),
        borderColor: '#EF4444',
        backgroundColor: 'rgba(239, 68, 68, 0.08)',
        tension: 0.35,
        fill: true,
        pointBackgroundColor: '#EF4444',
        pointRadius: 4,
      },
      {
        label: 'Net Balance',
        data: monthlyBreakdown.map((m) => m.balance),
        borderColor: '#6366F1',
        borderDash: [5, 5],
        tension: 0.35,
        fill: false,
        pointBackgroundColor: '#6366F1',
        pointRadius: 4,
      },
    ],
  };

  const trendLineOptions = {
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
        grid: { color: colors.grid },
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

  // Category horizontal Bar chart
  const categoryChartData = {
    labels: categoryBreakdown.slice(0, 6).map((c) => c.category),
    datasets: [
      {
        label: 'Spending',
        data: categoryBreakdown.slice(0, 6).map((c) => c.amount),
        backgroundColor: colors.categoryPalette.slice(0, 6),
        borderRadius: 4,
      },
    ],
  };

  const categoryChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
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
          label: (context) => ` ${formatCurrency(context.parsed.x, settings.currency)}`,
        },
      },
    },
    scales: {
      x: {
        grid: { color: colors.grid },
        ticks: {
          color: colors.text,
          callback: (val) => `${settings.currency}${val >= 1000 ? val / 1000 + 'k' : val}`,
        },
      },
      y: {
        grid: { display: false },
        ticks: { color: colors.text },
      },
    },
  };

  const handleExportTransactions = () => {
    exportToCSV(transactions, `fintrack-all-transactions-${Date.now()}.csv`);
  };

  return (
    <main className="reports-page">
      <div className="page-heading">
        <div>
          <h1>Financial Reports & Analytics</h1>
          <p>Gain deep visibility into your cash flow trends, savings velocity, and spending habits.</p>
        </div>

        <button className="btn-secondary" onClick={handleExportTransactions}>
          <Download size={17} />
          <span>Export Full Ledger</span>
        </button>
      </div>

      {/* KPI Cards */}
      <section className="reports-kpi-grid">
        <div className="content-card kpi-card">
          <div className="kpi-icon-box positive">
            <Award size={20} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Current Savings Rate</span>
            <h3>{savingsRate}%</h3>
            <span className="kpi-sub">Of this month's income retained</span>
          </div>
        </div>

        <div className="content-card kpi-card">
          <div className="kpi-icon-box warning">
            <Activity size={20} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Average Daily Burn</span>
            <h3>{formatCurrency(dailyAverageSpend, settings.currency)}</h3>
            <span className="kpi-sub">Across 30-day projection</span>
          </div>
        </div>

        <div className="content-card kpi-card">
          <div className="kpi-icon-box danger">
            <ArrowDownRight size={20} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Largest Single Expense</span>
            <h3>{largestExpense ? formatCurrency(largestExpense.amount, settings.currency) : '—'}</h3>
            <span className="kpi-sub">{largestExpense ? largestExpense.title : 'No expense recorded'}</span>
          </div>
        </div>

        <div className="content-card kpi-card">
          <div className="kpi-icon-box neutral">
            <DollarSign size={20} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Total Transactions Logged</span>
            <h3>{transactions.length}</h3>
            <span className="kpi-sub">Across all accounts</span>
          </div>
        </div>
      </section>

      {/* 6-Month Cash Flow Trend */}
      <section className="content-card report-chart-card">
        <div className="card-heading">
          <div>
            <h3>Cash Flow Trajectory (Past 6 Months)</h3>
            <p>Compare income inflows, expense outflows, and net capital growth</p>
          </div>
        </div>

        <div className="chart-wrapper line-chart-wrapper">
          <Line data={trendLineData} options={trendLineOptions} />
        </div>
      </section>

      {/* Category Spend Distribution & Detailed Breakdown Table */}
      <section className="reports-two-col-grid">
        <div className="content-card">
          <div className="card-heading">
            <div>
              <h3>Category Spend Distribution</h3>
              <p>Top expense categories this month</p>
            </div>
          </div>

          <div className="chart-wrapper category-bar-wrapper">
            <Bar data={categoryChartData} options={categoryChartOptions} />
          </div>
        </div>

        <div className="content-card">
          <div className="card-heading">
            <div>
              <h3>Spending Share Table</h3>
              <p>Proportion of total monthly expenses</p>
            </div>
          </div>

          <div className="table-responsive">
            <table className="fintrack-table compact">
              <thead>
                <tr>
                  <th>Category</th>
                  <th className="text-right">Total Spent</th>
                  <th className="text-right">Share (%)</th>
                </tr>
              </thead>
              <tbody>
                {categoryBreakdown.map((item, idx) => (
                  <tr key={item.category}>
                    <td>
                      <div className="category-cell-row">
                        <span
                          className="legend-dot"
                          style={{
                            backgroundColor: colors.categoryPalette[idx % colors.categoryPalette.length],
                          }}
                        />
                        <strong>{item.category}</strong>
                      </div>
                    </td>
                    <td className="text-right">
                      <strong>{formatCurrency(item.amount, settings.currency)}</strong>
                    </td>
                    <td className="text-right">{item.percentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Reports;
