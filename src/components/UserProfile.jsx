import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Calendar, 
  Shield, 
  Camera, 
  Save, 
  Edit3,
  ArrowLeft,
  CheckCircle,
  Activity
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const UserProfile = ({ onBack }) => {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    bio: user?.bio || '',
    location: user?.location || '',
    website: user?.website || ''
  });

  const handleSave = () => {
    updateProfile(formData);
    setIsEditing(false);
    alert('Profile updated successfully!');
  };

  const handleCancel = () => {
    setFormData({
      username: user?.username || '',
      email: user?.email || '',
      bio: user?.bio || '',
      location: user?.location || '',
      website: user?.website || ''
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back to Dashboard</span>
        </button>
        <h1 className="text-2xl font-bold text-white">Profile Settings</h1>
        <div></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-gray-900/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-700/50 space-y-6">
            {/* Avatar Section */}
            <div className="text-center">
              <div className="relative inline-block">
                <div className="w-32 h-32 rounded-full bg-gradient-to-r from-white to-gray-300 flex items-center justify-center text-black text-3xl font-bold">
                  {user?.username?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <button className="absolute bottom-2 right-2 w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center text-white hover:bg-gray-600 transition-colors">
                  <Camera size={16} />
                </button>
              </div>
              <h3 className="text-xl font-bold text-white mt-4">{user?.username || 'Username'}</h3>
              <p className="text-gray-400">{user?.email || 'email@example.com'}</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-gray-700/30 rounded-lg">
                <div className="text-2xl font-bold text-white">24</div>
                <div className="text-gray-400 text-sm">Projects</div>
              </div>
              <div className="text-center p-4 bg-gray-700/30 rounded-lg">
                <div className="text-2xl font-bold text-white">187</div>
                <div className="text-gray-400 text-sm">Tasks Done</div>
              </div>
            </div>

            {/* Account Info */}
            <div className="space-y-3 pt-4 border-t border-gray-700/50">
              <div className="flex items-center gap-3 text-gray-400">
                <Calendar size={16} />
                <span className="text-sm">
                  Joined {user?.joinedDate ? new Date(user.joinedDate).toLocaleDateString() : 'Unknown'}
                </span>
              </div>
              <div className="flex items-center gap-3 text-gray-400">
                <Activity size={16} />
                <span className="text-sm">
                  Last active {user?.lastActive ? new Date(user.lastActive).toLocaleDateString() : 'Unknown'}
                </span>
              </div>
              <div className="flex items-center gap-3 text-white">
                <CheckCircle size={16} />
                <span className="text-sm">Verified Account</span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <div className="lg:col-span-2">
          <div className="bg-gray-900/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-700/50">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Personal Information</h3>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
                >
                  <Edit3 size={16} />
                  Edit
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 bg-gray-600/50 text-gray-300 rounded-lg hover:bg-gray-600/70 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-2 px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
                  >
                    <Save size={16} />
                    Save
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Username */}
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Username</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      disabled={!isEditing}
                      className="w-full bg-gray-700/50 text-white pl-10 pr-4 py-3 rounded-lg border border-gray-600 focus:border-white focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      disabled={!isEditing}
                      className="w-full bg-gray-700/50 text-white pl-10 pr-4 py-3 rounded-lg border border-gray-600 focus:border-white focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Location */}
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Location</label>
                  <input
                    type="text"
                    placeholder="City, Country"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    disabled={!isEditing}
                    className="w-full bg-gray-700/50 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-white focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                </div>

                {/* Website */}
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Website</label>
                  <input
                    type="url"
                    placeholder="https://your-website.com"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    disabled={!isEditing}
                    className="w-full bg-gray-700/50 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-white focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-gray-400 text-sm mb-2">Bio</label>
                <textarea
                  placeholder="Tell us about yourself..."
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  disabled={!isEditing}
                  rows={4}
                  className="w-full bg-gray-700/50 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-white focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed resize-none"
                />
              </div>
            </div>
          </div>

          {/* Security Section */}
          <div className="bg-gray-900/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-700/50 mt-6">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="text-white" size={24} />
              <h3 className="text-xl font-bold text-white">Security Settings</h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
                <div>
                  <div className="text-white font-medium">Two-Factor Authentication</div>
                  <div className="text-gray-400 text-sm">Add an extra layer of security</div>
                </div>
                <button className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors">
                  Enable
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
                <div>
                  <div className="text-white font-medium">Change Password</div>
                  <div className="text-gray-400 text-sm">Update your account password</div>
                </div>
                <button className="px-4 py-2 bg-gray-600/50 text-gray-300 rounded-lg hover:bg-gray-600/70 transition-colors">
                  Change
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
                <div>
                  <div className="text-white font-medium">Login Sessions</div>
                  <div className="text-gray-400 text-sm">Manage your active sessions</div>
                </div>
                <button className="px-4 py-2 bg-gray-600/50 text-gray-300 rounded-lg hover:bg-gray-600/70 transition-colors">
                  View
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;