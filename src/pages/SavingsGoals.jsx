import { useState } from 'react';
import { Plus, Edit2, Trash2, ArrowUpRight, CheckCircle, Calendar } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency, formatDate } from '../utils/formatters';
import SavingsModal from '../components/SavingsModal';
import ConfirmModal from '../components/ConfirmModal';

function SavingsGoals() {
  const { savingsGoals, deleteSavingsGoal, settings } = useFinance();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // create | edit | adjust
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  // Overall statistics
  const totalTarget = savingsGoals.reduce((sum, g) => sum + Number(g.targetAmount || 0), 0);
  const totalSaved = savingsGoals.reduce((sum, g) => sum + Number(g.currentAmount || 0), 0);
  const totalPercentage = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;

  const handleOpenAdd = () => {
    setSelectedGoal(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (goal) => {
    setSelectedGoal(goal);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleOpenAdjust = (goal) => {
    setSelectedGoal(goal);
    setModalMode('adjust');
    setIsModalOpen(true);
  };

  const confirmDelete = () => {
    if (deleteTargetId) {
      deleteSavingsGoal(deleteTargetId);
      setDeleteTargetId(null);
    }
  };

  const getDaysRemaining = (targetDate) => {
    if (!targetDate) return null;
    const target = new Date(targetDate);
    const today = new Date();
    const diffTime = target - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <main className="savings-page">
      <div className="page-heading">
        <div>
          <h1>Savings Goals</h1>
          <p>Allocate funds toward dream vacations, safety cushions, and milestone purchases.</p>
        </div>

        <button className="primary-button" onClick={handleOpenAdd}>
          <Plus size={18} />
          <span>New Goal</span>
        </button>
      </div>

      {/* Top Aggregated Banner */}
      <section className="content-card savings-summary-card">
        <div className="overview-stats-grid">
          <div className="overview-metric">
            <span className="metric-label">Total Stashed Savings</span>
            <h3 className="metric-val positive">{formatCurrency(totalSaved, settings.currency)}</h3>
            <span className="metric-sub">Across {savingsGoals.length} active goals</span>
          </div>

          <div className="overview-metric">
            <span className="metric-label">Total Target Ambition</span>
            <h3 className="metric-val">{formatCurrency(totalTarget, settings.currency)}</h3>
            <span className="metric-sub">All active aspirations</span>
          </div>

          <div className="overview-metric">
            <span className="metric-label">Overall Progress</span>
            <h3 className="metric-val">{totalPercentage}%</h3>
            <span className="metric-sub">{formatCurrency(Math.max(0, totalTarget - totalSaved), settings.currency)} to go</span>
          </div>
        </div>

        <div className="overall-progress-container">
          <div className="progress-track large">
            <div
              className="progress-fill healthy"
              style={{ width: `${Math.min(100, totalPercentage)}%` }}
            />
          </div>
        </div>
      </section>

      {/* Goals Cards Grid */}
      <div className="savings-grid">
        {savingsGoals.map((goal) => {
          const current = Number(goal.currentAmount) || 0;
          const target = Number(goal.targetAmount) || 1;
          const pct = Math.min(100, Math.round((current / target) * 100));
          const isCompleted = current >= target;
          const daysLeft = getDaysRemaining(goal.targetDate);

          return (
            <div key={goal.id} className={`content-card savings-card ${isCompleted ? 'completed' : ''}`}>
              <div className="savings-card-header">
                <div className="goal-icon-and-title">
                  <div className="goal-emoji-box">{goal.icon || '🎯'}</div>
                  <div>
                    <h4>{goal.title}</h4>
                    {goal.category && <span className="category-chip">{goal.category}</span>}
                  </div>
                </div>

                <div className="card-quick-actions">
                  <button
                    className="action-icon-btn"
                    title="Edit Goal"
                    onClick={() => handleOpenEdit(goal)}
                  >
                    <Edit2 size={15} />
                  </button>
                  <button
                    className="action-icon-btn delete"
                    title="Delete Goal"
                    onClick={() => setDeleteTargetId(goal.id)}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              <div className="savings-metrics-box">
                <div className="savings-current">
                  <span className="label">Current Saved</span>
                  <strong className="positive">{formatCurrency(current, settings.currency)}</strong>
                </div>

                <div className="savings-target text-right">
                  <span className="label">Target</span>
                  <span>{formatCurrency(target, settings.currency)}</span>
                </div>
              </div>

              {/* Progress */}
              <div className="progress-track">
                <div
                  className={`progress-fill ${isCompleted ? 'completed' : 'healthy'}`}
                  style={{ width: `${pct}%` }}
                />
              </div>

              <div className="savings-card-footer">
                <span className="pct-badge">
                  {isCompleted ? (
                    <span className="completed-label">
                      <CheckCircle size={14} /> Reached 100%!
                    </span>
                  ) : (
                    `${pct}% reached`
                  )}
                </span>

                {goal.targetDate && (
                  <span className="target-date-label">
                    <Calendar size={13} />
                    {daysLeft !== null
                      ? daysLeft > 0
                        ? `${daysLeft} days left`
                        : 'Target date passed'
                      : formatDate(goal.targetDate)}
                  </span>
                )}
              </div>

              {/* Actions row: Deposit / Withdraw */}
              <div className="savings-actions-row">
                <button
                  className="btn-secondary flex-1"
                  onClick={() => handleOpenAdjust(goal)}
                >
                  <ArrowUpRight size={15} />
                  <span>Update Funds</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {isModalOpen && (
        <SavingsModal
          key={selectedGoal ? `${selectedGoal.id}-${modalMode}` : `new-${modalMode}`}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedGoal(null);
          }}
          goalToEdit={selectedGoal}
          mode={modalMode}
        />
      )}

      <ConfirmModal
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={confirmDelete}
        title="Delete Savings Goal"
        message="Are you sure you want to delete this savings goal? Any funds tracked here will simply be removed from goal totals."
        confirmText="Delete"
        danger={true}
      />
    </main>
  );
}

export default SavingsGoals;
