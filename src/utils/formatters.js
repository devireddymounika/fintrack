// Currency and Date formatting utilities

export const formatCurrency = (amount, currencySymbol = '₹') => {
  const num = Number(amount) || 0;
  // Format with commas based on standard locale or Indian numbering if ₹
  if (currencySymbol === '₹') {
    return (
      '₹' +
      num.toLocaleString('en-IN', {
        maximumFractionDigits: 2,
        minimumFractionDigits: Number.isInteger(num) ? 0 : 2,
      })
    );
  }

  return (
    currencySymbol +
    num.toLocaleString('en-US', {
      maximumFractionDigits: 2,
      minimumFractionDigits: Number.isInteger(num) ? 0 : 2,
    })
  );
};

export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const formatRelativeTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffInDays = Math.round((now - date) / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) return 'Today';
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays < 7) return `${diffInDays} days ago`;
  return formatDate(dateString);
};

export const getGreeting = (name = 'Mounika') => {
  const hour = new Date().getHours();
  let timeOfDay = 'morning';
  if (hour >= 12 && hour < 17) {
    timeOfDay = 'afternoon';
  } else if (hour >= 17) {
    timeOfDay = 'evening';
  }
  return `Good ${timeOfDay}, ${name} 👋`;
};
