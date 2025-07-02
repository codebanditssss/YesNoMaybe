'use client';

import { useState } from 'react';
import { FileText, Download, Calendar, TrendingUp, Users, DollarSign, BarChart3 } from 'lucide-react';

interface ReportData {
  name: string;
  description: string;
  type: 'financial' | 'user' | 'activity' | 'system';
  lastGenerated: string;
  size: string;
}

export default function Reports() {
  const [reports] = useState<ReportData[]>([
    {
      name: 'Monthly Financial Report',
      description: 'Complete financial overview including revenue, fees, and P&L',
      type: 'financial',
      lastGenerated: '2024-01-01',
      size: '2.4 MB'
    },
    {
      name: 'User Growth Analysis',
      description: 'User registration, retention, and engagement metrics',
      type: 'user',
      lastGenerated: '2024-01-01',
      size: '1.8 MB'
    },
    {
      name: 'Trading Activity Report',
      description: 'Market performance, trading volume, and user activity',
      type: 'activity',
      lastGenerated: '2024-01-01',
      size: '3.2 MB'
    },
    {
      name: 'System Performance Report',
      description: 'Server metrics, uptime, and technical performance data',
      type: 'system',
      lastGenerated: '2024-01-01',
      size: '1.5 MB'
    }
  ]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'financial': return <DollarSign className="h-5 w-5 text-green-600" />;
      case 'user': return <Users className="h-5 w-5 text-blue-600" />;
      case 'activity': return <TrendingUp className="h-5 w-5 text-purple-600" />;
      case 'system': return <BarChart3 className="h-5 w-5 text-orange-600" />;
      default: return <FileText className="h-5 w-5 text-gray-600" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'financial': return 'bg-green-50 border-green-200';
      case 'user': return 'bg-blue-50 border-blue-200';
      case 'activity': return 'bg-purple-50 border-purple-200';
      case 'system': return 'bg-orange-50 border-orange-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <FileText className="h-8 w-8 text-red-600 mr-3" />
            Reports & Analytics
          </h1>
          <p className="mt-2 text-gray-600">Generate and download comprehensive platform reports</p>
        </div>
        <button className="flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700">
          <Download className="h-4 w-4 mr-2" />
          Generate Custom Report
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Reports</p>
              <p className="text-3xl font-bold text-gray-900">{reports.length}</p>
            </div>
            <FileText className="h-8 w-8 text-red-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Data Size</p>
              <p className="text-3xl font-bold text-gray-900">8.9 MB</p>
            </div>
            <BarChart3 className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Last Updated</p>
              <p className="text-3xl font-bold text-gray-900">Today</p>
            </div>
            <Calendar className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Auto Reports</p>
              <p className="text-3xl font-bold text-gray-900">4</p>
            </div>
            <TrendingUp className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Available Reports */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Available Reports</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reports.map((report, index) => (
            <div key={index} className={`border rounded-lg p-6 ${getTypeColor(report.type)}`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white rounded-lg">
                    {getTypeIcon(report.type)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{report.name}</h3>
                    <p className="text-sm text-gray-600 capitalize">{report.type} Report</p>
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-700 mb-4">{report.description}</p>
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Last generated:</span> {report.lastGenerated}
                </div>
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Size:</span> {report.size}
                </div>
              </div>
              <div className="flex space-x-2">
                <button className="flex-1 flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </button>
                <button className="flex-1 flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                  Generate New
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Export Tools */}
      <div className="mt-8 bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Export Tools</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center justify-center px-4 py-3 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100">
            <Users className="h-5 w-5 mr-2" />
            Export User Data
          </button>
          <button className="flex items-center justify-center px-4 py-3 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100">
            <TrendingUp className="h-5 w-5 mr-2" />
            Export Market Data
          </button>
          <button className="flex items-center justify-center px-4 py-3 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100">
            <DollarSign className="h-5 w-5 mr-2" />
            Export Financial Data
          </button>
        </div>
      </div>
    </div>
  );
} 