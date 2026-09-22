import { useState } from 'react';
import { Plus, Edit2, Trash2, AlertTriangle } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency } from '../utils/formatters';
import BudgetModal from '../components/BudgetModal';
import ConfirmModal from '../components/ConfirmModal';

function Budgets() {
  const { budgets, categorySpendMap, deleteBudget, settings } = useFinance();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  // Aggregated totals
  const totalBudgeted = budgets.reduce((sum, b) => sum + Number(b.monthlyLimit || 0), 0);
  const totalSpentInBudgets = budgets.reduce((sum, b) => sum + (categorySpendMap[b.category] || 0), 0);
  const overallPercentage = totalBudgeted > 0 ? Math.round((totalSpentInBudgets / totalBudgeted) * 100) : 0;
  const remainingBudget = Math.max(0, totalBudgeted - totalSpentInBudgets);

  // Over budget categories
  const overBudgetCategories = budgets.filter((b) => {
    const spent = categorySpendMap[b.category] || 0;
    return spent > b.monthlyLimit;
  });

  const handleOpenAdd = () => {
    setEditingBudget(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (bg) => {
    setEditingBudget(bg);
    setIsModalOpen(true);
  };

  const confirmDelete = () => {
    if (deleteTargetId) {
      deleteBudget(deleteTargetId);
      setDeleteTargetId(null);
    }
  };

  return (
    <main className="budgets-page">
      <div className="page-heading">
        <div>
          <h1>Monthly Budgets</h1>
          <p>Plan your category limits, monitor real-time burn rates, and avoid overspending.</p>
        </div>

        <button className="primary-button" onClick={handleOpenAdd}>
          <Plus size={18} />
          <span>Set Budget</span>
        </button>
      </div>

      {/* Warning Alert if over budget */}
      {overBudgetCategories.length > 0 && (
        <div className="alert-banner warning-banner">
          <div className="alert-icon-col">
            <AlertTriangle size={20} />
          </div>
          <div className="alert-content-col">
            <strong>Budget Attention Needed!</strong>
            <p>
              You have exceeded limits in{' '}
              {overBudgetCategories.map((b) => `"${b.category}"`).join(', ')}. Consider adjusting
              spending or reallocating budget limits.
            </p>
          </div>
        </div>
      )}

      {/* Overview Stat Strip */}
      <section className="budgets-overview-card content-card">
        <div className="overview-stats-grid">
          <div className="overview-metric">
            <span className="metric-label">Total Allocated Budget</span>
            <h3 className="metric-val">{formatCurrency(totalBudgeted, settings.currency)}</h3>
            <span className="metric-sub">Across {budgets.length} categories</span>
          </div>

          <div className="overview-metric">
            <span className="metric-label">Total Month Spent</span>
            <h3 className="metric-val negative">{formatCurrency(totalSpentInBudgets, settings.currency)}</h3>
            <span className="metric-sub">{overallPercentage}% of total budget</span>
          </div>

          <div className="overview-metric">
            <span className="metric-label">Remaining Safe Spend</span>
            <h3 className="metric-val positive">{formatCurrency(remainingBudget, settings.currency)}</h3>
            <span className="metric-sub">For rest of the month</span>
          </div>
        </div>

        <div className="overall-progress-container">
          <div className="progress-label-row">
            <span>Overall Month Budget Utilization</span>
            <strong>{overallPercentage}%</strong>
          </div>
          <div className="progress-track large">
            <div
              className={`progress-fill ${
                overallPercentage > 100 ? 'danger' : overallPercentage > 80 ? 'warning' : 'healthy'
              }`}
              style={{ width: `${Math.min(100, overallPercentage)}%` }}
            />
          </div>
        </div>
      </section>

      {/* Category Budgets Grid */}
      <div className="budgets-grid">
        {budgets.map((bg) => {
          const spent = categorySpendMap[bg.category] || 0;
          const pct = Math.round((spent / bg.monthlyLimit) * 100);
          const isOver = spent > bg.monthlyLimit;
          const diff = Math.abs(bg.monthlyLimit - spent);
          const statusClass = isOver ? 'danger' : pct >= 80 ? 'warning' : 'healthy';

          return (
            <div key={bg.id} className={`content-card budget-card ${statusClass}`}>
              <div className="budget-card-top">
                <div className="budget-category-info">
                  <h4>{bg.category}</h4>
                  <span className={`budget-status-pill ${statusClass}`}>
                    {isOver ? 'Over Budget' : pct >= 80 ? 'Near Limit' : 'On Track'}
                  </span>
                </div>

                <div className="card-quick-actions">
                  <button
                    className="action-icon-btn"
                    title="Edit Limit"
                    onClick={() => handleOpenEdit(bg)}
                  >
                    <Edit2 size={15} />
                  </button>
                  <button
                    className="action-icon-btn delete"
                    title="Delete Budget"
                    onClick={() => setDeleteTargetId(bg.id)}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              <div className="budget-amounts-row">
                <div className="budget-spent-col">
                  <span className="label">Spent</span>
                  <strong>{formatCurrency(spent, settings.currency)}</strong>
                </div>

                <div className="budget-limit-col text-right">
                  <span className="label">Monthly Limit</span>
                  <span>{formatCurrency(bg.monthlyLimit, settings.currency)}</span>
                </div>
              </div>

              <div className="progress-track">
                <div
                  className={`progress-fill ${statusClass}`}
                  style={{ width: `${Math.min(100, pct)}%` }}
                />
              </div>

              <div className="budget-card-footer">
                <span className="budget-pct-text">
                  <strong>{pct}%</strong> used
                </span>
                <span className="budget-rem-text">
                  {isOver ? (
                    <span className="over-text">+{formatCurrency(diff, settings.currency)} over</span>
                  ) : (
                    <span>{formatCurrency(diff, settings.currency)} remaining</span>
                  )}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {isModalOpen && (
        <BudgetModal
          key={editingBudget ? editingBudget.id : 'new'}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingBudget(null);
          }}
          budgetToEdit={editingBudget}
        />
      )}

      <ConfirmModal
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={confirmDelete}
        title="Delete Budget"
        message="Are you sure you want to remove this category budget? Transactions under this category will not be deleted."
        confirmText="Delete"
        danger={true}
      />
    </main>
  );
}

export default Budgets;
