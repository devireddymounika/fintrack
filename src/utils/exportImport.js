// Export and Import helpers for FinTrack

export const exportToCSV = (transactions, filename = 'fintrack-transactions.csv') => {
  if (!transactions || transactions.length === 0) {
    alert('No transactions to export.');
    return;
  }

  const headers = ['ID', 'Date', 'Title', 'Type', 'Category', 'Amount', 'Payment Method', 'Notes'];
  const rows = transactions.map((t) => [
    t.id,
    `"${t.date || ''}"`,
    `"${(t.title || '').replace(/"/g, '""')}"`,
    t.type,
    `"${t.category || ''}"`,
    t.amount,
    `"${t.paymentMethod || ''}"`,
    `"${(t.notes || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, filename);
};

export const exportToJSON = (data, filename = 'fintrack-backup.json') => {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
  downloadBlob(blob, filename);
};

export const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const parseJSONFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (!parsed || typeof parsed !== 'object') {
          throw new Error('Invalid JSON structure');
        }
        resolve(parsed);
      } catch {
        reject(new Error('Failed to parse backup file. Please ensure it is valid JSON.'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file.'));
    reader.readAsText(file);
  });
};
