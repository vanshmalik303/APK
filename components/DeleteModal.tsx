'use client';

import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { APKRecord } from '@/lib/types';

interface DeleteModalProps {
  file: APKRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting?: boolean;
}

export default function DeleteModal({
  file,
  isOpen,
  onClose,
  onConfirm,
  isDeleting,
}: DeleteModalProps) {
  if (!isOpen || !file) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card-bg border border-white/[0.1] rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-[#737373] hover:text-white hover:bg-white/[0.05] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mb-4">
          <AlertTriangle className="w-6 h-6 stroke-[2]" />
        </div>

        <h3 className="text-lg font-bold text-white">Delete APK File</h3>
        <p className="text-xs text-[#A3A3A3] mt-2 leading-relaxed">
          Are you sure you want to permanently delete{' '}
          <strong className="text-white font-mono">{file.fileName}</strong> and its associated
          static security report? This action cannot be reversed.
        </p>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-[#A3A3A3] hover:text-white bg-white/[0.05] hover:bg-white/[0.1] transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-500 shadow-sm flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{isDeleting ? 'Deleting...' : 'Delete Permanently'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
