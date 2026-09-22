import { useState } from 'react';
import { Bell, Search, Sun, Moon, Plus, Menu, X, ChevronDown, Settings as SettingsIcon, LogOut } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { useAuth } from '../context/AuthContext';
import NotificationDropdown from './NotificationDropdown';

function Header({ onOpenAddTransaction, onToggleMobileMenu, isMobileMenuOpen, onNavigate }) {
  const { settings, toggleTheme, notifications, searchQuery, setSearchQuery } = useFinance();
  const { logout } = useAuth();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const isDark = settings.theme !== 'light';

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      if (onNavigate) {
        onNavigate('transactions');
      }
    }
  };

  return (
    <header className="header">
      <div className="header-left">
        <button
          className="mobile-menu-btn icon-button"
          onClick={onToggleMobileMenu}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        <div className="header-search">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search transactions, notes, categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearchKeyDown}
          />
          {searchQuery && (
            <button className="clear-search-btn" onClick={() => setSearchQuery('')}>
              ×
            </button>
          )}
        </div>
      </div>

      <div className="header-actions">
        <button
          className="header-add-btn"
          onClick={onOpenAddTransaction}
          title="Add Transaction"
        >
          <Plus size={18} />
          <span>Add</span>
        </button>

        <button
          className="icon-button"
          onClick={toggleTheme}
          title={`Switch to ${isDark ? 'Light' : 'Dark'} mode`}
          aria-label="Toggle theme"
        >
          {isDark ? <Sun size={19} /> : <Moon size={19} />}
        </button>

        <div className="relative-container">
          <button
            className={`icon-button notification ${unreadCount > 0 ? 'has-unread' : ''}`}
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            aria-label="Notifications"
            title="Notifications"
          >
            <Bell size={19} />
            {unreadCount > 0 && (
              <span className="notification-dot">{unreadCount > 9 ? '9+' : unreadCount}</span>
            )}
          </button>

          <NotificationDropdown
            isOpen={isNotifOpen}
            onClose={() => setIsNotifOpen(false)}
          />
        </div>

        <div className="relative-container">
          <div
            className="profile"
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            role="button"
            tabIndex={0}
          >
            <div className="profile-avatar">
              {(settings.userName || 'M').charAt(0).toUpperCase()}
            </div>

            <div className="profile-info">
              <div className="profile-name-row">
                <strong>{settings.userName || 'Mounika'}</strong>
                <ChevronDown size={14} className="profile-chevron" />
              </div>
              <span>{settings.accountType || 'Personal Account'}</span>
            </div>
          </div>

          {isProfileMenuOpen && (
            <div
              className="profile-menu-dropdown"
              onMouseLeave={() => setIsProfileMenuOpen(false)}
            >
              <div className="profile-menu-header">
                <strong>{settings.userName}</strong>
                <span>{settings.currency} Currency active</span>
              </div>
              <button
                className="profile-menu-item"
                onClick={() => {
                  setIsProfileMenuOpen(false);
                  onNavigate('settings');
                }}
              >
                <SettingsIcon size={16} />
                <span>Account & Settings</span>
              </button>
              <button
                className="profile-menu-item danger"
                onClick={() => {
                  setIsProfileMenuOpen(false);
                  logout();
                }}
              >
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;