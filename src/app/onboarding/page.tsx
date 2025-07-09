"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { ClientRedirectManager } from '@/lib/redirect-manager';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  User, 
  MapPin, 
  Globe, 
  Twitter, 
  CheckCircle, 
  Loader2,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';

interface OnboardingData {
  username: string;
  full_name: string;
  bio: string;
  location: string;
  website: string;
  twitter_handle: string;
}

export default function OnboardingPage() {
  const router = useRouter();
  const { user, checkOnboardingStatus } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<OnboardingData>({
    username: '',
    full_name: '',
    bio: '',
    location: '',
    website: '',
    twitter_handle: ''
  });

useEffect(() => {
  if (!user) {
    ClientRedirectManager.redirect(
      router, 
      '/', 
      'No user found, redirecting to home'
    );
  }
}, [user, router]);

  const steps = [
    {
      id: 1,
      title: 'Basic Information',
      description: 'Tell us about yourself',
      fields: ['username', 'full_name']
    },
    {
      id: 2,
      title: 'Profile Details',
      description: 'Add some personal details',
      fields: ['bio', 'location']
    },
    {
      id: 3,
      title: 'Social Links',
      description: 'Connect your social profiles',
      fields: ['website', 'twitter_handle']
    }
  ];

  const currentStepData = steps.find(step => step.id === currentStep);

  const handleInputChange = (field: keyof OnboardingData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError('');
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!formData.username.trim() || !formData.full_name.trim()) {
          setError('Please fill in all required fields.');
          return false;
        }
        if (formData.username.length < 3) {
          setError('Username must be at least 3 characters long.');
          return false;
        }
        if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
          setError('Username can only contain letters, numbers, and underscores.');
          return false;
        }
        break;
      case 2:
        if (!formData.bio.trim()) {
          setError('Please add a bio to your profile.');
          return false;
        }
        break;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < steps.length) {
        setCurrentStep(currentStep + 1);
      } else {
        handleSubmit();
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setError('');
    }
  };

  const handleSubmit = async () => {
    if (loading || !user || !user.id) return;

    setLoading(true);
    setError('');

    try {
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', formData.username as any)
        .neq('id', user.id as any)
        .single();

      if (existingUser) {
        setError('Username is already taken. Please choose a different one.');
        setLoading(false);
        return;
      }

      const profileUpdate = {
        username: formData.username.trim() ? formData.username : null,
        full_name: formData.full_name.trim() ? formData.full_name : null,
        bio: formData.bio.trim() ? formData.bio : null,
        location: formData.location.trim() ? formData.location : null,
        website: formData.website.trim() ? formData.website : null,
        twitter_handle: formData.twitter_handle.trim() ? formData.twitter_handle : null,
      };

      const { error } = await supabase
        .from('profiles')
        .update(profileUpdate as any)
        .eq('id', user.id as any);

      if (error) {
        throw error;
      }

      // Create user balance record if it doesn't exist
      const balanceInsert = {
        user_id: user.id,
        available_balance: 10,
        locked_balance: 0,
        total_deposited: 0,
        total_withdrawn: 0,
        total_trades: 0,
        total_volume: 0,
        total_profit_loss: 0,
        winning_trades: 0,
      };

      const { error: balanceError } = await supabase
        .from('user_balances')
        .upsert([balanceInsert as any]);

      if (balanceError) {
        console.error('Error creating user balance:', balanceError);
      }

      await checkOnboardingStatus();
      ClientRedirectManager.redirect(
        router, 
        '/dashboard', 
        'Onboarding completed successfully'
      );
    } catch (err) {
      console.error('Onboarding error:', err);
      setError('Failed to save your profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderField = (field: keyof OnboardingData) => {
    const fieldConfig = {
      username: {
        label: 'Username',
        placeholder: 'Enter your username',
        icon: User,
        type: 'text',
        required: true
      },
      full_name: {
        label: 'Full Name',
        placeholder: 'Enter your full name',
        icon: User,
        type: 'text',
        required: true
      },
      bio: {
        label: 'Bio',
        placeholder: 'Tell us about yourself...',
        icon: User,
        type: 'textarea',
        required: true
      },
      location: {
        label: 'Location',
        placeholder: 'Where are you based?',
        icon: MapPin,
        type: 'text',
        required: false
      },
      website: {
        label: 'Website',
        placeholder: 'https://yourwebsite.com',
        icon: Globe,
        type: 'url',
        required: false
      },
      twitter_handle: {
        label: 'Twitter Handle',
        placeholder: '@username',
        icon: Twitter,
        type: 'text',
        required: false
      }
    };

    const config = fieldConfig[field];
    const Icon = config.icon;

    if (config.type === 'textarea') {
      return (
        <div key={field} className="space-y-2">
          <Label htmlFor={field} className="flex items-center gap-2">
            <Icon className="h-4 w-4" />
            {config.label}
            {config.required && <span className="text-red-500">*</span>}
          </Label>
          <Textarea
            id={field}
            value={formData[field]}
            onChange={(e) => handleInputChange(field, e.target.value)}
            placeholder={config.placeholder}
            className="min-h-[100px]"
          />
        </div>
      );
    }

    return (
      <div key={field} className="space-y-2">
        <Label htmlFor={field} className="flex items-center gap-2">
          <Icon className="h-4 w-4" />
          {config.label}
          {config.required && <span className="text-red-500">*</span>}
        </Label>
        <Input
          id={field}
          type={config.type}
          value={formData[field]}
          onChange={(e) => handleInputChange(field, e.target.value)}
          placeholder={config.placeholder}
        />
      </div>
    );
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-white border-0 shadow-lg">
        <div className="p-8">
          <div className="max-w-md w-full space-y-8">
            <div>
              <img src="/logo.svg" alt="Augur" className="h-12 mx-auto mb-8" />
              <h2 className="mt-6 text-center text-3xl font-light text-gray-900">
                Welcome to Augur
              </h2>
              <p className="mt-2 text-center text-sm text-gray-600">
                Complete your profile to start trading
              </p>
            </div>

            <div className="flex items-center justify-between mb-8">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                    step.id <= currentStep 
                      ? 'bg-blue-600 border-blue-600 text-white' 
                      : 'border-gray-300 text-gray-500'
                  }`}>
                    {step.id < currentStep ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <span className="text-sm font-medium">{step.id}</span>
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-16 h-0.5 mx-2 ${
                      step.id < currentStep ? 'bg-blue-600' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              ))}
            </div>

            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-1">
                {currentStepData?.title}
              </h2>
              <p className="text-gray-600">{currentStepData?.description}</p>
            </div>

            <div className="space-y-6 mb-8">
              {currentStepData?.fields.map(field => 
                renderField(field as keyof OnboardingData)
              )}
            </div>

            {error && (
              <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 1}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Previous
              </Button>

              <Button
                onClick={handleNext}
                disabled={loading}
                className="flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : currentStep === steps.length ? (
                  <>
                    Complete Setup
                    <CheckCircle className="h-4 w-4" />
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>

            {currentStep === 3 && (
              <div className="text-center mt-6">
                <Button
                  variant="ghost"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="text-gray-500 hover:text-gray-700"
                >
                  Skip for now
                </Button>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
} 