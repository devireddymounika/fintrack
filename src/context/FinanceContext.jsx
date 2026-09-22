import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

const FinanceContext = createContext(null);

export function FinanceProvider({ children }) {
  const { user, updateProfile, isAuthenticated } = useAuth();

  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [savingsGoals, setSavingsGoals] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [analytics, setAnalytics] = useState({
    summary: {
      totalIncome: 0,
      totalExpenses: 0,
      currentBalance: 0,
      totalSavings: 0,
      incomeChangePct: 0,
      expenseChangePct: 0,
      safeDailySpend: 0,
      dailyAverageBurn: 0,
      daysLeftInMonth: 1,
      remainingBudget: 0,
      totalBudgetLimit: 0,
    },
    categoryBreakdown: [],
    categorySpendMap: {},
    monthlyBreakdown: [],
    recentTransactions: [],
  });

  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch all user data from PostgreSQL via backend API
  const refreshData = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    try {
      const [txRes, bgRes, sgRes, notifRes, analyticsRes] = await Promise.all([
        api.getTransactions(),
        api.getBudgets(),
        api.getSavingsGoals(),
        api.getNotifications(),
        api.getDashboardAnalytics(),
      ]);

      if (txRes?.transactions) setTransactions(txRes.transactions);
      if (bgRes?.budgets) setBudgets(bgRes.budgets);
      if (sgRes?.goals) setSavingsGoals(sgRes.goals);
      if (notifRes?.notifications) setNotifications(notifRes.notifications);
      if (analyticsRes) setAnalytics(analyticsRes);
    } catch (err) {
      console.error('Failed to sync finance data with PostgreSQL:', err.message);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      refreshData();
    } else {
      setTransactions([]);
      setBudgets([]);
      setSavingsGoals([]);
      setNotifications([]);
    }
  }, [isAuthenticated, refreshData]);

  // Derived settings object for views
  const settings = {
    userName: user?.name || 'Mounika',
    accountType: user?.accountType || 'Personal Account',
    currency: user?.currency || '₹',
    theme: user?.theme || 'dark',
    monthlyIncomeGoal: user?.monthlyIncomeGoal || 80000,
  };

  // CRUD Actions connected to API
  const addTransaction = async (tx) => {
    try {
      await api.createTransaction(tx);
      await refreshData();
    } catch (err) {
      console.error('Error adding transaction:', err);
      throw err;
    }
  };

  const editTransaction = async (id, updated) => {
    try {
      await api.updateTransaction(id, updated);
      await refreshData();
    } catch (err) {
      console.error('Error updating transaction:', err);
      throw err;
    }
  };

  const deleteTransaction = async (id) => {
    try {
      await api.deleteTransaction(id);
      await refreshData();
    } catch (err) {
      console.error('Error deleting transaction:', err);
      throw err;
    }
  };

  const addBudget = async (bg) => {
    try {
      await api.saveBudget(bg);
      await refreshData();
    } catch (err) {
      console.error('Error adding budget:', err);
      throw err;
    }
  };

  const editBudget = async (id, updated) => {
    try {
      await api.updateBudget(id, updated);
      await refreshData();
    } catch (err) {
      console.error('Error editing budget:', err);
      throw err;
    }
  };

  const deleteBudget = async (id) => {
    try {
      await api.deleteBudget(id);
      await refreshData();
    } catch (err) {
      console.error('Error deleting budget:', err);
      throw err;
    }
  };

  const addSavingsGoal = async (goal) => {
    try {
      await api.createSavingsGoal(goal);
      await refreshData();
    } catch (err) {
      console.error('Error creating savings goal:', err);
      throw err;
    }
  };

  const updateSavingsGoal = async (id, updated) => {
    try {
      await api.updateSavingsGoal(id, updated);
      await refreshData();
    } catch (err) {
      console.error('Error updating savings goal:', err);
      throw err;
    }
  };

  const adjustSavingsGoalAmount = async (id, delta) => {
    try {
      await api.adjustSavingsGoal(id, delta);
      await refreshData();
    } catch (err) {
      console.error('Error adjusting savings funds:', err);
      throw err;
    }
  };

  const deleteSavingsGoal = async (id) => {
    try {
      await api.deleteSavingsGoal(id);
      await refreshData();
    } catch (err) {
      console.error('Error deleting savings goal:', err);
      throw err;
    }
  };

  const updateSettings = async (newSettings) => {
    try {
      await updateProfile(newSettings);
    } catch (err) {
      console.error('Error updating profile:', err);
      throw err;
    }
  };

  const toggleTheme = async () => {
    const nextTheme = settings.theme === 'dark' ? 'light' : 'dark';
    try {
      await updateProfile({ theme: nextTheme });
    } catch (err) {
      console.error('Error toggling theme:', err);
    }
  };

  const markNotificationRead = async (id) => {
    try {
      await api.markNotificationRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    } catch (err) {
      console.error('Error marking notification read:', err);
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error('Error marking all notifications read:', err);
    }
  };

  const clearAllNotifications = async () => {
    try {
      await api.clearNotifications();
      setNotifications([]);
    } catch (err) {
      console.error('Error clearing notifications:', err);
    }
  };

  const value = {
    transactions,
    budgets,
    savingsGoals,
    notifications,
    settings,
    searchQuery,
    setSearchQuery,
    isLoading,
    refreshData,
    // Analytics calculations from backend
    totalIncome: analytics.summary.totalIncome,
    totalExpenses: analytics.summary.totalExpenses,
    currentBalance: analytics.summary.currentBalance,
    totalSavings: analytics.summary.totalSavings,
    safeDailySpend: analytics.summary.safeDailySpend,
    dailyAverageBurn: analytics.summary.dailyAverageBurn,
    daysLeftInMonth: analytics.summary.daysLeftInMonth,
    remainingBudget: analytics.summary.remainingBudget,
    totalBudgetLimit: analytics.summary.totalBudgetLimit,
    incomeChangePct: analytics.summary.incomeChangePct,
    expenseChangePct: analytics.summary.expenseChangePct,
    categoryBreakdown: analytics.categoryBreakdown,
    categorySpendMap: analytics.categorySpendMap,
    monthlyBreakdown: analytics.monthlyBreakdown,
    // Operations
    addTransaction,
    editTransaction,
    deleteTransaction,
    addBudget,
    editBudget,
    deleteBudget,
    addSavingsGoal,
    updateSavingsGoal,
    adjustSavingsGoalAmount,
    deleteSavingsGoal,
    updateSettings,
    toggleTheme,
    markNotificationRead,
    markAllNotificationsRead,
    clearAllNotifications,
  };

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
}

export const useFinance = () => {
  const ctx = useContext(FinanceContext);
  if (!ctx) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return ctx;
};
