import { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Download,
  Plus,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency, formatDate } from '../utils/formatters';
import { exportToCSV } from '../utils/exportImport';
import ConfirmModal from '../components/ConfirmModal';

function Transactions({ onOpenAddTransaction, onEditTransaction }) {
  const { transactions, deleteTransaction, settings, searchQuery, setSearchQuery } = useFinance();

  const [typeFilter, setTypeFilter] = useState('all'); // all | income | expense
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dateRangeFilter, setDateRangeFilter] = useState('all'); // all | this_month | last_month
  const [sortBy, setSortBy] = useState('date-desc'); // date-desc | date-asc | amount-desc | amount-asc
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Deletion modal state
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  // Extract unique categories from current transactions
  const availableCategories = useMemo(() => {
    const set = new Set(transactions.map((t) => t.category).filter(Boolean));
    return Array.from(set).sort();
  }, [transactions]);

  // Filtering & Sorting
  const filteredTransactions = useMemo(() => {
    const now = new Date();
    const thisYearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastYearMonth = `${lastMonthDate.getFullYear()}-${String(lastMonthDate.getMonth() + 1).padStart(2, '0')}`;

    return transactions
      .filter((tx) => {
        // Search text
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesTitle = (tx.title || '').toLowerCase().includes(q);
          const matchesCat = (tx.category || '').toLowerCase().includes(q);
          const matchesNotes = (tx.notes || '').toLowerCase().includes(q);
          const matchesMethod = (tx.paymentMethod || '').toLowerCase().includes(q);
          if (!matchesTitle && !matchesCat && !matchesNotes && !matchesMethod) return false;
        }

        // Type filter
        if (typeFilter !== 'all' && tx.type !== typeFilter) return false;

        // Category filter
        if (categoryFilter !== 'all' && tx.category !== categoryFilter) return false;

        // Date range filter
        if (dateRangeFilter === 'this_month') {
          if (!tx.date || !tx.date.startsWith(thisYearMonth)) return false;
        } else if (dateRangeFilter === 'last_month') {
          if (!tx.date || !tx.date.startsWith(lastYearMonth)) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'date-desc') return new Date(b.date) - new Date(a.date);
        if (sortBy === 'date-asc') return new Date(a.date) - new Date(b.date);
        if (sortBy === 'amount-desc') return b.amount - a.amount;
        if (sortBy === 'amount-asc') return a.amount - b.amount;
        return 0;
      });
  }, [transactions, searchQuery, typeFilter, categoryFilter, dateRangeFilter, sortBy]);

  // Summary of filtered results
  const summary = useMemo(() => {
    let inc = 0;
    let exp = 0;
    filteredTransactions.forEach((t) => {
      if (t.type === 'income') inc += t.amount;
      else exp += t.amount;
    });
    return {
      count: filteredTransactions.length,
      income: inc,
      expense: exp,
      net: inc - exp,
    };
  }, [filteredTransactions]);

  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage) || 1;
  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredTransactions.slice(start, start + itemsPerPage);
  }, [filteredTransactions, currentPage]);

  const handleExport = () => {
    exportToCSV(filteredTransactions, `fintrack-transactions-${Date.now()}.csv`);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setTypeFilter('all');
    setCategoryFilter('all');
    setDateRangeFilter('all');
    setSortBy('date-desc');
    setCurrentPage(1);
  };

  const confirmDelete = () => {
    if (deleteTargetId) {
      deleteTransaction(deleteTargetId);
      setDeleteTargetId(null);
    }
  };

  return (
    <main className="transactions-page">
      <div className="page-heading">
        <div>
          <h1>Transactions</h1>
          <p>Monitor, search, and categorize your income and expenses.</p>
        </div>

        <div className="heading-actions-row">
          <button className="btn-secondary" onClick={handleExport} title="Export to CSV">
            <Download size={17} />
            <span>Export CSV</span>
          </button>
          <button className="primary-button" onClick={onOpenAddTransaction}>
            <Plus size={18} />
            <span>Add Transaction</span>
          </button>
        </div>
      </div>

      {/* Filter and Control Toolbar */}
      <div className="filter-toolbar">
        <div className="filter-group-row">
          {/* Search */}
          <div className="filter-search-box">
            <Search size={16} className="filter-icon" />
            <input
              type="text"
              placeholder="Filter by keyword..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
            {searchQuery && (
              <button className="clear-btn" onClick={() => setSearchQuery('')}>
                ×
              </button>
            )}
          </div>

          {/* Type Filter */}
          <div className="filter-select-wrapper">
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="all">All Types</option>
              <option value="income">Income Only</option>
              <option value="expense">Expenses Only</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="filter-select-wrapper">
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="all">All Categories</option>
              {availableCategories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range Filter */}
          <div className="filter-select-wrapper">
            <select
              value={dateRangeFilter}
              onChange={(e) => {
                setDateRangeFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="all">All Time</option>
              <option value="this_month">This Month</option>
              <option value="last_month">Last Month</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="filter-select-wrapper">
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="amount-desc">Amount: High to Low</option>
              <option value="amount-asc">Amount: Low to High</option>
            </select>
          </div>

          {(searchQuery || typeFilter !== 'all' || categoryFilter !== 'all' || dateRangeFilter !== 'all') && (
            <button className="reset-filter-btn" onClick={handleResetFilters}>
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Summary strip */}
      <div className="transactions-summary-strip">
        <div className="summary-pill">
          <span>Records:</span>
          <strong>{summary.count}</strong>
        </div>
        <div className="summary-pill">
          <span>Income:</span>
          <strong className="positive">+{formatCurrency(summary.income, settings.currency)}</strong>
        </div>
        <div className="summary-pill">
          <span>Expenses:</span>
          <strong className="negative">-{formatCurrency(summary.expense, settings.currency)}</strong>
        </div>
        <div className="summary-pill">
          <span>Net:</span>
          <strong className={summary.net >= 0 ? 'positive' : 'negative'}>
            {summary.net >= 0 ? '+' : ''}{formatCurrency(summary.net, settings.currency)}
          </strong>
        </div>
      </div>

      {/* Table Card */}
      <div className="content-card table-card">
        {paginatedTransactions.length === 0 ? (
          <div className="empty-state-view">
            <Filter size={36} />
            <h4>No transactions match your criteria</h4>
            <p>Try clearing your filters or add a new transaction.</p>
            <button className="btn-secondary" onClick={handleResetFilters}>
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="fintrack-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Transaction</th>
                  <th>Category</th>
                  <th>Method</th>
                  <th>Type</th>
                  <th className="text-right">Amount</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedTransactions.map((tx) => {
                  const isIncome = tx.type === 'income';
                  return (
                    <tr key={tx.id}>
                      <td className="cell-date">{formatDate(tx.date)}</td>
                      <td className="cell-title">
                        <div className="tx-title-wrapper">
                          <strong>{tx.title}</strong>
                          {tx.notes && <span className="tx-notes-preview">{tx.notes}</span>}
                        </div>
                      </td>
                      <td>
                        <span className="category-chip">{tx.category}</span>
                      </td>
                      <td className="cell-method">{tx.paymentMethod || '—'}</td>
                      <td>
                        <span className={`type-badge ${isIncome ? 'income' : 'expense'}`}>
                          {isIncome ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                          <span>{isIncome ? 'Income' : 'Expense'}</span>
                        </span>
                      </td>
                      <td className={`cell-amount text-right ${isIncome ? 'positive' : 'negative'}`}>
                        {isIncome ? '+' : '-'}{formatCurrency(tx.amount, settings.currency)}
                      </td>
                      <td className="cell-actions text-center">
                        <div className="action-buttons-group">
                          <button
                            className="action-icon-btn"
                            title="Edit"
                            onClick={() => onEditTransaction(tx)}
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            className="action-icon-btn delete"
                            title="Delete"
                            onClick={() => setDeleteTargetId(tx.id)}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination bar */}
        {totalPages > 1 && (
          <div className="pagination-bar">
            <span className="pagination-info">
              Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> ({filteredTransactions.length} items)
            </span>

            <div className="pagination-controls">
              <button
                className="btn-pagination"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft size={16} />
                <span>Prev</span>
              </button>

              <button
                className="btn-pagination"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              >
                <span>Next</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={confirmDelete}
        title="Delete Transaction"
        message="Are you sure you want to delete this transaction record? This will permanently remove it from your records."
        confirmText="Delete"
        danger={true}
      />
    </main>
  );
}

export default Transactions;
