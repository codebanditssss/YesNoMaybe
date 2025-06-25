import { useState } from 'react';
import { DashboardLayout } from './DashboardLayout';
import { Dashboard } from './Dashboard';
import { Markets } from './Markets';
import { OrderbookPage } from './OrderbookPage';
import { StockManager } from './StockManager';
import { TradingDashboard } from './TradingDashboard';
import { Portfolio } from './Portfolio';
import { TradeHistory } from './TradeHistory';
import { Leaderboard } from './Leaderboard';

export function DashboardApp() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  // Mock user stocks for StockManager
  const mockUserStocks = [
    {
      id: '1',
      marketId: '1',
      marketTitle: 'Bitcoin to reach ₹84L by 2024?',
      type: 'yes' as const,
      quantity: 150,
      avgPrice: 3.8,
      currentPrice: 4.2,
      pnl: 60.0,
      pnlPercent: 10.5
    },
    {
      id: '2',
      marketId: '2',
      marketTitle: 'Tesla stock above ₹25,000 by Q1 2025?',
      type: 'no' as const,
      quantity: 100,
      avgPrice: 3.5,
      currentPrice: 3.3,
      pnl: -20.0,
      pnlPercent: -5.7
    }
  ];

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'markets':
        return <Markets />;
      case 'orderbook':
        return <OrderbookPage />;
      case 'stocks':
        return (
          <StockManager 
            userStocks={mockUserStocks}
            onMint={(marketId, type, quantity) => {
              console.log('Minting:', { marketId, type, quantity });
            }}
            onBurn={(stockId, quantity) => {
              console.log('Burning:', { stockId, quantity });
            }}
          />
        );
      case 'portfolio':
        return <Portfolio />;
      case 'history':
        return <TradeHistory />;
      case 'leaderboard':
        return <Leaderboard />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <DashboardLayout 
      currentPage={currentPage}
      onNavigate={setCurrentPage}
    >
      {renderCurrentPage()}
    </DashboardLayout>
  );
} 