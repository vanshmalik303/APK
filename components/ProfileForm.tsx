'use client';

import React, { useState } from 'react';
import { UserProfile } from '@/lib/types';
import { api } from '@/lib/api';
import {
  User,
  Mail,
  Shield,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Sliders,
  LogOut,
  Bell,
  Cpu,
  FileText,
  Lock,
} from 'lucide-react';

interface ProfileFormProps {
  initialProfile: UserProfile;
}

export default function ProfileForm({ initialProfile }: ProfileFormProps) {
  const [profile, setProfile] = useState<UserProfile>(initialProfile);
  const [name, setName] = useState(initialProfile.fullName);
  const [email, setEmail] = useState(initialProfile.email);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Change password states
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStatus, setPasswordStatus] = useState<{ error?: string; success?: string } | null>(
    null
  );

  // Logout state
  const [loggedOut, setLoggedOut] = useState(false);

  // Preferences toggles
  const handleToggle = (key: keyof UserProfile) => {
    const updated = { ...profile, [key]: !profile[key] };
    const saved = api.updateUserProfile(updated);
    setProfile(saved);
  };

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(null);
    setSaveSuccess(false);

    if (!name.trim()) {
      setSaveError('Name cannot be empty.');
      return;
    }
    if (!email.includes('@') || !email.includes('.')) {
      setSaveError('Please enter a valid email address.');
      return;
    }

    const updated = api.updateUserProfile({
      fullName: name.trim(),
      email: email.trim(),
    });
    setProfile(updated);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordStatus(null);

    if (!currentPassword) {
      setPasswordStatus({ error: 'Please enter your current password.' });
      return;
    }
    if (newPassword.length < 8) {
      setPasswordStatus({ error: 'New password must be at least 8 characters long.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordStatus({ error: 'New passwords do not match.' });
      return;
    }

    setPasswordStatus({ success: 'Password changed successfully.' });
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => {
      setShowPasswordModal(false);
      setPasswordStatus(null);
    }, 2000);
  };

  const handleLogout = () => {
    setLoggedOut(true);
    setTimeout(() => {
      window.location.href = '/';
    }, 1500);
  };

  if (loggedOut) {
    return (
      <div className="bg-card-bg border border-white/[0.08] rounded-2xl p-12 text-center max-w-md mx-auto">
        <div className="w-12 h-12 rounded-full bg-brand-500/10 flex items-center justify-center mx-auto mb-4 text-brand-500">
          <LogOut className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-white">Logging out...</h3>
        <p className="text-xs text-[#A3A3A3] mt-1">Clearing secure session tokens and resetting local view.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Top Profile Card */}
      <div className="bg-card-bg border border-white/[0.08] rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6 shadow-sm">
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-600 via-brand-500 to-brand-400 flex items-center justify-center text-black font-black text-2xl shadow-orange-glow-sm">
            {profile.fullName
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()}
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-neutral-900 border-2 border-card-bg flex items-center justify-center text-brand-400" title="Verified AppSec Analyst">
            <Shield className="w-3.5 h-3.5" />
          </div>
        </div>

        <div className="flex-1 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <h3 className="text-xl font-bold text-white tracking-tight">{profile.fullName}</h3>
            <span className="text-[10px] font-mono font-semibold uppercase px-2 py-0.5 rounded bg-brand-500/10 text-brand-400 border border-brand-500/20 self-center sm:self-auto">
              {profile.role}
            </span>
          </div>
          <p className="text-xs text-[#A3A3A3] mt-1">{profile.email}</p>
          <p className="text-[11px] text-[#737373] mt-2 font-mono">Member since {profile.joinedDate}</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowPasswordModal(true)}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] transition-all flex items-center gap-1.5"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Change Password</span>
          </button>
        </div>
      </div>

      {/* Profile Edit Form */}
      <div className="bg-card-bg border border-white/[0.08] rounded-2xl p-6 sm:p-8">
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.06] mb-6">
          <div>
            <h4 className="text-base font-bold text-white">Account Details</h4>
            <p className="text-xs text-[#737373]">Update your personal information and credentials</p>
          </div>
          {saveSuccess && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium animate-in fade-in">
              <CheckCircle2 className="w-4 h-4" />
              <span>Saved successfully</span>
            </div>
          )}
        </div>

        {saveError && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{saveError}</span>
          </div>
        )}

        <form onSubmit={handleProfileSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#A3A3A3] mb-1.5">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-[#737373] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-neutral-900 border border-white/[0.08] focus:border-brand-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-[#737373] focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#A3A3A3] mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#737373] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-neutral-900 border border-white/[0.08] focus:border-brand-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-[#737373] focus:outline-none transition-colors"
                />
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-black font-bold text-xs tracking-tight shadow-orange-glow-sm transition-all"
            >
              Save Profile Changes
            </button>
          </div>
        </form>
      </div>

      {/* Account Preferences */}
      <div className="bg-card-bg border border-white/[0.08] rounded-2xl p-6 sm:p-8">
        <div className="pb-4 border-b border-white/[0.06] mb-6">
          <h4 className="text-base font-bold text-white">Security & Engine Preferences</h4>
          <p className="text-xs text-[#737373]">Configure analysis behavioral heuristics and notifications</p>
        </div>

        <div className="space-y-4">
          {/* Preference 1 */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <div className="flex items-start gap-3">
              <Cpu className="w-5 h-5 text-brand-400 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-white">Automated Heuristic Detections</p>
                <p className="text-[11px] text-[#737373] mt-0.5">
                  Flags potential vulnerabilities matching code smell patterns even if not confirmed in manifest
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleToggle('autoScanHeuristics')}
              className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                profile.autoScanHeuristics ? 'bg-brand-500' : 'bg-neutral-800'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  profile.autoScanHeuristics ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Preference 2 */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <div className="flex items-start gap-3">
              <Bell className="w-5 h-5 text-brand-400 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-white">Scan Completion Alerts</p>
                <p className="text-[11px] text-[#737373] mt-0.5">
                  Receive browser notifications when asynchronous analysis routines finish
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleToggle('notificationsEnabled')}
              className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                profile.notificationsEnabled ? 'bg-brand-500' : 'bg-neutral-800'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  profile.notificationsEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Logout Action */}
      <div className="bg-card-bg border border-red-500/20 rounded-2xl p-6 sm:p-8 flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-white">Session Security</h4>
          <p className="text-xs text-[#737373] mt-0.5">Terminate current workspace session and revoke local tokens</p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="px-4 py-2 rounded-xl text-xs font-semibold text-red-400 hover:text-white bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 transition-all flex items-center gap-1.5"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Log out</span>
        </button>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card-bg border border-white/[0.1] rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-brand-400" />
              <span>Change Account Password</span>
            </h3>

            {passwordStatus?.error && (
              <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs">
                {passwordStatus.error}
              </div>
            )}
            {passwordStatus?.success && (
              <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs">
                {passwordStatus.success}
              </div>
            )}

            <form onSubmit={handlePasswordChange} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#A3A3A3] mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-neutral-900 border border-white/[0.08] focus:border-brand-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A3A3A3] mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-neutral-900 border border-white/[0.08] focus:border-brand-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  placeholder="At least 8 characters"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A3A3A3] mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-neutral-900 border border-white/[0.08] focus:border-brand-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  placeholder="Re-enter new password"
                />
              </div>

              <div className="mt-6 flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#A3A3A3] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-400 text-black font-bold text-xs"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
