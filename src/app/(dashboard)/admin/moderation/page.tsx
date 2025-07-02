'use client';

import { useState } from 'react';
import { Flag, AlertTriangle, User, Shield, Check, X, Clock } from 'lucide-react';

interface Report {
  id: string;
  type: 'user' | 'market' | 'comment';
  subject: string;
  reportedBy: string;
  reason: string;
  status: 'pending' | 'resolved' | 'dismissed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  createdAt: string;
}

export default function Moderation() {
  const [reports] = useState<Report[]>([
    {
      id: '1',
      type: 'user',
      subject: 'Inappropriate behavior',
      reportedBy: 'john_doe',
      reason: 'Harassment',
      status: 'pending',
      priority: 'high',
      createdAt: '2024-01-15T10:30:00Z'
    },
    {
      id: '2',
      type: 'market',
      subject: 'Misleading description',
      reportedBy: 'trader_alert',
      reason: 'Misinformation',
      status: 'pending',
      priority: 'medium',
      createdAt: '2024-01-15T09:15:00Z'
    }
  ]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Flag className="h-8 w-8 text-red-600 mr-3" />
            Content Moderation
          </h1>
          <p className="mt-2 text-gray-600">Review reported content and manage platform safety</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Reports</p>
              <p className="text-3xl font-bold text-orange-600">{reports.filter(r => r.status === 'pending').length}</p>
            </div>
            <Clock className="h-8 w-8 text-orange-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Critical Priority</p>
              <p className="text-3xl font-bold text-red-600">{reports.filter(r => r.priority === 'critical').length}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Actions Today</p>
              <p className="text-3xl font-bold text-blue-600">5</p>
            </div>
            <Shield className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Resolution Rate</p>
              <p className="text-3xl font-bold text-green-600">94%</p>
            </div>
            <Check className="h-8 w-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Reports List */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Reports Queue</h2>
        <div className="space-y-4">
          {reports.map((report) => (
            <div key={report.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <User className="h-5 w-5 text-gray-500" />
                  <div>
                    <h3 className="font-semibold text-gray-900">{report.subject}</h3>
                    <p className="text-sm text-gray-600">Reported by: {report.reportedBy}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(report.priority)}`}>
                    {report.priority}
                  </span>
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                    {report.status}
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-700 mb-4">Reason: {report.reason}</p>
              {report.status === 'pending' && (
                <div className="flex space-x-2">
                  <button className="flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700">
                    <Check className="h-4 w-4 mr-2" />
                    Take Action
                  </button>
                  <button className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
                    <X className="h-4 w-4 mr-2" />
                    Dismiss
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 