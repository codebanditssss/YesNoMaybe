'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  DollarSign,
  Eye,
  EyeOff,
  Mail,
  Phone,
  Camera,
  Lock,
  Key,
  Smartphone,
  Download,
  Trash2,
  LogOut,
  Settings as SettingsIcon,
  Moon,
  Sun,
  Monitor,
  Volume2,
  VolumeX,
  ToggleLeft,
  ToggleRight,
  Edit3,
  Save,
  X
} from 'lucide-react';

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  avatar: string;
  joinDate: string;
  verified: boolean;
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond';
}

interface NotificationSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
  marketAlerts: boolean;
  priceAlerts: boolean;
  tradeConfirmations: boolean;
  weeklyReport: boolean;
  promotions: boolean;
}

interface PrivacySettings {
  profileVisibility: 'public' | 'friends' | 'private';
  showTradeHistory: boolean;
  showPortfolio: boolean;
  showLeaderboard: boolean;
  twoFactorAuth: boolean;
}

interface AppPreferences {
  theme: 'light' | 'dark' | 'system';
  language: 'en' | 'hi' | 'ta' | 'te' | 'bn';
  currency: 'INR' | 'USD' | 'EUR';
  soundEffects: boolean;
  animations: boolean;
  compactView: boolean;
  autoRefresh: boolean;
  refreshInterval: number;
}

