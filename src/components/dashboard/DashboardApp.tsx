import { useState } from 'react';
import { DashboardLayout } from './DashboardLayout';
import { Dashboard } from './Dashboard';
import { Markets } from './Markets';
import { OrderbookPage } from './OrderbookPage';
import { Portfolio } from './Portfolio';
import { TradeHistory } from './TradeHistory';
import { Leaderboard } from './Leaderboard';
import { Settings } from './Settings';

export function DashboardApp() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'markets':
        return <Markets />;
      case 'orderbook':
        return <OrderbookPage />;
      case 'portfolio':
        return <Portfolio />;
      case 'history':
        return <TradeHistory />;
      case 'leaderboard':
        return <Leaderboard />;
      case 'settings':
        return <Settings />;
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