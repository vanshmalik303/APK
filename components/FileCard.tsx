'use client';

import React from 'react';
import Link from 'next/link';
import { APKRecord } from '@/lib/types';
import {
  FileCode,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Trash2,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

interface FileCardProps {
  file: APKRecord;
  onDeleteClick: (file: APKRecord) => void;
}

export default function FileCard({ file, onDeleteClick }: FileCardProps) {
  // Status label styling
  const getStatusBadge = () => {
    switch (file.status) {
      case 'SAFE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle className="w-3.5 h-3.5" />
            No issues detected
          </span>
        );
      case 'ISSUES_FOUND':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-brand-500/10 text-brand-400 border border-brand-500/20">
            <AlertTriangle className="w-3.5 h-3.5" />
            Issues Found ({file.findingsCount})
          </span>
        );
      case 'PENDING':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-neutral-800 text-[#A3A3A3] border border-white/10">
            <Clock className="w-3.5 h-3.5" />
            Pending
          </span>
        );
    }
  };

  return (
    <div className="bg-card-bg hover:bg-card-bg-hover border border-white/[0.08] hover:border-brand-500/30 rounded-2xl p-5 sm:p-6 transition-all duration-200 flex flex-col justify-between group shadow-sm">
      <div>
        {/* Top bar with icon and status */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-neutral-900 border border-white/[0.08] group-hover:border-brand-500/30 flex items-center justify-center text-brand-500 transition-colors shrink-0">
            <FileCode className="w-6 h-6 stroke-[2]" />
          </div>
          <div>{getStatusBadge()}</div>
        </div>

        {/* File Name & Package */}
        <h4 className="text-base font-bold text-white tracking-tight truncate group-hover:text-brand-400 transition-colors" title={file.fileName}>
          {file.fileName}
        </h4>
        <p className="text-xs text-[#737373] font-mono mt-1 truncate" title={file.packageName}>
          {file.packageName || 'Android Package'}
        </p>

        {/* Metadata Details */}
        <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-white/[0.06] text-xs text-[#A3A3A3]">
          <div>
            <span className="text-[#737373] text-[11px] block">File Size</span>
            <span className="font-mono text-white font-medium">{file.formattedSize}</span>
          </div>
          <div>
            <span className="text-[#737373] text-[11px] block">Uploaded</span>
            <span className="font-mono text-white font-medium">{file.uploadDate}</span>
          </div>
          <div className="col-span-2 flex items-center gap-1.5 text-[11px] text-[#737373] mt-1 font-mono">
            <Calendar className="w-3 h-3" />
            <span>Last Scan: {file.lastScanDate}</span>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between gap-2">
        <button
          onClick={() => onDeleteClick(file)}
          type="button"
          className="p-2 text-[#737373] hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
          title="Delete file"
        >
          <Trash2 className="w-4 h-4" />
        </button>

        <Link
          href={`/reports/${file.reportId}`}
          className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-brand-500 text-white hover:text-black font-semibold text-xs transition-all duration-200 flex items-center gap-1.5 group-hover:border-brand-500/40"
        >
          <span>View Report</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
