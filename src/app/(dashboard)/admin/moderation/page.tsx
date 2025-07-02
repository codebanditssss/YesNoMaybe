'use client';

import { useState, useEffect } from 'react';
import { 
  Flag, 
  AlertTriangle, 
  User, 
  MessageSquare, 
  Shield, 
  Eye,
  EyeOff,
  Ban,
  UserX,
  Check,
  X,
  Clock,
  Search,
  Filter,
  ChevronDown,
  MoreHorizontal
} from 'lucide-react';

interface Report {
  id: string;
  type: 'user' | 'market' | 'comment';
  subject: string;
  reportedBy: string;
  reason: string;
  description: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  createdAt: string;
  reportedUser?: string;
  reportedContent?: string;
}

interface ModerationAction {
  id: string;
  type: 'warning' | 'suspension' | 'ban' | 'content_removal';
  target: string;
  reason: string;
  moderator: string;
  timestamp: string;
}

export default function Moderation() {
  const [reports, setReports] = useState<Report[]>([
    {
      id: '1',
      type: 'user',
      subject: 'Inappropriate username and behavior',
      reportedBy: 'john_doe_trader',
      reportedUser: 'offensive_user123',
      reason: 'Harassment/Bullying',
      description: 'User has been sending threatening messages and using offensive language in market discussions.',
      status: 'pending',
      priority: 'high',
      createdAt: '2024-01-15T10:30:00Z'
    },
    {
      id: '2',
      type: 'market',
      subject: 'Misleading market description',
      reportedBy: 'trader_alert',
      reportedContent: 'Will Bitcoin reach $1M by tomorrow?',
      reason: 'Misinformation',
      description: 'Market description contains false information and unrealistic timeframes.',
      status: 'pending',
      priority: 'medium',
      createdAt: '2024-01-15T09:15:00Z'
    },
    {
      id: '3',
      type: 'comment',
      subject: 'Spam in market comments',
      reportedBy: 'crypto_analyst',
      reportedUser: 'spam_bot_user',
      reportedContent: 'Buy our premium signals! Link in bio!',
      reason: 'Spam',
      description: 'User posting promotional content and spam links repeatedly.',
      status: 'reviewed',
      priority: 'low',
      createdAt: '2024-01-15T08:45:00Z'
    },
    {
      id: '4',
      type: 'user',
      subject: 'Suspected market manipulation',
      reportedBy: 'vigilant_trader',
      reportedUser: 'manipulator_account',
      reason: 'Market Manipulation',
      description: 'User appears to be coordinating with others to artificially inflate market prices.',
      status: 'pending',
      priority: 'critical',
      createdAt: '2024-01-15T07:20:00Z'
    }
  ]);

  const [recentActions, setRecentActions] = useState<ModerationAction[]>([
    {
      id: '1',
      type: 'suspension',
      target: 'toxic_trader_99',
      reason: 'Repeated harassment of other users',
      moderator: 'admin_sarah',
      timestamp: '2024-01-15T11:00:00Z'
    },
    {
      id: '2',
      type: 'content_removal',
      target: 'Fake news market about political events',
      reason: 'Misinformation and false claims',
      moderator: 'admin_mike',
      timestamp: '2024-01-15T10:45:00Z'
    },
    {
      id: '3',
      type: 'warning',
      target: 'new_user_123',
      reason: 'Minor guideline violation',
      moderator: 'admin_sarah',
      timestamp: '2024-01-15T10:30:00Z'
    }
  ]);

  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  const filteredReports = reports.filter(report => {
    const matchesStatus = selectedStatus === 'all' || report.status === selectedStatus;
    const matchesPriority = selectedPriority === 'all' || report.priority === selectedPriority;
    const matchesSearch = report.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.reportedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (report.reportedUser && report.reportedUser.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesStatus && matchesPriority && matchesSearch;
  });

  const getReportTypeIcon = (type: string) => {
    switch (type) {
      case 'user':
        return <User className="h-4 w-4" />;
      case 'market':
        return <Flag className="h-4 w-4" />;
      case 'comment':
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'reviewed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'resolved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'dismissed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'suspension':
        return <Clock className="h-4 w-4 text-orange-600" />;
      case 'ban':
        return <Ban className="h-4 w-4 text-red-600" />;
      case 'content_removal':
        return <EyeOff className="h-4 w-4 text-blue-600" />;
      default:
        return <Shield className="h-4 w-4 text-gray-600" />;
    }
  };

  const handleReportAction = (reportId: string, action: string) => {
    setReports(prev => prev.map(report => 
      report.id === reportId 
        ? { ...report, status: action === 'approve' ? 'resolved' : 'dismissed' }
        : report
    ));
    
    // Add to recent actions
    const report = reports.find(r => r.id === reportId);
    if (report) {
      const newAction: ModerationAction = {
        id: Date.now().toString(),
        type: action === 'approve' ? 'content_removal' : 'warning',
        target: report.reportedUser || report.reportedContent || 'Unknown',
        reason: `Report ${action === 'approve' ? 'approved' : 'dismissed'}: ${report.reason}`,
        moderator: 'admin_current',
        timestamp: new Date().toISOString()
      };
      setRecentActions(prev => [newAction, ...prev]);
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now.getTime() - time.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffHours > 0) {
      return `${diffHours}h ago`;
    } else {
      return `${diffMins}m ago`;
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Flag className="h-8 w-8 text-red-600 mr-3" />
            Content Moderation
          </h1>
          <p className="mt-2 text-gray-600">
            Review reported content and manage platform safety
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500">
            {reports.filter(r => r.status === 'pending').length} pending reports
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Reports</p>
              <p className="text-3xl font-bold text-orange-600">
                {reports.filter(r => r.status === 'pending').length}
              </p>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Critical Priority</p>
              <p className="text-3xl font-bold text-red-600">
                {reports.filter(r => r.priority === 'critical').length}
              </p>
            </div>
            <div className="p-3 bg-red-50 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Actions Today</p>
              <p className="text-3xl font-bold text-blue-600">
                {recentActions.length}
              </p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <Shield className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Resolution Rate</p>
              <p className="text-3xl font-bold text-green-600">94%</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <Check className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="reviewed">Reviewed</option>
              <option value="resolved">Resolved</option>
              <option value="dismissed">Dismissed</option>
            </select>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="all">All Priorities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reports List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">Reports Queue</h2>
          <div className="space-y-4">
            {filteredReports.map((report) => (
              <div key={report.id} className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      {getReportTypeIcon(report.type)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{report.subject}</h3>
                      <p className="text-sm text-gray-600">
                        Reported by: {report.reportedBy}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(report.priority)}`}>
                      {report.priority}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(report.status)}`}>
                      {report.status}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Reason:</span>
                    <span className="text-sm text-gray-900">{report.reason}</span>
                  </div>
                  {report.reportedUser && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">Reported User:</span>
                      <span className="text-sm text-gray-900">{report.reportedUser}</span>
                    </div>
                  )}
                  {report.reportedContent && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">Content:</span>
                      <span className="text-sm text-gray-900 truncate max-w-48">{report.reportedContent}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Time:</span>
                    <span className="text-sm text-gray-900">{formatTimeAgo(report.createdAt)}</span>
                  </div>
                </div>

                <p className="text-sm text-gray-700 mb-4">{report.description}</p>

                {report.status === 'pending' && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleReportAction(report.id, 'approve')}
                      className="flex-1 flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Take Action
                    </button>
                    <button
                      onClick={() => handleReportAction(report.id, 'dismiss')}
                      className="flex-1 flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Dismiss
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Recent Actions */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">Recent Moderation Actions</h2>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="space-y-4">
              {recentActions.map((action) => (
                <div key={action.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0">
                    {getActionIcon(action.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 capitalize">
                      {action.type.replace('_', ' ')}
                    </p>
                    <p className="text-sm text-gray-600 truncate">
                      Target: {action.target}
                    </p>
                    <p className="text-xs text-gray-500">
                      {action.reason}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">{action.moderator}</p>
                    <p className="text-xs text-gray-500">{formatTimeAgo(action.timestamp)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full flex items-center justify-between p-3 text-left bg-gray-50 rounded-lg hover:bg-gray-100">
                <div className="flex items-center">
                  <UserX className="h-5 w-5 text-red-600 mr-3" />
                  <span className="font-medium">Suspend User</span>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </button>
              <button className="w-full flex items-center justify-between p-3 text-left bg-gray-50 rounded-lg hover:bg-gray-100">
                <div className="flex items-center">
                  <Ban className="h-5 w-5 text-red-600 mr-3" />
                  <span className="font-medium">Ban User</span>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </button>
              <button className="w-full flex items-center justify-between p-3 text-left bg-gray-50 rounded-lg hover:bg-gray-100">
                <div className="flex items-center">
                  <EyeOff className="h-5 w-5 text-blue-600 mr-3" />
                  <span className="font-medium">Remove Content</span>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </button>
              <button className="w-full flex items-center justify-between p-3 text-left bg-gray-50 rounded-lg hover:bg-gray-100">
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mr-3" />
                  <span className="font-medium">Issue Warning</span>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 