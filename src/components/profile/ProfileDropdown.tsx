"use client";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useState, useRef, useEffect } from "react";

interface ProfileDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  avatarRef: React.RefObject<HTMLDivElement | null>;
}

export function ProfileDropdown({ isOpen, onClose, avatarRef }: ProfileDropdownProps) {
  const { user, signOut } = useAuth();
  const { profile, loading, saving, error, updateProfile } = useProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    username: "",
    bio: "",
    location: "",
    website: "",
  });
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load profile data into form when profile is available
  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || "",
        username: profile.username || "",
        bio: profile.bio || "",
        location: profile.location || "",
        website: profile.website || "",
      });
    }
  }, [profile]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        avatarRef.current &&
        !avatarRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose, avatarRef]);

  const handleSave = async () => {
    const result = await updateProfile({
      full_name: formData.full_name || null,
      username: formData.username || null,
      bio: formData.bio || null,
      location: formData.location || null,
      website: formData.website || null,
    });

    if (result) {
      setIsEditing(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    onClose();
  };

  if (!isOpen || !user) return null;

  if (loading) {
    return (
      <div className="profile-dropdown" ref={dropdownRef}>
        <div className="profile-dropdown-content" style={{ textAlign: "center", padding: "40px 20px" }}>
          <div>Loading profile...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-dropdown" ref={dropdownRef}>
      <div className="profile-dropdown-header">
        <div className="profile-avatar-large">
          {user.email?.charAt(0).toUpperCase()}
        </div>
        <div className="profile-info">
          <h3>{profile?.full_name || "Add your name"}</h3>
          <p>{user.email}</p>
        </div>
      </div>

      <div className="profile-dropdown-content">
        {isEditing ? (
          <div className="profile-form">
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="Enter your full name"
              />
            </div>
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="@username"
              />
            </div>
            <div className="form-group">
              <label>Bio</label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Tell us about yourself"
                rows={3}
              />
            </div>
            <div className="form-group">
              <label>Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Where are you based?"
              />
            </div>
            <div className="form-group">
              <label>Website</label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://yourwebsite.com"
              />
            </div>
            <div className="profile-form-actions">
              <button className="btn-secondary" onClick={() => setIsEditing(false)}>
                Cancel
              </button>
              <button className="btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        ) : (
          <div className="profile-details">
            <div className="detail-row">
              <strong>Full Name:</strong>
              <span>{profile?.full_name || "Not set"}</span>
            </div>
            <div className="detail-row">
              <strong>Username:</strong>
              <span>{profile?.username || "Not set"}</span>
            </div>
            <div className="detail-row">
              <strong>Bio:</strong>
              <span>{profile?.bio || "No bio yet"}</span>
            </div>
            <div className="detail-row">
              <strong>Location:</strong>
              <span>{profile?.location || "Not set"}</span>
            </div>
            <div className="detail-row">
              <strong>Website:</strong>
              <span>{profile?.website || "Not set"}</span>
            </div>
          </div>
        )}
      </div>

      <div className="profile-dropdown-actions">
        {!isEditing && (
          <button className="btn-secondary" onClick={() => setIsEditing(true)} disabled={loading}>
            Edit Profile
          </button>
        )}
        <button className="btn-danger" onClick={handleSignOut}>
          Sign Out
        </button>
      </div>

      {error && (
        <div className="error-message" style={{ padding: "10px 20px", color: "#dc2626", fontSize: "14px" }}>
          {error}
        </div>
      )}
    </div>
  );
} 