import {
  LayoutDashboard,
  ArrowLeftRight,
  WalletCards,
  Target,
  BarChart3,
  Settings,
  Sparkles,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency } from '../utils/formatters';

function Sidebar({ currentTab, onSelectTab, isMobileOpen, onCloseMobile }) {
  const { totalSavings, settings } = useFinance();

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'transactions',
      label: 'Transactions',
      icon: ArrowLeftRight,
    },
    {
      id: 'budgets',
      label: 'Budgets',
      icon: WalletCards,
    },
    {
      id: 'savings',
      label: 'Savings Goals',
      icon: Target,
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: BarChart3,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
    },
  ];

  const handleTabClick = (tabId) => {
    onSelectTab(tabId);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && <div className="sidebar-backdrop" onClick={onCloseMobile} />}

      <aside className={`sidebar ${isMobileOpen ? 'mobile-open' : ''}`}>
        <div className="logo" onClick={() => handleTabClick('dashboard')}>
          <div className="logo-icon">F</div>
          <div className="logo-text-group">
            <span className="brand-name">FinTrack</span>
            <span className="brand-tagline">FINANCE & BUDGET</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => handleTabClick(item.id)}
              >
                <Icon size={19} className="nav-icon" />
                <span>{item.label}</span>
                {isActive && <div className="active-indicator" />}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="upgrade-card">
            <div className="upgrade-header">
              <div className="upgrade-icon">
                <Sparkles size={16} />
              </div>
              <h4>Financial Clarity</h4>
            </div>

            <p>Total Savings Stashed:</p>
            <div className="savings-badge">
              {formatCurrency(totalSavings, settings.currency)}
            </div>
            <span className="upgrade-sub">Keep building your wealth!</span>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;