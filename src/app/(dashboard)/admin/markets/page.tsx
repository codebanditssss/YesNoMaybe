"use client"

import { useState, useEffect } from 'react';
import { 
  BarChart3,
  Plus,
  Search,
  Filter,
  Edit,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Users,
  DollarSign,
  Calendar
} from 'lucide-react';

interface AdminMarket {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'active' | 'resolved' | 'cancelled' | 'pending';
  created_at: string;
  resolution_date: string | null;
  actual_outcome: string | null;
  is_featured: boolean;
  created_by: string | null;
  total_volume: number;
  total_traders: number;
  total_yes_volume: number;
  total_no_volume: number;
  tags: string[];
}

const MarketCard = ({ market, onAction }: { market: AdminMarket; onAction: (action: string, marketId: string) => void }) => {
  const yesPrice = market.total_volume > 0 
    ? Math.round((market.total_yes_volume / market.total_volume) * 100) 
    : 50;
  
  const noPrice = 100 - yesPrice;
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'resolved': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    // Simple category mapping - in a real app, you'd have a more comprehensive system
    switch (category?.toLowerCase()) {
      case 'politics': return '🏛️';
      case 'sports': return '⚽';
      case 'technology': return '💻';
      case 'entertainment': return '🎬';
      case 'business': return '💼';
      default: return '📊';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-lg">{getCategoryIcon(market.category)}</span>
            <span className="text-sm text-gray-500 capitalize">{market.category}</span>
            {market.is_featured && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                Featured
              </span>
            )}
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
            {market.title}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
            {market.description}
          </p>
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <span className="flex items-center">
              <Users className="h-3 w-3 mr-1" />
              {market.total_traders} traders
            </span>
            <span className="flex items-center">
              <DollarSign className="h-3 w-3 mr-1" />
              ₹{(market.total_volume / 1000).toFixed(1)}K
            </span>
            {market.resolution_date && (
              <span className="flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                {new Date(market.resolution_date).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
        
        <div className="flex flex-col items-end space-y-2">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(market.status)}`}>
            {market.status}
          </span>
          <div className="flex space-x-1">
            <button
              onClick={() => onAction('view', market.id)}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              title="View Market"
            >
              <Eye className="h-4 w-4" />
            </button>
            <button
              onClick={() => onAction('edit', market.id)}
              className="p-2 text-blue-400 hover:text-blue-600 transition-colors"
              title="Edit Market"
            >
              <Edit className="h-4 w-4" />
            </button>
            {market.status === 'active' && (
              <button
                onClick={() => onAction('resolve', market.id)}
                className="p-2 text-green-400 hover:text-green-600 transition-colors"
                title="Resolve Market"
              >
                <CheckCircle className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Market Prices */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-green-50 rounded-lg p-3 text-center">
          <p className="text-sm text-green-600 font-medium">YES</p>
          <p className="text-lg font-bold text-green-700">₹{yesPrice}</p>
        </div>
        <div className="bg-red-50 rounded-lg p-3 text-center">
          <p className="text-sm text-red-600 font-medium">NO</p>
          <p className="text-lg font-bold text-red-700">₹{noPrice}</p>
        </div>
      </div>

      {/* Market Resolution */}
      {market.status === 'resolved' && market.actual_outcome && (
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-sm text-gray-600">Resolved: <span className="font-semibold">{market.actual_outcome}</span></p>
        </div>
      )}

      {/* Tags */}
      {market.tags && market.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {market.tags.slice(0, 3).map((tag, index) => (
            <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700">
              {tag}
            </span>
          ))}
          {market.tags.length > 3 && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700">
              +{market.tags.length - 3} more
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default function AdminMarkets() {
  const [markets, setMarkets] = useState<AdminMarket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'resolved' | 'cancelled' | 'pending'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [totalMarkets, setTotalMarkets] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const marketsPerPage = 12;

  const fetchMarkets = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: marketsPerPage.toString(),
        search: searchQuery,
        status: statusFilter,
        category: categoryFilter
      });

      const response = await fetch(`/api/admin/markets?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch markets');
      }

      const data = await response.json();
      setMarkets(data.markets);
      setTotalMarkets(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load markets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarkets();
  }, [page, searchQuery, statusFilter, categoryFilter]);

  const handleMarketAction = async (action: string, marketId: string) => {
    try {
      if (action === 'view') {
        // Navigate to market details (you'd implement this)
        console.log('View market:', marketId);
        return;
      }

      if (action === 'edit') {
        // Open edit modal (you'd implement this)
        console.log('Edit market:', marketId);
        return;
      }

      if (action === 'resolve') {
        // Open resolution modal (you'd implement this)
        console.log('Resolve market:', marketId);
        return;
      }

      const response = await fetch(`/api/admin/markets/${marketId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });

      if (!response.ok) {
        throw new Error('Failed to perform action');
      }

      // Refresh markets list
      fetchMarkets();
    } catch (err) {
      console.error('Action failed:', err);
    }
  };

  const totalPages = Math.ceil(totalMarkets / marketsPerPage);

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <XCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error Loading Markets</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <BarChart3 className="h-8 w-8 mr-3" />
            Market Management
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Create, manage, and resolve prediction markets
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500">
            Total: {totalMarkets.toLocaleString()} markets
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Create Market</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search markets by title or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none"
              />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="resolved">Resolved</option>
                <option value="cancelled">Cancelled</option>
                <option value="pending">Pending</option>
              </select>
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              <option value="politics">Politics</option>
              <option value="sports">Sports</option>
              <option value="technology">Technology</option>
              <option value="entertainment">Entertainment</option>
              <option value="business">Business</option>
            </select>
          </div>
        </div>
      </div>

      {/* Markets Grid */}
      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
          {markets.map((market) => (
            <MarketCard key={market.id} market={market} onAction={handleMarketAction} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && markets.length === 0 && (
        <div className="text-center py-12">
          <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No markets found</h3>
          <p className="text-gray-500 mb-4">Try adjusting your search or filters, or create a new market.</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create First Market
          </button>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {((page - 1) * marketsPerPage) + 1} to {Math.min(page * marketsPerPage, totalMarkets)} of {totalMarkets} markets
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Create Market Modal Placeholder */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Create New Market</h3>
            <p className="text-gray-600 mb-4">Market creation form would go here.</p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 