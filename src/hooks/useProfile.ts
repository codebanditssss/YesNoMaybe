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
        setProfile(data);
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

      setProfile(data);
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

      setProfile(data);
      return data;
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("Failed to update profile");
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
    refreshProfile: fetchProfile,
  };
} 