export function Settings() {
  const [activeSection, setActiveSection] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: 'Khushi Diwan',
    email: 'khushi@example.com',
    phone: '+91 98765 43210',
    avatar: '',
    joinDate: '2024-01-15',
    verified: true,
    tier: 'Diamond'
  });

  const [notifications, setNotifications] = useState<NotificationSettings>({
    email: true,
    push: true,
    sms: false,
    marketAlerts: true,
    priceAlerts: true,
    tradeConfirmations: true,
    weeklyReport: true,
    promotions: false
  });

  const [privacy, setPrivacy] = useState<PrivacySettings>({
    profileVisibility: 'public',
    showTradeHistory: true,
    showPortfolio: false,
    showLeaderboard: true,
    twoFactorAuth: true
  });

  const [preferences, setPreferences] = useState<AppPreferences>({
    theme: 'system',
    language: 'en',
    currency: 'INR',
    soundEffects: true,
    animations: true,
    compactView: false,
    autoRefresh: true,
    refreshInterval: 30
  });

  const [tempProfile, setTempProfile] = useState(userProfile);

  const settingsSections = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'preferences', label: 'Preferences', icon: SettingsIcon },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy & Security', icon: Shield },
    { id: 'account', label: 'Account', icon: Key }
  ];

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिंदी' },
    { code: 'ta', name: 'தமிழ்' },
    { code: 'te', name: 'తెలుగు' },
    { code: 'bn', name: 'বাংলা' }
  ];

  const currencies = [
    { code: 'INR', name: 'Indian Rupee (₹)' },
    { code: 'USD', name: 'US Dollar ($)' },
    { code: 'EUR', name: 'Euro (€)' }
  ];

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Diamond': return 'bg-cyan-100 text-cyan-800 border-cyan-200';
      case 'Platinum': return 'bg-slate-100 text-slate-800 border-slate-200';
      case 'Gold': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Silver': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-orange-100 text-orange-800 border-orange-200';
    }
  };

  const handleSaveProfile = () => {
    setUserProfile(tempProfile);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setTempProfile(userProfile);
    setIsEditing(false);
  };

  const toggleNotification = (key: keyof NotificationSettings) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const togglePrivacy = (key: keyof PrivacySettings) => {
    setPrivacy(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const updatePreference = (key: keyof AppPreferences, value: any) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  const renderProfileSection = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Information
            <Badge className={`ml-auto ${getTierColor(userProfile.tier)}`}>
              {userProfile.tier} Tier
            </Badge>
          </CardTitle>
          <CardDescription>
            Manage your personal information and account details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Profile Picture */}
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                {userProfile.name.split(' ').map(n => n[0]).join('')}
              </div>
              <button className="absolute -bottom-1 -right-1 bg-white rounded-full p-1.5 shadow-md border hover:bg-gray-50">
                <Camera className="h-4 w-4 text-gray-600" />
              </button>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{userProfile.name}</h3>
              <p className="text-gray-600">{userProfile.email}</p>
              <p className="text-sm text-gray-500">
                Member since {new Date(userProfile.joinDate).toLocaleDateString('en-IN', { 
                  month: 'long', year: 'numeric' 
                })}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {userProfile.verified && (
                <Badge className="bg-green-100 text-green-800">Verified</Badge>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? <X className="h-4 w-4" /> : <Edit3 className="h-4 w-4" />}
                {isEditing ? 'Cancel' : 'Edit'}
              </Button>
            </div>
          </div>

          {/* Profile Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Full Name</label>
              {isEditing ? (
                <input
                  type="text"
                  value={tempProfile.name}
                  onChange={(e) => setTempProfile(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900">{userProfile.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Address
              </label>
              {isEditing ? (
                <input
                  type="email"
                  value={tempProfile.email}
                  onChange={(e) => setTempProfile(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900">{userProfile.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Phone Number
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  value={tempProfile.phone}
                  onChange={(e) => setTempProfile(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900">{userProfile.phone}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Account Tier</label>
              <Badge className={getTierColor(userProfile.tier)}>
                {userProfile.tier} Tier
              </Badge>
            </div>
          </div>

          {isEditing && (
            <div className="flex gap-3 pt-4 border-t">
              <Button onClick={handleSaveProfile} className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                Save Changes
              </Button>
              <Button variant="outline" onClick={handleCancelEdit}>
                Cancel
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderPreferencesSection = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Appearance
          </CardTitle>
          <CardDescription>
            Customize how the app looks and feels
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium">Theme</label>
              <p className="text-sm text-gray-600">Choose your preferred color scheme</p>
            </div>
            <div className="flex gap-2">
              {[
                { value: 'light', icon: Sun, label: 'Light' },
                { value: 'dark', icon: Moon, label: 'Dark' },
                { value: 'system', icon: Monitor, label: 'System' }
              ].map(({ value, icon: Icon, label }) => (
                <Button
                  key={value}
                  variant={preferences.theme === value ? "default" : "outline"}
                  size="sm"
                  onClick={() => updatePreference('theme', value)}
                  className="flex items-center gap-2"
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium">Sound Effects</label>
              <p className="text-sm text-gray-600">Enable audio feedback for actions</p>
            </div>
            <button
              onClick={() => updatePreference('soundEffects', !preferences.soundEffects)}
              className="flex items-center gap-2"
            >
              {preferences.soundEffects ? (
                <Volume2 className="h-5 w-5 text-blue-600" />
              ) : (
                <VolumeX className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium">Animations</label>
              <p className="text-sm text-gray-600">Enable smooth transitions and animations</p>
            </div>
            <button
              onClick={() => updatePreference('animations', !preferences.animations)}
            >
              {preferences.animations ? (
                <ToggleRight className="h-6 w-6 text-blue-600" />
              ) : (
                <ToggleLeft className="h-6 w-6 text-gray-400" />
              )}
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium">Compact View</label>
              <p className="text-sm text-gray-600">Show more information in less space</p>
            </div>
            <button
              onClick={() => updatePreference('compactView', !preferences.compactView)}
            >
              {preferences.compactView ? (
                <ToggleRight className="h-6 w-6 text-blue-600" />
              ) : (
                <ToggleLeft className="h-6 w-6 text-gray-400" />
              )}
            </button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Localization
          </CardTitle>
          <CardDescription>
            Set your language and regional preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="font-medium">Language</label>
              <select
                value={preferences.language}
                onChange={(e) => updatePreference('language', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {languages.map(lang => (
                  <option key={lang.code} value={lang.code}>{lang.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="font-medium">Currency</label>
              <select
                value={preferences.currency}
                onChange={(e) => updatePreference('currency', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {currencies.map(curr => (
                  <option key={curr.code} value={curr.code}>{curr.name}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon className="h-5 w-5" />
            Data & Refresh
          </CardTitle>
          <CardDescription>
            Control how the app updates and refreshes data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium">Auto Refresh</label>
              <p className="text-sm text-gray-600">Automatically update market data</p>
            </div>
            <button
              onClick={() => updatePreference('autoRefresh', !preferences.autoRefresh)}
            >
              {preferences.autoRefresh ? (
                <ToggleRight className="h-6 w-6 text-blue-600" />
              ) : (
                <ToggleLeft className="h-6 w-6 text-gray-400" />
              )}
            </button>
          </div>

          {preferences.autoRefresh && (
            <div className="space-y-2">
              <label className="font-medium">Refresh Interval</label>
              <select
                value={preferences.refreshInterval}
                onChange={(e) => updatePreference('refreshInterval', Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={10}>Every 10 seconds</option>
                <option value={30}>Every 30 seconds</option>
                <option value={60}>Every minute</option>
                <option value={300}>Every 5 minutes</option>
              </select>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderNotificationsSection = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Preferences
          </CardTitle>
          <CardDescription>
            Choose how you want to be notified about important events
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Delivery Methods</h4>
            {[
              { key: 'email', label: 'Email Notifications', desc: 'Receive notifications via email' },
              { key: 'push', label: 'Push Notifications', desc: 'Get browser/app notifications' },
              { key: 'sms', label: 'SMS Notifications', desc: 'Receive text messages for urgent updates' }
            ].map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <label className="font-medium">{label}</label>
                  <p className="text-sm text-gray-600">{desc}</p>
                </div>
                <button
                  onClick={() => toggleNotification(key as keyof NotificationSettings)}
                >
                  {notifications[key as keyof NotificationSettings] ? (
                    <ToggleRight className="h-6 w-6 text-blue-600" />
                  ) : (
                    <ToggleLeft className="h-6 w-6 text-gray-400" />
                  )}
                </button>
              </div>
            ))}
          </div>

          <div className="border-t pt-4">
            <h4 className="font-medium text-gray-900 mb-4">Notification Types</h4>
            {[
              { key: 'marketAlerts', label: 'Market Alerts', desc: 'Price movements and market events' },
              { key: 'priceAlerts', label: 'Price Alerts', desc: 'Custom price threshold notifications' },
              { key: 'tradeConfirmations', label: 'Trade Confirmations', desc: 'Order executions and settlements' },
              { key: 'weeklyReport', label: 'Weekly Reports', desc: 'Performance summaries and insights' },
              { key: 'promotions', label: 'Promotions', desc: 'Special offers and new features' }
            ].map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between py-2">
                <div>
                  <label className="font-medium">{label}</label>
                  <p className="text-sm text-gray-600">{desc}</p>
                </div>
                <button
                  onClick={() => toggleNotification(key as keyof NotificationSettings)}
                >
                  {notifications[key as keyof NotificationSettings] ? (
                    <ToggleRight className="h-6 w-6 text-blue-600" />
                  ) : (
                    <ToggleLeft className="h-6 w-6 text-gray-400" />
                  )}
                </button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderPrivacySection = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Privacy Settings
          </CardTitle>
          <CardDescription>
            Control what information is visible to other users
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="font-medium">Profile Visibility</label>
            <select
              value={privacy.profileVisibility}
              onChange={(e) => setPrivacy(prev => ({ ...prev, profileVisibility: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="public">Public - Anyone can see your profile</option>
              <option value="friends">Friends - Only connections can see</option>
              <option value="private">Private - Only you can see</option>
            </select>
          </div>

          {[
            { key: 'showTradeHistory', label: 'Show Trade History', desc: 'Allow others to see your trading activity' },
            { key: 'showPortfolio', label: 'Show Portfolio', desc: 'Display your current positions and performance' },
            { key: 'showLeaderboard', label: 'Appear on Leaderboard', desc: 'Include your performance in public rankings' }
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <label className="font-medium">{label}</label>
                <p className="text-sm text-gray-600">{desc}</p>
              </div>
              <button
                onClick={() => togglePrivacy(key as keyof PrivacySettings)}
              >
                {privacy[key as keyof PrivacySettings] ? (
                  <ToggleRight className="h-6 w-6 text-blue-600" />
                ) : (
                  <ToggleLeft className="h-6 w-6 text-gray-400" />
                )}
              </button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security
          </CardTitle>
          <CardDescription>
            Protect your account with additional security measures
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium">Two-Factor Authentication</label>
              <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
            </div>
            <div className="flex items-center gap-2">
              {privacy.twoFactorAuth && (
                <Badge className="bg-green-100 text-green-800">Enabled</Badge>
              )}
              <button
                onClick={() => togglePrivacy('twoFactorAuth')}
              >
                {privacy.twoFactorAuth ? (
                  <ToggleRight className="h-6 w-6 text-green-600" />
                ) : (
                  <ToggleLeft className="h-6 w-6 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t">
            <Button variant="outline" className="w-full justify-start">
              <Lock className="h-4 w-4 mr-2" />
              Change Password
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Smartphone className="h-4 w-4 mr-2" />
              Manage Connected Devices
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Key className="h-4 w-4 mr-2" />
              API Keys & Integrations
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderAccountSection = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Data Export
          </CardTitle>
          <CardDescription>
            Download your account data and trading history
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="outline" className="w-full justify-start">
            <Download className="h-4 w-4 mr-2" />
            Export Trading History
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <Download className="h-4 w-4 mr-2" />
            Export Account Data
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <Download className="h-4 w-4 mr-2" />
            Export Tax Reports
          </Button>
        </CardContent>
      </Card>

      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <Trash2 className="h-5 w-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>
            Irreversible actions that affect your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="outline" className="w-full justify-start text-orange-600 border-orange-200 hover:bg-orange-50">
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out All Devices
          </Button>
          <Button variant="outline" className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50">
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Account
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  const renderSection = () => {
    switch (activeSection) {
      case 'profile': return renderProfileSection();
      case 'preferences': return renderPreferencesSection();
      case 'notifications': return renderNotificationsSection();
      case 'privacy': return renderPrivacySection();
      case 'account': return renderAccountSection();
      default: return renderProfileSection();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-2">Manage your account preferences and security settings</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Settings Navigation */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-0">
                <nav className="space-y-1">
                  {settingsSections.map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      onClick={() => setActiveSection(id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                        activeSection === id 
                          ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600' 
                          : 'text-gray-700'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      {label}
                    </button>
                  ))}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Settings Content */}
          <div className="lg:col-span-3">
            {renderSection()}
          </div>
        </div>
      </div>
    </div>
  );
} 