import { useState } from 'react';
import { X } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';

function SavingsModal({ isOpen, onClose, goalToEdit = null, mode = 'create' }) {
  // mode: 'create' | 'edit' | 'adjust'
  const { addSavingsGoal, updateSavingsGoal, adjustSavingsGoalAmount, settings } = useFinance();

  const [title, setTitle] = useState(() => goalToEdit?.title || '');
  const [targetAmount, setTargetAmount] = useState(() => goalToEdit?.targetAmount || '');
  const [currentAmount, setCurrentAmount] = useState(() => goalToEdit?.currentAmount || '');
  const [targetDate, setTargetDate] = useState(() => goalToEdit?.targetDate || '');
  const [category, setCategory] = useState(() => goalToEdit?.category || 'Personal');
  const [icon, setIcon] = useState(() => goalToEdit?.icon || '🎯');

  // For adjust mode (Deposit / Withdraw)
  const [adjustType, setAdjustType] = useState('deposit');
  const [adjustAmount, setAdjustAmount] = useState('');
  const [error, setError] = useState('');

  const icons = ['🎯', '🛡️', '🏖️', '💻', '🚗', '🏠', '💍', '🎓', '👶', '📈'];

  const handleSubmit = (e) => {
    e.preventDefault();

    if (mode === 'adjust') {
      const amt = parseFloat(adjustAmount);
      if (isNaN(amt) || amt <= 0) {
        setError('Please enter a valid amount greater than 0.');
        return;
      }
      const delta = adjustType === 'deposit' ? amt : -amt;
      adjustSavingsGoalAmount(goalToEdit.id, delta);
      onClose();
      return;
    }

    if (!title.trim()) {
      setError('Please provide a goal title.');
      return;
    }
    const target = parseFloat(targetAmount);
    if (isNaN(target) || target <= 0) {
      setError('Please enter a valid target amount.');
      return;
    }

    const current = parseFloat(currentAmount) || 0;

    const payload = {
      title: title.trim(),
      targetAmount: target,
      currentAmount: current,
      targetDate: targetDate || '',
      category,
      icon,
    };

    if (mode === 'edit' && goalToEdit) {
      updateSavingsGoal(goalToEdit.id, payload);
    } else {
      addSavingsGoal(payload);
    }

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>
            {mode === 'adjust'
              ? `Update Funds: ${goalToEdit?.title}`
              : mode === 'edit'
              ? 'Edit Savings Goal'
              : 'Create New Savings Goal'}
          </h3>
          <button className="icon-btn-close" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {error && <div className="form-error">{error}</div>}

          {mode === 'adjust' ? (
            <>
              <div className="type-toggle-group">
                <button
                  type="button"
                  className={`type-toggle-btn ${adjustType === 'deposit' ? 'active income' : ''}`}
                  onClick={() => setAdjustType('deposit')}
                >
                  + Add Deposit
                </button>
                <button
                  type="button"
                  className={`type-toggle-btn ${adjustType === 'withdraw' ? 'active expense' : ''}`}
                  onClick={() => setAdjustType('withdraw')}
                >
                  - Withdraw
                </button>
              </div>

              <div className="form-group">
                <label>Amount ({settings.currency})</label>
                <input
                  type="number"
                  step="any"
                  placeholder="e.g. 5000"
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(e.target.value)}
                  autoFocus
                  required
                />
              </div>

              <p className="modal-hint">
                Current saved:{' '}
                <strong>
                  {settings.currency}
                  {goalToEdit?.currentAmount?.toLocaleString()}
                </strong>{' '}
                of {settings.currency}
                {goalToEdit?.targetAmount?.toLocaleString()}
              </p>
            </>
          ) : (
            <>
              <div className="form-group">
                <label>Goal Name</label>
                <input
                  type="text"
                  placeholder="e.g. Emergency Fund, Goa Trip, New Car"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  autoFocus
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group flex-1">
                  <label>Target Amount ({settings.currency})</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="100000"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group flex-1">
                  <label>Initial Saved ({settings.currency})</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="0"
                    value={currentAmount}
                    onChange={(e) => setCurrentAmount(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group flex-1">
                  <label>Target Date</label>
                  <input
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                  />
                </div>

                <div className="form-group flex-1">
                  <label>Category / Tag</label>
                  <input
                    type="text"
                    placeholder="e.g. Travel, Tech, Safety"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Choose Icon</label>
                <div className="icon-selector-grid">
                  {icons.map((ic) => (
                    <button
                      key={ic}
                      type="button"
                      className={`icon-choice-btn ${icon === ic ? 'selected' : ''}`}
                      onClick={() => setIcon(ic)}
                    >
                      {ic}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {mode === 'adjust' ? 'Confirm Update' : mode === 'edit' ? 'Save Changes' : 'Create Goal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SavingsModal;
