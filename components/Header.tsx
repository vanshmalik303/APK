'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { ShieldCheck, HardDriveDownload } from 'lucide-react';
import Link from 'next/link';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export default function Header({ title, subtitle, actions }: HeaderProps) {
  const pathname = usePathname();

  const getPageInfo = () => {
    if (pathname === '/') {
      return {
        title: 'APK Security Analysis',
        badge: 'Upload Portal',
      };
    }
    if (pathname === '/files') {
      return {
        title: 'APK Library',
        badge: 'Repository',
      };
    }
    if (pathname === '/profile') {
      return {
        title: 'User Profile & Settings',
        badge: 'Account',
      };
    }
    if (pathname.startsWith('/reports/')) {
      return {
        title: 'Security Audit Report',
        badge: 'Inspection',
      };
    }
    return {
      title: 'APKGuard Platform',
      badge: 'Security',
    };
  };

  const info = getPageInfo();
  const displayTitle = title || info.title;

  return (
    <header className="w-full border-b border-white/[0.06] bg-[#090909]/80 backdrop-blur-md sticky top-0 z-20 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {/* Mobile Logo pill */}
        <div className="md:hidden flex items-center gap-2 mr-1">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center shadow-orange-glow-sm">
            <ShieldCheck className="w-4 h-4 text-black stroke-[2.5]" />
          </div>
          <span className="font-bold text-white text-base">APKGuard</span>
        </div>

        <div className="hidden sm:block">
          <div className="flex items-center gap-2">
            <h1 className="text-base font-semibold text-white tracking-tight">{displayTitle}</h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.05] text-[#A3A3A3] border border-white/[0.08]">
              {info.badge}
            </span>
          </div>
          {subtitle && <p className="text-xs text-[#737373] mt-0.5">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {actions}
        <div className="hidden lg:flex items-center gap-2 text-xs text-[#A3A3A3] bg-card-bg px-3 py-1.5 rounded-lg border border-white/[0.06]">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Static Scanner Core v1.4</span>
        </div>
      </div>
    </header>
  );
}
