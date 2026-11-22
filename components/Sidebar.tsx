'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UploadCloud, Folder, User, ShieldCheck } from 'lucide-react';
import { api } from '@/lib/api';

export default function Sidebar() {
  const pathname = usePathname();
  const [userProfile, setUserProfile] = React.useState({
    fullName: 'Alex Vance',
    email: 'alex.vance@securitylab.dev',
    role: 'AppSec Engineer',
  });

  React.useEffect(() => {
    const profile = api.getUserProfile();
    if (profile) {
      setUserProfile({
        fullName: profile.fullName,
        email: profile.email,
        role: profile.role,
      });
    }
  }, [pathname]);

  const navItems = [
    {
      name: 'Upload APK',
      href: '/',
      icon: UploadCloud,
      isActive: pathname === '/',
      highlight: true,
      badge: 'Main',
    },
    {
      name: 'My Files',
      href: '/files',
      icon: Folder,
      isActive: pathname === '/files' || pathname.startsWith('/reports/'),
    },
    {
      name: 'Profile',
      href: '/profile',
      icon: User,
      isActive: pathname === '/profile',
    },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen sticky top-0 bg-sidebar-bg border-r border-white/[0.08] p-5 select-none z-30">
      {/* Brand Header */}
      <Link href="/" className="flex items-center gap-3 px-2 py-1.5 mb-8 group">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center shadow-orange-glow-sm group-hover:shadow-orange-glow transition-all duration-300">
          <ShieldCheck className="w-5 h-5 text-black stroke-[2.5]" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-lg tracking-tight text-white">APKGuard</span>
            <span className="text-[10px] uppercase font-mono font-semibold px-1.5 py-0.5 rounded bg-brand-500/15 text-brand-400 border border-brand-500/20">
              v1.0
            </span>
          </div>
          <p className="text-[11px] text-[#737373] tracking-wide">Static Security Engine</p>
        </div>
      </Link>

      {/* Main Navigation (EXACTLY 3 OPTIONS) */}
      <div className="flex-1 space-y-1.5">
        <div className="px-2 mb-2 text-[11px] font-semibold tracking-wider text-[#737373] uppercase font-mono">
          Platform Menu
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = item.isActive;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative ${
                active
                  ? 'bg-gradient-to-r from-brand-500/15 to-brand-500/5 text-white border border-brand-500/30 shadow-orange-glow-sm'
                  : 'text-[#A3A3A3] hover:text-white hover:bg-white/[0.04] border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-1.5 rounded-lg transition-colors ${
                    active
                      ? 'text-brand-500 bg-brand-500/15'
                      : 'text-[#737373] group-hover:text-white group-hover:bg-white/[0.05]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span>{item.name}</span>
              </div>
              {item.badge && !active && (
                <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-white/[0.06] text-[#A3A3A3]">
                  {item.badge}
                </span>
              )}
              {active && (
                <div className="w-1.5 h-1.5 rounded-full bg-brand-500 shadow-orange-glow" />
              )}
            </Link>
          );
        })}
      </div>

      {/* System Status Pill */}
      <div className="p-3 mb-4 rounded-xl bg-card-bg border border-white/[0.06] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-xs text-[#A3A3A3] font-medium">Engine Active</span>
        </div>
        <span className="text-[11px] font-mono text-[#737373]">FastAPI ready</span>
      </div>

      {/* User Information Section */}
      <Link
        href="/profile"
        className="pt-3 border-t border-white/[0.08] flex items-center gap-3 px-1 py-1.5 rounded-xl hover:bg-white/[0.03] transition-colors group"
      >
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-neutral-800 to-neutral-900 border border-white/10 flex items-center justify-center font-bold text-xs text-brand-400 group-hover:border-brand-500/50 transition-colors">
          {userProfile.fullName
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase() || 'AV'}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-white truncate group-hover:text-brand-400 transition-colors">
            {userProfile.fullName}
          </p>
          <p className="text-[11px] text-[#737373] truncate">{userProfile.email}</p>
        </div>
      </Link>
    </aside>
  );
}
