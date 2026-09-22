import { useState } from 'react';
import { Sparkles, Lock, Mail, User, Coins, ArrowRight, ShieldCheck, ArrowLeft, KeyRound, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

function AuthPage() {
  const { login, register, loginAsDemo } = useAuth();

  const [mode, setMode] = useState('login'); // 'login' | 'register' | 'forgot'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [currency, setCurrency] = useState('₹');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const currencies = [
    { symbol: '₹', label: '₹ INR (Indian Rupee)' },
    { symbol: '$', label: '$ USD (US Dollar)' },
    { symbol: '€', label: '€ EUR (Euro)' },
    { symbol: '£', label: '£ GBP (British Pound)' },
    { symbol: 'AED', label: 'AED (UAE Dirham)' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (mode === 'login') {
        await login(email, password);
      } else if (mode === 'register') {
        if (!name.trim()) {
          throw new Error('Please enter your full name.');
        }
        await register({ name, email, password, currency });
      } else if (mode === 'forgot') {
        if (!password || password.length < 6) {
          throw new Error('New password must be at least 6 characters long.');
        }
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match. Please verify.');
        }

        const res = await api.resetPassword(email, password);
        setSuccessMsg(res.message || 'Password reset successfully! Please sign in with your new password.');
        setMode('login');
        setPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      setError(err.message || 'Action failed. Please verify your details.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError('');
    setSuccessMsg('');
    setLoading(true);
    try {
      await loginAsDemo();
    } catch (err) {
      setError(err.message || 'Could not connect to demo server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container-screen">
      <div className="auth-card">
        {/* Logo and Tagline */}
        <div className="auth-header">
          <div className="auth-logo-badge">
            <div className="logo-icon">F</div>
          </div>
          <h2>FinTrack</h2>
          <p>
            {mode === 'forgot'
              ? 'Password Recovery'
              : 'Personal Finance & Budget Management'}
          </p>
        </div>

        {/* 1-Click Demo Login Banner (Only on Login & Register) */}
        {mode !== 'forgot' && (
          <div className="demo-login-callout">
            <div className="demo-callout-info">
              <div className="demo-callout-title">
                <Sparkles size={16} className="sparkle-icon" />
                <strong>Instant Recruiter / Portfolio Demo</strong>
              </div>
              <p>Explore with Mounika's pre-seeded ₹80,000 income, real budgets, and Chart.js analytics.</p>
            </div>
            <button
              type="button"
              className="demo-login-btn"
              onClick={handleDemoLogin}
              disabled={loading}
            >
              <span>Launch Demo Dashboard</span>
              <ArrowRight size={15} />
            </button>
          </div>
        )}

        {mode !== 'forgot' && (
          <div className="auth-divider">
            <span>or continue with your credentials</span>
          </div>
        )}

        {/* Tab Switcher (Login / Register) */}
        {mode !== 'forgot' ? (
          <div className="auth-tabs">
            <button
              type="button"
              className={`auth-tab-btn ${mode === 'login' ? 'active' : ''}`}
              onClick={() => {
                setMode('login');
                setError('');
                setSuccessMsg('');
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`auth-tab-btn ${mode === 'register' ? 'active' : ''}`}
              onClick={() => {
                setMode('register');
                setError('');
                setSuccessMsg('');
              }}
            >
              Create Account
            </button>
          </div>
        ) : (
          <div className="forgot-header-text">
            <p>Enter your registered account email and set a new password.</p>
          </div>
        )}

        {error && <div className="form-error">{error}</div>}

        {successMsg && (
          <div className="form-success">
            <CheckCircle2 size={17} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="auth-form">
          {mode === 'register' && (
            <div className="form-group">
              <label>Full Name</label>
              <div className="input-with-icon">
                <User size={17} className="input-icon" />
                <input
                  type="text"
                  placeholder="e.g. Mounika Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label>Email Address</label>
            <div className="input-with-icon">
              <Mail size={17} className="input-icon" />
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <div className="label-with-action">
              <label>{mode === 'forgot' ? 'New Password' : 'Password'}</label>
              {mode === 'login' && (
                <button
                  type="button"
                  className="forgot-link-btn"
                  onClick={() => {
                    setMode('forgot');
                    setError('');
                    setSuccessMsg('');
                    setPassword('');
                    setConfirmPassword('');
                  }}
                >
                  Forgot Password?
                </button>
              )}
            </div>
            <div className="input-with-icon">
              <Lock size={17} className="input-icon" />
              <input
                type="password"
                placeholder={mode === 'forgot' ? 'Enter new password' : '••••••••'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
          </div>

          {mode === 'forgot' && (
            <div className="form-group">
              <label>Confirm New Password</label>
              <div className="input-with-icon">
                <KeyRound size={17} className="input-icon" />
                <input
                  type="password"
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
            </div>
          )}

          {mode === 'register' && (
            <div className="form-group">
              <label>Default Currency</label>
              <div className="input-with-icon">
                <Coins size={17} className="input-icon" />
                <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
                  {currencies.map((c) => (
                    <option key={c.symbol} value={c.symbol}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <button type="submit" className="primary-button auth-submit-btn" disabled={loading}>
            {loading
              ? 'Processing...'
              : mode === 'login'
              ? 'Sign In to FinTrack'
              : mode === 'register'
              ? 'Create Your Account'
              : 'Reset & Update Password'}
          </button>

          {mode === 'forgot' && (
            <button
              type="button"
              className="btn-back-to-signin"
              onClick={() => {
                setMode('login');
                setError('');
                setPassword('');
                setConfirmPassword('');
              }}
            >
              <ArrowLeft size={16} />
              <span>Back to Sign In</span>
            </button>
          )}
        </form>

        <div className="auth-footer-note">
          <ShieldCheck size={14} />
          <span>PostgreSQL-backed data isolation & bcrypt encrypted security</span>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;
