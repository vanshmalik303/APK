'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { APKRecord } from '@/lib/types';
import FileCard from './FileCard';
import DeleteModal from './DeleteModal';
import { Search, FolderPlus, UploadCloud, SlidersHorizontal } from 'lucide-react';
import { api } from '@/lib/api';

interface FileListProps {
  initialFiles: APKRecord[];
}

export default function FileList({ initialFiles }: FileListProps) {
  const [files, setFiles] = useState<APKRecord[]>(initialFiles);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ISSUES_FOUND' | 'SAFE'>('ALL');
  const [fileToDelete, setFileToDelete] = useState<APKRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Filter logic
  const filteredFiles = files.filter((file) => {
    const matchesSearch = file.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      file.packageName.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (statusFilter === 'ALL') return true;
    return file.status === statusFilter;
  });

  const handleDelete = async () => {
    if (!fileToDelete) return;
    setIsDeleting(true);
    try {
      await api.deleteFile(fileToDelete.id);
      setFiles((prev) => prev.filter((f) => f.id !== fileToDelete.id));
      setFileToDelete(null);
    } catch (err) {
      console.error('Failed to delete file', err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-card-bg border border-white/[0.08] p-4 rounded-2xl">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#737373] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search your APK files..."
            className="w-full bg-neutral-900/80 border border-white/[0.08] focus:border-brand-500 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-[#737373] focus:outline-none transition-colors"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-neutral-900 rounded-xl border border-white/[0.06]">
          <button
            type="button"
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              statusFilter === 'ALL'
                ? 'bg-brand-500 text-black font-bold shadow-sm'
                : 'text-[#A3A3A3] hover:text-white'
            }`}
          >
            All ({files.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('ISSUES_FOUND')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              statusFilter === 'ISSUES_FOUND'
                ? 'bg-brand-500 text-black font-bold shadow-sm'
                : 'text-[#A3A3A3] hover:text-white'
            }`}
          >
            Issues Found
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('SAFE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              statusFilter === 'SAFE'
                ? 'bg-brand-500 text-black font-bold shadow-sm'
                : 'text-[#A3A3A3] hover:text-white'
            }`}
          >
            No Issues
          </button>
        </div>
      </div>

      {/* File List Content */}
      {filteredFiles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredFiles.map((file) => (
            <FileCard
              key={file.id}
              file={file}
              onDeleteClick={(selected) => setFileToDelete(selected)}
            />
          ))}
        </div>
      ) : files.length === 0 ? (
        /* Empty State */
        <div className="text-center py-20 px-4 bg-card-bg border border-white/[0.06] rounded-2xl max-w-xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-neutral-900 border border-white/[0.08] flex items-center justify-center mx-auto mb-4 text-[#737373]">
            <FolderPlus className="w-8 h-8 stroke-[1.5]" />
          </div>
          <h3 className="text-lg font-bold text-white">No APK files yet.</h3>
          <p className="text-xs text-[#A3A3A3] mt-1.5 max-w-sm mx-auto leading-relaxed">
            Upload your first Android application to start analyzing its security.
          </p>
          <div className="mt-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-black font-bold text-xs shadow-orange-glow transition-all"
            >
              <UploadCloud className="w-4 h-4 stroke-[2.5]" />
              <span>Upload your first APK</span>
            </Link>
          </div>
        </div>
      ) : (
        /* No Search Matches */
        <div className="text-center py-16 px-4 bg-card-bg border border-white/[0.06] rounded-2xl">
          <p className="text-sm font-semibold text-white">No matching APK files found</p>
          <p className="text-xs text-[#737373] mt-1">
            Try searching with a different filename or clear the active search filter.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setStatusFilter('ALL');
            }}
            className="mt-4 text-xs text-brand-400 hover:text-brand-300 underline font-medium"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteModal
        file={fileToDelete}
        isOpen={!!fileToDelete}
        onClose={() => setFileToDelete(null)}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}
