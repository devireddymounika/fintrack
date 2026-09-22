// API Client for FinTrack Backend

const API_BASE = '/api';

export const getStoredToken = () => localStorage.getItem('fintrack_token');
export const setStoredToken = (token) => {
  if (token) localStorage.setItem('fintrack_token', token);
  else localStorage.removeItem('fintrack_token');
};

export async function request(endpoint, options = {}) {
  const token = getStoredToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401 && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/register')) {
      // Auto logout on token expiration
      setStoredToken(null);
      window.dispatchEvent(new Event('fintrack-unauthorized'));
    }
    const errorMsg = data.error || data.message || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return data;
}

// API methods
export const api = {
  // Auth
  login: (email, password) => request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (payload) => request('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  getMe: () => request('/auth/me'),
  updateProfile: (payload) => request('/auth/profile', { method: 'PUT', body: JSON.stringify(payload) }),
  resetPassword: (email, newPassword) => request('/auth/reset-password', { method: 'POST', body: JSON.stringify({ email, newPassword }) }),
  changePassword: (currentPassword, newPassword) => request('/auth/change-password', { method: 'PUT', body: JSON.stringify({ currentPassword, newPassword }) }),

  // Transactions
  getTransactions: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '' && v !== 'all') {
        query.append(k, v);
      }
    });
    const qs = query.toString();
    return request(`/transactions${qs ? `?${qs}` : ''}`);
  },
  createTransaction: (payload) => request('/transactions', { method: 'POST', body: JSON.stringify(payload) }),
  updateTransaction: (id, payload) => request(`/transactions/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteTransaction: (id) => request(`/transactions/${id}`, { method: 'DELETE' }),

  // Budgets
  getBudgets: () => request('/budgets'),
  saveBudget: (payload) => request('/budgets', { method: 'POST', body: JSON.stringify(payload) }),
  updateBudget: (id, payload) => request(`/budgets/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteBudget: (id) => request(`/budgets/${id}`, { method: 'DELETE' }),

  // Savings Goals
  getSavingsGoals: () => request('/savings'),
  createSavingsGoal: (payload) => request('/savings', { method: 'POST', body: JSON.stringify(payload) }),
  updateSavingsGoal: (id, payload) => request(`/savings/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  adjustSavingsGoal: (id, delta) => request(`/savings/${id}/adjust`, { method: 'POST', body: JSON.stringify({ delta }) }),
  deleteSavingsGoal: (id) => request(`/savings/${id}`, { method: 'DELETE' }),

  // Analytics
  getDashboardAnalytics: () => request('/analytics/dashboard'),

  // Notifications
  getNotifications: () => request('/notifications'),
  markNotificationRead: (id) => request(`/notifications/${id}/read`, { method: 'PUT' }),
  markAllNotificationsRead: () => request('/notifications/read-all', { method: 'PUT' }),
  clearNotifications: () => request('/notifications', { method: 'DELETE' }),
};
