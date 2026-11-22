'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UploadCloud, Folder, User } from 'lucide-react';

export default function MobileNavigation() {
  const pathname = usePathname();

  const navItems = [
    {
      name: 'Upload APK',
      href: '/',
      icon: UploadCloud,
      isActive: pathname === '/',
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
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0D0D0D]/95 backdrop-blur-lg border-t border-white/[0.08] px-4 py-2">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = item.isActive;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center py-1.5 px-4 rounded-xl transition-all ${
                active ? 'text-brand-500 font-semibold' : 'text-[#A3A3A3] hover:text-white'
              }`}
            >
              <div
                className={`p-1 rounded-lg ${
                  active ? 'bg-brand-500/15 text-brand-500 shadow-orange-glow-sm' : ''
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[11px] mt-1 tracking-tight">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
