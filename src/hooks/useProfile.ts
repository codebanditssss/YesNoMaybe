"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  username: string | null;
  bio: string | null;
  location: string | null;
  website: string | null;
  twitter_handle: string | null;
  avatar_url: string | null;
  is_verified: boolean;
  total_trades: number;
  total_winnings: number;
  win_rate: number;
  reputation_score: number;
  created_at: string;
  updated_at: string;
}

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch profile data
  useEffect(() => {
    if (user) {
      fetchProfile();
    } else {
      setProfile(null);
      setLoading(false);
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        // PGRST116 is "not found" error
        throw error;
      }

      if (data) {
        // Ensure is_verified is boolean, not null
        setProfile({ ...data, is_verified: data.is_verified ?? false });
      } else {
        // Create a profile if it doesn't exist
        await createProfile();
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const createProfile = async () => {
    if (!user) return;

    try {
      const newProfile = {
        id: user.id,
        email: user.email!,
        full_name: null,
        username: null,
        bio: null,
        location: null,
        website: null,
        twitter_handle: null,
        avatar_url: null,
        is_verified: false,
        total_trades: 0,
        total_winnings: 0,
        win_rate: 0,
        reputation_score: 0,
      };

      const { data, error } = await supabase
        .from("profiles")
        .insert([newProfile])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setProfile({ ...data, is_verified: data.is_verified ?? false });
      }
    } catch (err) {
      console.error("Error creating profile:", err);
      setError("Failed to create profile");
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user || !profile) return null;

    try {
      setSaving(true);
      setError(null);

      const { data, error } = await supabase
        .from("profiles")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setProfile({ ...data, is_verified: data.is_verified ?? false });
      }
      return data;
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("Failed to update profile");
      return null;
    } finally {
      setSaving(false);
    }
  };

  const uploadAvatar = async (file: File) => {
    if (!user || !profile) {
      setError("User not authenticated");
      return null;
    }
    
    try {
      setSaving(true);
      setError(null);

      // 1. Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.error("Storage upload error:", uploadError);
        setError(`Failed to upload image: ${uploadError.message}`);
        return null;
      }

      // 2. Get public URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      if (!urlData?.publicUrl) {
        console.error("Get public URL error: No public URL returned");
        setError(`Failed to get image URL`);
        return null;
      }

      // 3. Update profile with new avatar URL
      const { data, error: updateError } = await supabase
        .from("profiles")
        .update({
          avatar_url: urlData.publicUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)
        .select()
        .single();

      if (updateError) {
        console.error("Profile update error:", updateError);
        setError(`Failed to update profile: ${updateError.message}`);
        return null;
      }

      if (data) {
        setProfile({ ...data, is_verified: data.is_verified ?? false });
      }
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error("Error uploading avatar:", err);
      setError(`Failed to upload avatar: ${errorMessage}`);
      return null;
    } finally {
      setSaving(false);
    }
  };

  return {
    profile,
    loading,
    saving,
    error,
    updateProfile,
    uploadAvatar,
    refreshProfile: fetchProfile,
  };
} 