import { TradeHistoryEntry } from '@/hooks/useTradeHistory';

export const exportTradeHistoryToCSV = (trades: TradeHistoryEntry[], filename?: string) => {
  const headers = [
    'Trade ID', 'Date', 'Time', 'Market Title', 'Category', 'Side',
    'Quantity', 'Price', 'Filled Quantity', 'Total', 'Fees', 'Status',
    'Order Type', 'Resolution Date'
  ];

  const dateFormatter = new Intl.DateTimeFormat('en-IN');
  const timeFormatter = new Intl.DateTimeFormat('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  const rows = trades.map(trade => {
    const timestamp = new Date(trade.timestamp);
    const resolution = trade.resolutionDate ? new Date(trade.resolutionDate) : null;

    return [
      trade.id,
      dateFormatter.format(timestamp),
      timeFormatter.format(timestamp),
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
      resolution ? dateFormatter.format(resolution) : ''
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\n');
  const defaultFilename = `trade_history_${new Date().toISOString().split('T')[0]}`;
  downloadCSV(csvContent, filename || defaultFilename);
};

export const downloadCSV = (csvContent: string, filename: string) => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;'});
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.csv`;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
};