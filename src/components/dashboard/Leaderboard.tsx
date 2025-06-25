'use client';

import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, Users, Search } from "lucide-react";

interface Trader {
  id: string;
  username: string;
  displayName: string;
  rank: number;
  totalPnL: number;
  winRate: number;
}

export function Leaderboard() {
  const [searchTerm, setSearchTerm] = useState('');

  const traders: Trader[] = [
    {
      id: '1',
      username: 'KhushiTrader',
      displayName: 'Khushi Diwan',
      rank: 1,
      totalPnL: 52340.90,
      winRate: 89.2
    },
    {
      id: '2',
      username: 'VaanyaInvestor',
      displayName: 'Vaanya Goel',
      rank: 2,
      totalPnL: 48150.65,
      winRate: 86.7
    },
    {
      id: '3',
      username: 'NikitaTrader',
      displayName: 'Nikita Chaudhary',
      rank: 3,
      totalPnL: 43890.40,
      winRate: 84.3
    },
    {
      id: '4',
      username: 'CryptoKing2024',
      displayName: 'Alex Chen',
      rank: 4,
      totalPnL: 40250.75,
      winRate: 81.5
    },
    {
      id: '5',
      username: 'SportsBetMaster',
      displayName: 'Priya Sharma',
      rank: 5,
      totalPnL: 38920.30,
      winRate: 80.1
    },
    {
      id: '6',
      username: 'TechAnalyst',
      displayName: 'Rahul Kumar',
      rank: 6,
      totalPnL: 32450.80,
      winRate: 77.8
    }
  ];

  const filteredTraders = traders.filter(trader => 
    trader.displayName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { 
      style: 'currency', 
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="p-8 bg-gray-50 min-h-full">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Leaderboard</h1>
            <p className="text-gray-600">Top traders and their performance rankings</p>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4 bg-white border-0 shadow-sm">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="p-1 bg-blue-100 rounded">
                  <Users className="h-4 w-4 text-blue-600" />
                </div>
                <span className="text-sm font-medium text-gray-600">Total Traders</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{traders.length}</p>
            </div>
          </Card>

          <Card className="p-4 bg-white border-0 shadow-sm">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="p-1 bg-green-100 rounded">
                  <Trophy className="h-4 w-4 text-green-600" />
                </div>
                <span className="text-sm font-medium text-gray-600">Top Performer</span>
              </div>
              <p className="text-lg font-bold text-gray-900">{traders[0]?.displayName || 'N/A'}</p>
            </div>
          </Card>

          <Card className="p-4 bg-white border-0 shadow-sm">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="p-1 bg-purple-100 rounded">
                  <Trophy className="h-4 w-4 text-purple-600" />
                </div>
                <span className="text-sm font-medium text-gray-600">Avg Win Rate</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {(traders.reduce((sum, t) => sum + t.winRate, 0) / traders.length).toFixed(1)}%
              </p>
            </div>
          </Card>
        </div>

        {/* Search */}
        <Card className="p-6 bg-white border-0 shadow-sm">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search traders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </Card>

        {/* Leaderboard */}
        <Card className="bg-white border-0 shadow-sm">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Rankings</h3>
            
            {filteredTraders.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No traders found</h3>
                <p className="text-gray-600 mb-4">Try adjusting your search criteria.</p>
                <Button onClick={() => setSearchTerm('')}>
                  Clear Search
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTraders.map((trader) => (
                  <div key={trader.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                          <span className="text-sm font-bold text-blue-600">#{trader.rank}</span>
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900">{trader.displayName}</h4>
                          <p className="text-sm text-gray-600">@{trader.username}</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-8 text-sm">
                        <div className="text-center">
                          <p className="text-gray-500">P&L</p>
                          <p className="font-bold text-green-600">{formatCurrency(trader.totalPnL)}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-gray-500">Win Rate</p>
                          <p className="font-bold">{trader.winRate.toFixed(1)}%</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
} 