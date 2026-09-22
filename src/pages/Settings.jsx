import { useState, useRef } from 'react';
import {
  User,
  Coins,
  Lock,
  Database,
  Download,
  Upload,
  RotateCcw,
  Trash2,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { exportToJSON, parseJSONFile } from '../utils/exportImport';
import { api } from '../services/api';
import ConfirmModal from '../components/ConfirmModal';

function Settings() {
  const {
    settings,
    updateSettings,
    transactions,
    budgets,
    savingsGoals,
    notifications,
    resetToDemoData,
    clearAllData,
    importBackupData,
  } = useFinance();

  const [userName, setUserName] = useState(settings.userName || 'Mounika');
  const [accountType, setAccountType] = useState(settings.accountType || 'Personal Account');
  const [currency, setCurrency] = useState(settings.currency || '₹');
  const [theme, setTheme] = useState(settings.theme || 'dark');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Password change states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  // Modals for reset / clear
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);
  const [importStatus, setImportStatus] = useState({ msg: '', type: '' });

  const fileInputRef = useRef(null);

  const currencies = [
    { symbol: '₹', label: '₹ INR — Indian Rupee' },
    { symbol: '$', label: '$ USD — US Dollar' },
    { symbol: '€', label: '€ EUR — Euro' },
    { symbol: '£', label: '£ GBP — British Pound' },
    { symbol: '¥', label: '¥ JPY — Japanese Yen' },
    { symbol: 'C$', label: 'C$ CAD — Canadian Dollar' },
    { symbol: 'A$', label: 'A$ AUD — Australian Dollar' },
    { symbol: 'AED', label: 'AED — UAE Dirham' },
  ];

  const handleSaveProfile = (e) => {
    e.preventDefault();
    updateSettings({
      userName: userName.trim() || 'Mounika',
      accountType: accountType.trim() || 'Personal Account',
      currency,
      theme,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    updateSettings({ theme: newTheme });
  };

  const handleCurrencyChange = (newCurrency) => {
    setCurrency(newCurrency);
    updateSettings({ currency: newCurrency });
  };

  const handleExportBackup = () => {
    const backupData = {
      version: '2.0',
      exportedAt: new Date().toISOString(),
      settings: { ...settings, userName, accountType, currency, theme },
      transactions,
      budgets,
      savingsGoals,
      notifications,
    };
    exportToJSON(backupData, `fintrack-backup-${Date.now()}.json`);
  };

  const handleFileImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await parseJSONFile(file);
      importBackupData(data);
      if (data.settings) {
        if (data.settings.userName) setUserName(data.settings.userName);
        if (data.settings.accountType) setAccountType(data.settings.accountType);
        if (data.settings.currency) setCurrency(data.settings.currency);
        if (data.settings.theme) setTheme(data.settings.theme);
      }
      setImportStatus({ msg: 'Backup restored successfully!', type: 'success' });
    } catch (err) {
      setImportStatus({ msg: err.message || 'Import failed. Please verify JSON file format.', type: 'error' });
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setTimeout(() => setImportStatus({ msg: '', type: '' }), 4000);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPasswordError('New passwords do not match. Please verify.');
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await api.changePassword(currentPassword, newPassword);
      setPasswordSuccess(res.message || 'Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setTimeout(() => setPasswordSuccess(''), 4000);
    } catch (err) {
      setPasswordError(err.message || 'Failed to update password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <main className="settings-page">
      <div className="page-heading">
        <div>
          <h1>Settings & Preferences</h1>
          <p>Customize your personal profile, active currency symbol, display theme, and manage data.</p>
        </div>
      </div>

      {savedSuccess && (
        <div className="alert-banner success-banner">
          <CheckCircle2 size={18} />
          <span>Profile & preferences updated successfully!</span>
        </div>
      )}

      {importStatus.msg && (
        <div className={`alert-banner ${importStatus.type === 'success' ? 'success-banner' : 'warning-banner'}`}>
          <AlertTriangle size={18} />
          <span>{importStatus.msg}</span>
        </div>
      )}

      <div className="settings-grid-layout">
        {/* Profile Card */}
        <section className="content-card settings-card">
          <div className="settings-card-header">
            <div className="settings-icon-col">
              <User size={20} />
            </div>
            <div>
              <h3>User Profile</h3>
              <p>Customize display name and account designation</p>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="settings-form">
            <div className="form-group">
              <label>Full Name / Display Name</label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="e.g. Mounika"
                required
              />
            </div>

            <div className="form-group">
              <label>Account Subtitle</label>
              <input
                type="text"
                value={accountType}
                onChange={(e) => setAccountType(e.target.value)}
                placeholder="e.g. Personal Account or Business"
              />
            </div>

            <button type="submit" className="primary-button">
              Save Profile Changes
            </button>
          </form>
        </section>

        {/* Currency & Appearance Card */}
        <section className="content-card settings-card">
          <div className="settings-card-header">
            <div className="settings-icon-col">
              <Coins size={20} />
            </div>
            <div>
              <h3>Currency & Theme</h3>
              <p>Configure financial symbol and interface visual style</p>
            </div>
          </div>

          <div className="settings-form">
            <div className="form-group">
              <label>Active Currency Symbol</label>
              <select
                value={currency}
                onChange={(e) => handleCurrencyChange(e.target.value)}
              >
                {currencies.map((c) => (
                  <option key={c.symbol} value={c.symbol}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Theme Preference</label>
              <div className="theme-toggle-row">
                <button
                  type="button"
                  className={`theme-pick-btn ${theme === 'dark' ? 'active' : ''}`}
                  onClick={() => handleThemeChange('dark')}
                >
                  <span className="theme-dot dark" />
                  <span>Dark Mode</span>
                </button>
                <button
                  type="button"
                  className={`theme-pick-btn ${theme === 'light' ? 'active' : ''}`}
                  onClick={() => handleThemeChange('light')}
                >
                  <span className="theme-dot light" />
                  <span>Light Mode</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Security & Password Card */}
        <section className="content-card settings-card">
          <div className="settings-card-header">
            <div className="settings-icon-col">
              <Lock size={20} />
            </div>
            <div>
              <h3>Security & Password</h3>
              <p>Update your account password</p>
            </div>
          </div>

          {passwordSuccess && (
            <div className="alert-banner success-banner">
              <CheckCircle2 size={16} />
              <span>{passwordSuccess}</span>
            </div>
          )}

          {passwordError && (
            <div className="alert-banner warning-banner">
              <AlertTriangle size={16} />
              <span>{passwordError}</span>
            </div>
          )}

          <form onSubmit={handleChangePassword} className="settings-form">
            <div className="form-group">
              <label>Current Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>New Password (min 6 chars)</label>
              <input
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            <div className="form-group">
              <label>Confirm New Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            <button type="submit" className="primary-button" disabled={passwordLoading}>
              {passwordLoading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </section>

        {/* Data Management Card */}
        <section className="content-card settings-card full-width">
          <div className="settings-card-header">
            <div className="settings-icon-col">
              <Database size={20} />
            </div>
            <div>
              <h3>Data Persistence & Backup</h3>
              <p>All data is securely saved in your browser's LocalStorage. You can export or restore anytime.</p>
            </div>
          </div>

          <div className="data-management-grid">
            {/* Export JSON */}
            <div className="data-action-box">
              <div className="data-action-info">
                <h4>Export Complete Backup</h4>
                <p>Download a full JSON snapshot of your transactions, budgets, goals, and settings.</p>
              </div>
              <button className="btn-secondary" onClick={handleExportBackup}>
                <Download size={16} />
                <span>Export JSON</span>
              </button>
            </div>

            {/* Import JSON */}
            <div className="data-action-box">
              <div className="data-action-info">
                <h4>Restore from Backup</h4>
                <p>Upload a previously exported FinTrack backup JSON file to restore your workspace.</p>
              </div>
              <label className="btn-secondary upload-btn-label">
                <Upload size={16} />
                <span>Import JSON</span>
                <input
                  type="file"
                  accept=".json"
                  ref={fileInputRef}
                  onChange={handleFileImport}
                  style={{ display: 'none' }}
                />
              </label>
            </div>

            {/* Reset to Demo */}
            <div className="data-action-box">
              <div className="data-action-info">
                <h4>Reset to Demo Data</h4>
                <p>Restore the default sample data (Income ₹80k, Expenses ₹42.5k, Balance ₹37.5k).</p>
              </div>
              <button
                className="btn-secondary"
                onClick={() => setIsResetConfirmOpen(true)}
              >
                <RotateCcw size={16} />
                <span>Reset Demo Data</span>
              </button>
            </div>

            {/* Clear All */}
            <div className="data-action-box danger-box">
              <div className="data-action-info">
                <h4>Wipe All Data</h4>
                <p>Permanently delete all transactions, budgets, and savings goals from this device.</p>
              </div>
              <button
                className="btn-danger"
                onClick={() => setIsClearConfirmOpen(true)}
              >
                <Trash2 size={16} />
                <span>Clear All Records</span>
              </button>
            </div>
          </div>
        </section>
      </div>

      <ConfirmModal
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirm={resetToDemoData}
        title="Reset to Demo Data"
        message="Are you sure you want to reset all data back to the default sample dataset? Any custom transactions you added will be overwritten."
        confirmText="Reset to Demo"
        danger={false}
      />

      <ConfirmModal
        isOpen={isClearConfirmOpen}
        onClose={() => setIsClearConfirmOpen(false)}
        onConfirm={clearAllData}
        title="Clear All Financial Records"
        message="CAUTION: This will delete all your transactions, budgets, and savings goals permanently. Do you wish to continue?"
        confirmText="Wipe Everything"
        danger={true}
      />
    </main>
  );
}

export default Settings;
