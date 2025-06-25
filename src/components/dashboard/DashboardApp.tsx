import { useState } from 'react';
import { DashboardLayout } from './DashboardLayout';
import { Dashboard } from './Dashboard';
import { Markets } from './Markets';
import { OrderbookPage } from './OrderbookPage';
import { StockManager } from './StockManager';
import { TradingDashboard } from './TradingDashboard';
import { Portfolio } from './Portfolio';

export function DashboardApp() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  // Mock user stocks for StockManager
  const mockUserStocks = [
    {
      id: '1',
      marketId: '1',
      marketTitle: 'Bitcoin to reach $100K by 2024?',
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
      marketTitle: 'Tesla stock above $300 by Q1 2025?',
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
        return (
          <div className="p-8 bg-gray-50 min-h-full">
            <div className="max-w-7xl mx-auto">
              <h1 className="text-3xl font-bold text-gray-900 mb-8">Trade History</h1>
              <div className="bg-white rounded-lg p-8 text-center">
                <p className="text-gray-600">Trade history coming soon...</p>
              </div>
            </div>
          </div>
        );
      case 'leaderboard':
        return (
          <div className="p-8 bg-gray-50 min-h-full">
            <div className="max-w-7xl mx-auto">
              <h1 className="text-3xl font-bold text-gray-900 mb-8">Leaderboard</h1>
              <div className="bg-white rounded-lg p-8 text-center">
                <p className="text-gray-600">Leaderboard coming soon...</p>
              </div>
            </div>
          </div>
        );
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