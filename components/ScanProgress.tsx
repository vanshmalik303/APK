'use client';

import React from 'react';
import {
  FileCode,
  ShieldCheck,
  CheckCircle2,
  Loader2,
  AlertCircle,
  FileArchive,
  Binary,
  Layers,
  Sparkles,
} from 'lucide-react';
import { formatFileSize } from '@/lib/file-validation';

interface ScanProgressProps {
  fileName: string;
  fileSize: number;
  uploadProgress: number; // 0 to 100
  isScanning: boolean;
  currentStageIndex: number; // 0 to 5
  stageLogMessage: string;
  errorMessage?: string;
  onCancel?: () => void;
}

const STAGES = [
  {
    title: 'Extracting APK contents',
    description: 'Unpacking ZIP container, assets, and binary resources',
    icon: FileArchive,
  },
  {
    title: 'Analyzing Android manifest',
    description: 'Parsing components, export flags, and intent filters',
    icon: FileCode,
  },
  {
    title: 'Checking permissions',
    description: 'Evaluating dangerous, privileged, and signature permissions',
    icon: ShieldCheck,
  },
  {
    title: 'Inspecting application code',
    description: 'Disassembling Dalvik bytecode and analyzing abstract syntax trees',
    icon: Binary,
  },
  {
    title: 'Detecting potential vulnerabilities',
    description: 'Matching heuristic security rules, secrets, and weak cryptography',
    icon: Layers,
  },
  {
    title: 'Generating security report',
    description: 'Calculating CVSS risk scores and compiling actionable remediations',
    icon: Sparkles,
  },
];

export default function ScanProgress({
  fileName,
  fileSize,
  uploadProgress,
  isScanning,
  currentStageIndex,
  stageLogMessage,
  errorMessage,
  onCancel,
}: ScanProgressProps) {
  const isUploading = uploadProgress < 100 && !isScanning;

  return (
    <div className="w-full max-w-2xl mx-auto bg-card-bg border border-white/[0.08] rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-brand-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header File Info */}
      <div className="flex items-center justify-between pb-6 border-b border-white/[0.06] mb-6">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-neutral-900 border border-brand-500/30 flex items-center justify-center text-brand-500 shadow-orange-glow-sm">
            <Binary className="w-6 h-6 stroke-[2]" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white truncate max-w-xs sm:max-w-md">
              {fileName}
            </h3>
            <p className="text-xs text-[#737373] mt-0.5 font-mono">
              {formatFileSize(fileSize)} • Android Application Package
            </p>
          </div>
        </div>

        {onCancel && !errorMessage && (
          <button
            onClick={onCancel}
            type="button"
            className="text-xs text-[#737373] hover:text-white px-3 py-1.5 rounded-lg border border-white/[0.08] hover:border-white/20 transition-all"
          >
            Cancel
          </button>
        )}
      </div>

      {/* Error state */}
      {errorMessage ? (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3 text-red-300">
          <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-red-200">Analysis Halted</p>
            <p className="text-xs text-red-300/80 mt-1">{errorMessage}</p>
          </div>
        </div>
      ) : isUploading ? (
        /* Uploading State */
        <div className="space-y-6">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-white flex items-center gap-2">
              <Loader2 className="w-4 h-4 text-brand-500 animate-spin" />
              Uploading APK to security sandbox...
            </span>
            <span className="font-mono text-brand-400 font-semibold">{uploadProgress}%</span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2.5 bg-neutral-900 rounded-full overflow-hidden border border-white/[0.06]">
            <div
              className="h-full bg-gradient-to-r from-brand-600 via-brand-500 to-brand-400 rounded-full transition-all duration-300 shadow-orange-glow-sm"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-[#737373]">
            <span>Secure TLS 1.3 Transmission</span>
            <span>Verifying checksum...</span>
          </div>
        </div>
      ) : (
        /* Scanning Stages State (6 Stages) */
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase font-mono font-semibold tracking-wider text-brand-400">
                Static Analysis in Progress
              </p>
              <h4 className="text-lg font-bold text-white mt-0.5">
                Stage {currentStageIndex + 1} of 6: {STAGES[currentStageIndex]?.title}
              </h4>
            </div>
            <div className="w-10 h-10 rounded-full bg-brand-500/10 border border-brand-500/20 flex items-center justify-center">
              <Loader2 className="w-5 h-5 text-brand-500 animate-spin" />
            </div>
          </div>

          {/* 6 Stage Checklist */}
          <div className="space-y-2.5">
            {STAGES.map((stage, idx) => {
              const StageIcon = stage.icon;
              const isPast = idx < currentStageIndex;
              const isCurrent = idx === currentStageIndex;

              return (
                <div
                  key={stage.title}
                  className={`flex items-start gap-3.5 p-3 rounded-xl border transition-all duration-300 ${
                    isCurrent
                      ? 'bg-brand-500/10 border-brand-500/30 text-white shadow-orange-glow-sm'
                      : isPast
                      ? 'bg-white/[0.02] border-white/[0.06] text-[#A3A3A3]'
                      : 'bg-transparent border-transparent text-[#737373] opacity-60'
                  }`}
                >
                  <div className="mt-0.5">
                    {isPast ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : isCurrent ? (
                      <Loader2 className="w-4 h-4 text-brand-500 animate-spin" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-[#737373]/40 flex items-center justify-center text-[10px] font-mono">
                        {idx + 1}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p
                        className={`text-xs font-semibold ${
                          isCurrent ? 'text-white' : isPast ? 'text-[#E5E5E5]' : 'text-[#737373]'
                        }`}
                      >
                        {stage.title}
                      </p>
                      {isCurrent && (
                        <span className="text-[10px] font-mono text-brand-400 uppercase tracking-wider animate-pulse">
                          Running
                        </span>
                      )}
                      {isPast && (
                        <span className="text-[10px] font-mono text-emerald-400 uppercase">
                          Complete
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#737373] mt-0.5 truncate">
                      {stage.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Real-time Stage Log Console */}
          <div className="p-3.5 rounded-xl bg-black/60 border border-white/[0.06] font-mono text-xs text-[#A3A3A3] flex items-center gap-2.5">
            <span className="text-brand-500">$</span>
            <span className="truncate">{stageLogMessage || 'Initializing analysis subroutines...'}</span>
          </div>
        </div>
      )}
    </div>
  );
}
