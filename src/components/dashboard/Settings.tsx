'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  User,
  Bell,
  Palette,
  Globe,
  Mail,
  Camera,
  Settings as SettingsIcon,
  Moon,
  Sun,
  ToggleLeft,
  ToggleRight,
  Edit3,
  Save,
  X,
  Twitter,
  AlertCircle
} from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';

type EditableProfileFields = {
  full_name: string;
  twitter_handle: string;
  username: string;
  bio: string;
  location: string;
  website: string;
}

interface NotificationSettings {
  email: boolean;
  marketAlerts: boolean;
  tradeConfirmations: boolean;
  promotions: boolean;
}

interface AppPreferences {
  theme: 'light' | 'dark' | 'system';
}

export function Settings() {
  const [activeSection, setActiveSection] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const { profile, loading, saving, error, updateProfile, uploadAvatar } = useProfile();
  const [tempProfile, setTempProfile] = useState<EditableProfileFields>({
    full_name: '',
    twitter_handle: '',
    username: '',
    bio: '',
    location: '',
    website: '',
  });

  const [notifications, setNotifications] = useState<NotificationSettings>({
    email: true,
    marketAlerts: true,
    tradeConfirmations: true,
    promotions: false
  });


  const [preferences, setPreferences] = useState<AppPreferences>({
    theme: 'system',
  });

  const [errorMessage, setError] = useState<string | null>(null);

  const settingsSections = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'preferences', label: 'Preferences', icon: SettingsIcon },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (JPEG, PNG, etc.)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    try {
      await uploadAvatar(file);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      console.error('Error uploading avatar:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload avatar');
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  useEffect(() => {
    if (profile) {
      setTempProfile({
        full_name: profile.full_name || '',
        twitter_handle: profile.twitter_handle || '',
        username: profile.username || '',
        bio: profile.bio || '',
        location: profile.location || '',
        website: profile.website || '',
      });
    }
  }, [profile]);

  const handleSaveProfile = async () => {
    try {
      const updated = await updateProfile({
        full_name: tempProfile.full_name,
        twitter_handle: tempProfile.twitter_handle,
        username: tempProfile.username,
        bio: tempProfile.bio,
        location: tempProfile.location,
        website: tempProfile.website,
      });
  
      if (updated) {
        setIsEditing(false);
      }
    } catch (err) {
      console.error("Save profile error:", err);
    }
  };

  const handleCancelEdit = () => {
    setTempProfile({
      full_name: profile?.full_name || '',
      twitter_handle: profile?.twitter_handle || '',
      username: profile?.username || '',
      bio: profile?.bio || '',
      location: profile?.location || '',
      website: profile?.website || '',
    });
    setIsEditing(false);
  };

  const toggleNotification = (key: keyof NotificationSettings) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const updatePreference = (key: keyof AppPreferences, value: any) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  const renderProfileSection = () => (
    <div className="space-y-6">
      {/* Error Display */}
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span className="font-medium text-sm">{errorMessage}</span>
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Information
          </CardTitle>
          <CardDescription>
            Manage your personal information and account details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Loading State */}
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading profile...</span>
            </div>
          ) : (
            <>
              {/* Profile Picture */}
              <div className="flex items-center gap-6">
                <div className="relative">
                  {profile?.avatar_url ? (
                    <img 
                      src={profile.avatar_url} 
                      alt={profile.full_name || 'Profile'} 
                      className="h-20 w-20 rounded-full object-cover border-2 border-white shadow-lg"
                    />
                  ) : (
                    <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                      {profile?.full_name?.split(' ').map(n => n[0]).join('') || profile?.email?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                  <button 
                    onClick={handleUploadClick}
                    className="absolute -bottom-1 -right-1 bg-white rounded-full p-1.5 shadow-md border hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={saving}
                    title="Upload profile picture"
                  >
                    {saving ? (
                      <div className="h-4 w-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Camera className="h-4 w-4 text-gray-600" />
                    )}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    aria-label="Upload profile picture"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{profile?.full_name || 'User'}</h3>
                  <p className="text-gray-600">{profile?.email}</p>
                  <p className="text-sm text-gray-500">
                    Member since {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-IN', { 
                      month: 'long', year: 'numeric' 
                    }) : 'N/A'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(!isEditing)}
                    disabled={saving}
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
                      value={tempProfile.full_name}
                      onChange={(e) => setTempProfile(prev => ({ ...prev, full_name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={saving}
                    />
                  ) : (
                    <p className="text-gray-900">{profile?.full_name || '--'}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email Address
                  </label>
                  <p className="text-gray-900">{profile?.email || "--"}</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Username</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={tempProfile.username}
                      onChange={(e) => setTempProfile(prev => ({ ...prev, username: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={saving}
                    />
                  ) : (
                    <p className="text-gray-900">{profile?.username || '--'}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Bio</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={tempProfile.bio}
                      onChange={(e) => setTempProfile(prev => ({ ...prev, bio: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={saving}
                    />
                  ) : (
                    <p className="text-gray-900">{profile?.bio || '--'}</p>
                  )}
                </div>

                <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Location
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={tempProfile.location}
                      onChange={(e) => setTempProfile(prev => ({ ...prev, location: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={saving}
                    />
                  ) : (
                    <p className="text-gray-900">{profile?.location || '--'}</p>
                  )}
                </div>

                <div className="space-y-2">
                  
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Website
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={tempProfile.website}
                      onChange={(e) => setTempProfile(prev => ({ ...prev, website: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={saving}
                    />
                  ) : (
                    <p className="text-gray-900">{profile?.website || '--'}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Twitter className="h-4 w-4" />
                    Twitter Handle
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={tempProfile.twitter_handle}
                      onChange={(e) => setTempProfile(prev => ({ ...prev, twitter_handle: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={saving}
                    />
                  ) : (
                    <p className="text-gray-900">{profile?.twitter_handle || '--'}</p>
                  )}
                </div>
              </div>

              {isEditing && (
                <div className="flex gap-3 pt-4 border-t">
                  <Button 
                    onClick={handleSaveProfile} 
                    className="flex items-center gap-2"
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleCancelEdit}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </>
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
            {[
              { key: 'email', label: 'Email Notifications', desc: 'Receive notifications via email' },
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
              { key: 'tradeConfirmations', label: 'Trade Confirmations', desc: 'Order executions and settlements' },
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

  const renderSection = () => {
    switch (activeSection) {
      case 'profile': return renderProfileSection();
      case 'preferences': return renderPreferencesSection();
      case 'notifications': return renderNotificationsSection();
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