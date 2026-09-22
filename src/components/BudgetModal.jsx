import { useState } from 'react';
import { X } from 'lucide-react';
import { CATEGORIES } from '../context/initialData';
import { useFinance } from '../context/FinanceContext';

function BudgetModal({ isOpen, onClose, budgetToEdit = null }) {
  const { addBudget, editBudget, budgets, settings } = useFinance();

  const getInitialCategory = () => {
    if (budgetToEdit) return budgetToEdit.category;
    const existingCategories = budgets.map((b) => b.category);
    const available = CATEGORIES.expense.find((c) => !existingCategories.includes(c));
    return available || CATEGORIES.expense[0];
  };

  const [category, setCategory] = useState(getInitialCategory);
  const [monthlyLimit, setMonthlyLimit] = useState(() => (budgetToEdit ? budgetToEdit.monthlyLimit : ''));
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const limit = parseFloat(monthlyLimit);
    if (isNaN(limit) || limit <= 0) {
      setError('Please enter a valid budget limit greater than 0.');
      return;
    }

    if (!budgetToEdit) {
      const exists = budgets.some((b) => b.category.toLowerCase() === category.toLowerCase());
      if (exists) {
        setError(`A budget for "${category}" already exists. Edit that budget instead.`);
        return;
      }
      addBudget({
        category,
        monthlyLimit: limit,
      });
    } else {
      editBudget(budgetToEdit.id, {
        category,
        monthlyLimit: limit,
      });
    }

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{budgetToEdit ? 'Edit Budget' : 'Set Category Budget'}</h3>
          <button className="icon-btn-close" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {error && <div className="form-error">{error}</div>}

          <div className="form-group">
            <label>Expense Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={!!budgetToEdit}
            >
              {CATEGORIES.expense.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Monthly Spending Limit ({settings.currency})</label>
            <input
              type="number"
              step="any"
              placeholder="e.g. 15000"
              value={monthlyLimit}
              onChange={(e) => setMonthlyLimit(e.target.value)}
              autoFocus
              required
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {budgetToEdit ? 'Update Budget' : 'Save Budget'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default BudgetModal;
