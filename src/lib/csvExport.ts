import { TradeHistoryEntry } from '@/hooks/useTradeHistory';

export const exportTradeHistoryToCSV = (trades: TradeHistoryEntry[], filename?: string) => {
  const headers = [
    'Trade ID',
    'Date',
    'Time',
    'Market Title',
    'Category',
    'Side',
    'Quantity',
    'Price',
    'Filled Quantity',
    'Total',
    'Fees',
    'Status',
    'Order Type',
    'Resolution Date'
  ];

  const csvRows = [
    headers.join(','),
    ...trades.map(trade => [
      trade.id,
      new Date(trade.timestamp).toLocaleDateString() || "--",
      new Date(trade.timestamp).toLocaleTimeString() || "--",
      `"${trade.marketTitle}"`,
      trade.marketCategory,
      trade.side,
      trade.quantity,
      trade.price,
      trade.filledQuantity,
      trade.total,
      trade.fees,
      trade.status,
      trade.orderType,
      trade.resolutionDate ? new Date(trade.resolutionDate).toLocaleDateString() : ''
    ].join(','))
  ];

  const csvContent = csvRows.join('\n');
  const defaultFilename = `trade_history_${new Date().toISOString().split('T')[0]}`;
  const finalFilename = filename || defaultFilename;

  downloadCSV(csvContent, finalFilename);
};

export const downloadCSV = (csvContent: string, filename: string) => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url); 
};
