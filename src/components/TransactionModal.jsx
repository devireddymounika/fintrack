import { useState } from 'react';
import { X } from 'lucide-react';
import { CATEGORIES, PAYMENT_METHODS } from '../context/initialData';
import { useFinance } from '../context/FinanceContext';

function TransactionModal({ isOpen, onClose, transactionToEdit = null }) {
  const { addTransaction, editTransaction, settings } = useFinance();

  const [type, setType] = useState(transactionToEdit?.type || 'expense');
  const [title, setTitle] = useState(transactionToEdit?.title || '');
  const [amount, setAmount] = useState(transactionToEdit?.amount || '');
  const [category, setCategory] = useState(
    transactionToEdit?.category || (transactionToEdit?.type === 'income' ? 'Salary' : 'Food & Dining')
  );
  const [date, setDate] = useState(transactionToEdit?.date || new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState(transactionToEdit?.paymentMethod || 'UPI');
  const [notes, setNotes] = useState(transactionToEdit?.notes || '');
  const [error, setError] = useState('');

  const handleTypeChange = (newType) => {
    setType(newType);
    if (newType === 'income') {
      setCategory(CATEGORIES.income[0]);
    } else {
      setCategory(CATEGORIES.expense[0]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please enter a description / title.');
      return;
    }
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid amount greater than 0.');
      return;
    }

    const payload = {
      title: title.trim(),
      amount: numAmount,
      type,
      category,
      date,
      paymentMethod,
      notes: notes.trim(),
    };

    if (transactionToEdit) {
      editTransaction(transactionToEdit.id, payload);
    } else {
      addTransaction(payload);
    }

    onClose();
  };

  if (!isOpen) return null;

  const currentCategories = type === 'income' ? CATEGORIES.income : CATEGORIES.expense;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{transactionToEdit ? 'Edit Transaction' : 'Add New Transaction'}</h3>
          <button className="icon-btn-close" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {error && <div className="form-error">{error}</div>}

          {/* Type Toggle */}
          <div className="type-toggle-group">
            <button
              type="button"
              className={`type-toggle-btn ${type === 'expense' ? 'active expense' : ''}`}
              onClick={() => handleTypeChange('expense')}
            >
              Expense
            </button>
            <button
              type="button"
              className={`type-toggle-btn ${type === 'income' ? 'active income' : ''}`}
              onClick={() => handleTypeChange('income')}
            >
              Income
            </button>
          </div>

          <div className="form-row">
            <div className="form-group flex-1">
              <label>Title / Merchant</label>
              <input
                type="text"
                placeholder="e.g. Swiggy, Apartment Rent, Salary"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
                required
              />
            </div>

            <div className="form-group w-36">
              <label>Amount ({settings.currency})</label>
              <input
                type="number"
                step="any"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group flex-1">
              <label>Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                {currentCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group flex-1">
              <label>Payment Method</label>
              <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                {PAYMENT_METHODS.map((pm) => (
                  <option key={pm} value={pm}>
                    {pm}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Notes / Memo (Optional)</label>
            <textarea
              rows="2"
              placeholder="Additional details, tax invoice ref, etc."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {transactionToEdit ? 'Save Changes' : 'Add Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TransactionModal;
