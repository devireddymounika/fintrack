import { useState } from 'react';
import './App.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FinanceProvider } from './context/FinanceContext';
import AuthPage from './pages/AuthPage';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Budgets from './pages/Budgets';
import SavingsGoals from './pages/SavingsGoals';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import TransactionModal from './components/TransactionModal';

function MainLayout() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleOpenAddTx = () => {
    setEditingTransaction(null);
    setIsTxModalOpen(true);
  };

  const handleEditTx = (tx) => {
    setEditingTransaction(tx);
    setIsTxModalOpen(true);
  };

  const handleCloseTxModal = () => {
    setIsTxModalOpen(false);
    setEditingTransaction(null);
  };

  const renderActivePage = () => {
    switch (currentTab) {
      case 'transactions':
        return (
          <Transactions
            onOpenAddTransaction={handleOpenAddTx}
            onEditTransaction={handleEditTx}
          />
        );
      case 'budgets':
        return <Budgets />;
      case 'savings':
        return <SavingsGoals />;
      case 'reports':
        return <Reports />;
      case 'settings':
        return <Settings />;
      case 'dashboard':
      default:
        return (
          <Dashboard
            onOpenAddTransaction={handleOpenAddTx}
            onNavigate={(tab) => setCurrentTab(tab)}
          />
        );
    }
  };

  return (
    <div className="app">
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      <div className="main-wrapper">
        <Header
          onOpenAddTransaction={handleOpenAddTx}
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          isMobileMenuOpen={isMobileMenuOpen}
          onNavigate={(tab) => setCurrentTab(tab)}
        />

        <div className="page-content-wrapper">{renderActivePage()}</div>
      </div>

      {isTxModalOpen && (
        <TransactionModal
          key={editingTransaction ? editingTransaction.id : 'new'}
          isOpen={isTxModalOpen}
          onClose={handleCloseTxModal}
          transactionToEdit={editingTransaction}
        />
      )}
    </div>
  );
}

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="app-loading-screen">
        <div className="loading-spinner-ring" />
        <p>Connecting to PostgreSQL database...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  return (
    <FinanceProvider>
      <MainLayout />
    </FinanceProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;