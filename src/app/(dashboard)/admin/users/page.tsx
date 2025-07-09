"use client"

import { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter,
  Edit,
  Ban,
  CheckCircle,
  XCircle,
  DollarSign,
  TrendingUp,
  Calendar
} from 'lucide-react';

interface AdminUser {
  id: string;
  email: string;
  full_name: string | null;
  username: string | null;
  created_at: string;
  is_verified: boolean;
  avatar_url: string | null;
  balance: {
    available_balance: number;
    locked_balance: number;
    total_deposited: number;
    total_trades: number;
    winning_trades: number;
    total_volume: number;
    total_profit_loss: number;
  } | null;
  role: string;
  status: 'active' | 'suspended' | 'banned';
  last_active: string | null;
}

const UserCard = ({ user, onAction }: { user: AdminUser; onAction: (action: string, userId: string) => void }) => {
  const winRate = user.balance?.total_trades ? (user.balance.winning_trades / user.balance.total_trades * 100) : 0;
  
  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
            {user.avatar_url ? (
              <img src={user.avatar_url} alt={user.full_name || user.email} className="w-12 h-12 rounded-full" />
            ) : (
              <span className="text-gray-600 font-semibold text-lg">
                {(user.full_name || user.email).charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {user.full_name || user.username || 'Unnamed User'}
            </h3>
            <p className="text-sm text-gray-600">{user.email}</p>
            <div className="flex items-center space-x-2 mt-1">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                user.status === 'active' ? 'bg-green-100 text-green-800' :
                user.status === 'suspended' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {user.status}
              </span>
              {user.is_verified && (
                <CheckCircle className="h-4 w-4 text-green-500" />
              )}
              <span className="text-xs text-gray-500 capitalize">{user.role}</span>
            </div>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => onAction('edit', user.id)}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            title="Edit User"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => onAction(user.status === 'active' ? 'suspend' : 'activate', user.id)}
            className={`p-2 transition-colors ${
              user.status === 'active' 
                ? 'text-yellow-400 hover:text-yellow-600' 
                : 'text-green-400 hover:text-green-600'
            }`}
            title={user.status === 'active' ? 'Suspend User' : 'Activate User'}
          >
            {user.status === 'active' ? <Ban className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* User Stats */}
      {user.balance && (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-sm text-gray-500">Balance</p>
            <p className="text-lg font-semibold text-gray-900">
              ₹{(user.balance.available_balance + user.balance.locked_balance).toLocaleString()}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500">Trades</p>
            <p className="text-lg font-semibold text-gray-900">{user.balance.total_trades}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500">Win Rate</p>
            <p className="text-lg font-semibold text-gray-900">{winRate.toFixed(1)}%</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500">P&L</p>
            <p className={`text-lg font-semibold ${
              user.balance.total_profit_loss >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              ₹{user.balance.total_profit_loss.toLocaleString()}
            </p>
          </div>
        </div>
      )}

      <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
        <span>Joined: {new Date(user.created_at).toLocaleDateString()}</span>
        {user.last_active && (
          <span>Last active: {new Date(user.last_active).toLocaleDateString()}</span>
        )}
      </div>
    </div>
  );
};

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended' | 'banned'>('all');
  const [page, setPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const usersPerPage = 20;

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: usersPerPage.toString(),
        search: searchQuery,
        status: statusFilter
      });

      const response = await fetch(`/api/admin/users?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data.users);
      setTotalUsers(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, searchQuery, statusFilter]);

  const handleUserAction = async (action: string, userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });

      if (!response.ok) {
        throw new Error('Failed to perform action');
      }

      // Refresh users list
      fetchUsers();
    } catch (err) {
      console.error('Action failed:', err);
      // Could add toast notification here
    }
  };

  const totalPages = Math.ceil(totalUsers / usersPerPage);

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <XCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error Loading Users</h3>
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
            <Users className="h-8 w-8 mr-3" />
            User Management
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage platform users, balances, and permissions
          </p>
        </div>
        <div className="text-sm text-gray-500">
          Total: {totalUsers.toLocaleString()} users
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="banned">Banned</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Grid */}
      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
          {users.map((user) => (
            <UserCard key={user.id} user={user} onAction={handleUserAction} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {((page - 1) * usersPerPage) + 1} to {Math.min(page * usersPerPage, totalUsers)} of {totalUsers} users
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
    </div>
  );
} 