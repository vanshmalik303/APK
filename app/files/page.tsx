'use client';

import React, { useEffect, useState } from 'react';
import Header from '@/components/Header';
import FileList from '@/components/FileList';
import { api } from '@/lib/api';
import { APKRecord } from '@/lib/types';
import { UploadCloud } from 'lucide-react';
import Link from 'next/link';

export default function MyFilesPage() {
  const [files, setFiles] = useState<APKRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await api.getFiles();
        setFiles(data);
      } catch (err) {
        console.error('Failed to load files:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-background text-white">
      <Header
        title="Your APK Library"
        subtitle="Manage your uploaded Android applications and security reports."
        actions={
          <Link
            href="/"
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-black font-bold text-xs shadow-orange-glow-sm transition-all"
          >
            <UploadCloud className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden sm:inline">Upload New APK</span>
          </Link>
        }
      />

      <main className="flex-1 p-6 sm:p-8 max-w-6xl mx-auto w-full">
        {/* Page Title & Context */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Your APK Library
              </h2>
              <p className="text-xs sm:text-sm text-[#A3A3A3] mt-1">
                Manage your uploaded Android applications and security reports.
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="bg-card-bg border border-white/[0.06] rounded-2xl p-6 h-64 animate-pulse"
              >
                <div className="w-12 h-12 rounded-xl bg-white/[0.05] mb-4" />
                <div className="h-4 bg-white/[0.05] rounded w-3/4 mb-2" />
                <div className="h-3 bg-white/[0.05] rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <FileList initialFiles={files} />
        )}
      </main>
    </div>
  );
}
