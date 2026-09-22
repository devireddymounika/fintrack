# FinTrack — Personal Finance & Budget Management

> Developed a responsive personal finance dashboard using React, JavaScript, CSS and Chart.js, with local data persistence. Implemented transaction management, budgeting, savings goals, financial analytics, interactive charts, search/filtering, data export/import, and dark/light mode.

```
┌──────────────────────────────────────────────────────────────┐
│ FINTRACK                                  🔔  Mounika  ▼     │
├───────────────┬──────────────────────────────────────────────┤
│               │                                              │
│  ◉ Dashboard  │  Good morning, Mounika 👋                   │
│               │                                              │
│  Transactions │  ┌──────────┐ ┌──────────┐ ┌────────────┐ │
│               │  │ Income   │ │ Expenses │ │ Balance    │ │
│  Budgets      │  │ ₹80,000  │ │ ₹42,500  │ │ ₹37,500    │ │
│               │  └──────────┘ └──────────┘ └────────────┘ │
│  Savings Goals│                                              │
│               │  Income vs Expenses                          │
│  Reports      │  ┌────────────────────────────────────────┐ │
│               │  │              CHART                      │ │
│  Settings     │  │                                         │ │
│               │  └────────────────────────────────────────┘ │
│               │                                              │
│               │  Expenses by Category     Recent Transactions│
│               │  ┌──────────────────┐    ┌────────────────┐ │
│               │  │      CHART       │    │ Food    ₹500   │ │
│               │  │                  │    │ Rent  ₹18,000  │ │
│               │  └──────────────────┘    └────────────────┘ │
└───────────────┴──────────────────────────────────────────────┘
```

---

## Key Features

- **Executive Financial Dashboard**:
  - Greeting dynamically personalized by time of day (Morning/Afternoon/Evening) and user name.
  - 4 Key Metric StatCards: **Total Income** (₹80,000), **Total Expenses** (₹42,500), **Current Balance** (₹37,500), and **Savings** (₹27,500).
  - Interactive **Chart.js** Monthly Breakdown (Income vs. Expenses bar chart).
  - Interactive **Chart.js** Category Doughnut Chart with color legends and percentage share.
  - Recent transactions list with type indicators (+ / -) and quick view.
  - Monthly budget health pulse showing live category utilization.

- **Complete Transaction Ledger**:
  - Full CRUD: Add, edit, and delete transactions with instant balance recalculation.
  - Real-time search across transaction titles, categories, and notes.
  - Filter by Type (All / Income / Expense), Category, and Date Range (All Time, This Month, Last Month).
  - Multi-directional sorting (Date Newest/Oldest, Amount High/Low).
  - Quick summary strip calculating matching transaction count and net cash flow.
  - Export filtered results directly to standard CSV.

- **Category Budget Management**:
  - Set monthly spending caps for individual expense categories (Rent, Groceries, Food & Dining, Shopping, Utilities, etc.).
  - Real-time spend tracking computed against active monthly ledger.
  - Visual alert thresholds:
    - 🟢 Healthy (< 70% used)
    - 🟡 Warning (70% – 90% used)
    - 🔴 Danger / Over-budget (> 90% or exceeded)
  - Proactive over-budget alert banner.

- **Milestone Savings Goals**:
  - Track progress toward custom savings targets (Emergency Fund, Vacations, Tech Purchases).
  - One-click Deposit and Withdraw action modal with automatic percentage and balance recalculation.
  - Target date countdown indicator with days remaining.
  - Milestone celebration tag upon 100% completion.

- **Financial Analytics & Reports**:
  - Key Performance Indicators: Savings Rate (%), Average Daily Burn Rate, Largest Single Expense, and Total Activity Count.
  - 6-month multi-line cash flow trajectory chart (Income vs Expenses vs Net Growth).
  - Category spending distribution horizontal bar chart and proportion table.
  - One-click full ledger CSV export.

- **Settings & Data Portability**:
  - Profile customization (name, account type).
  - Multi-currency support: Indian Rupee (`₹`), US Dollar (`$`), Euro (`€`), British Pound (`£`), Japanese Yen (`¥`), and more.
  - Visual theme selector: Modern Slate Dark Mode and Crisp Light Mode.
  - Full workspace JSON Export & Import backup mechanism.
  - One-click Reset to Demo Data.

---

## Tech Stack

- **Frontend**: React 19, JavaScript (ES2024), HTML5, Modern CSS (Design tokens, Custom Properties, Responsive Grids)
- **Charts & Data Viz**: Chart.js 4, react-chartjs-2
- **Icons**: Lucide React
- **Storage**: LocalStorage with automatic synchronization & JSON export/import
- **Build Tool**: Vite 8

---

## Getting Started

### Installation

```bash
# Clone the repository
cd fintrack

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```
