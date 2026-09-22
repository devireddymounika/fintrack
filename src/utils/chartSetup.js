import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export const getChartColors = (isDark = true) => ({
  text: isDark ? '#94A3B8' : '#64748B',
  grid: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)',
  tooltipBg: isDark ? '#0F172A' : '#FFFFFF',
  tooltipText: isDark ? '#F8FAFC' : '#0F172A',
  tooltipBorder: isDark ? '#334155' : '#E2E8F0',
  incomeBar: '#10B981',
  incomeBarBg: 'rgba(16, 185, 129, 0.85)',
  expenseBar: '#EF4444',
  expenseBarBg: 'rgba(239, 68, 68, 0.85)',
  categoryPalette: [
    '#6366F1', // Indigo - Rent & Housing
    '#F59E0B', // Amber - Groceries
    '#EC4899', // Pink - Dining
    '#10B981', // Emerald - Savings
    '#3B82F6', // Blue - Utilities
    '#8B5CF6', // Purple - Shopping
    '#06B6D4', // Cyan - Entertainment
    '#F97316', // Orange - Transport
    '#14B8A6', // Teal - Healthcare
    '#64748B', // Slate - Others
  ],
});
