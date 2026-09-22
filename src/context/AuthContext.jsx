import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, getStoredToken, setStoredToken } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => getStoredToken());
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    setStoredToken(null);
  }, []);

  // Fetch current user if token exists
  useEffect(() => {
    async function loadUser() {
      const stored = getStoredToken();
      if (!stored) {
        setIsLoading(false);
        return;
      }
      try {
        const data = await api.getMe();
        setUser(data.user);
        document.documentElement.setAttribute('data-theme', data.user.theme || 'dark');
      } catch (err) {
        console.warn('Session expired or server unavailable:', err.message);
        logout();
      } finally {
        setIsLoading(false);
      }
    }

    loadUser();

    const handleUnauthorized = () => logout();
    window.addEventListener('fintrack-unauthorized', handleUnauthorized);
    return () => window.removeEventListener('fintrack-unauthorized', handleUnauthorized);
  }, [logout]);

  const login = async (email, password) => {
    const data = await api.login(email, password);
    setToken(data.token);
    setStoredToken(data.token);
    setUser(data.user);
    document.documentElement.setAttribute('data-theme', data.user.theme || 'dark');
    return data;
  };

  const register = async (payload) => {
    const data = await api.register(payload);
    setToken(data.token);
    setStoredToken(data.token);
    setUser(data.user);
    document.documentElement.setAttribute('data-theme', data.user.theme || 'dark');
    return data;
  };

  const loginAsDemo = async () => {
    return login('demo@fintrack.app', 'password123');
  };

  const updateProfile = async (updates) => {
    const data = await api.updateProfile(updates);
    setUser(data.user);
    if (data.user.theme) {
      document.documentElement.setAttribute('data-theme', data.user.theme);
    }
    return data.user;
  };

  const value = {
    user,
    token,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    loginAsDemo,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};
