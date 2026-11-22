'use client';

import React, { useEffect, useState } from 'react';
import Header from '@/components/Header';
import ProfileForm from '@/components/ProfileForm';
import { api } from '@/lib/api';
import { UserProfile } from '@/lib/types';
import { INITIAL_USER_PROFILE } from '@/lib/mock-data';

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile>(INITIAL_USER_PROFILE);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const data = api.getUserProfile();
    setProfile(data);
    setLoaded(true);
  }, []);

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-background text-white">
      <Header title="Your Profile" subtitle="Account credentials, security tokens, and engine configurations." />

      <main className="flex-1 p-6 sm:p-8 max-w-5xl mx-auto w-full">
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Your Profile</h2>
          <p className="text-xs sm:text-sm text-[#A3A3A3] mt-1">
            Manage your account details and security analysis preferences.
          </p>
        </div>

        {loaded ? (
          <ProfileForm initialProfile={profile} />
        ) : (
          <div className="space-y-6">
            <div className="h-32 bg-card-bg border border-white/[0.06] rounded-2xl animate-pulse" />
            <div className="h-64 bg-card-bg border border-white/[0.06] rounded-2xl animate-pulse" />
          </div>
        )}
      </main>
    </div>
  );
}
