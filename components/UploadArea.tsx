'use client';

import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileCode,
  AlertCircle,
  X,
  RefreshCw,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { validateAPKFile, formatFileSize } from '@/lib/file-validation';

interface UploadAreaProps {
  onFileConfirmed: (file: File) => void;
  isProcessing?: boolean;
}

export default function UploadArea({ onFileConfirmed, isProcessing }: UploadAreaProps) {
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Handle Drag events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const processFile = (file: File) => {
    setValidationError(null);
    const result = validateAPKFile(file);

    if (!result.isValid) {
      setValidationError(result.error || 'Invalid file.');
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setSelectedFile(file);
  };

  // Handle Drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  // Handle Native File Picker
  const handleNativeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleRemove = () => {
    setSelectedFile(null);
    setValidationError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleChangeFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleContinue = () => {
    if (selectedFile) {
      onFileConfirmed(selectedFile);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".apk,application/vnd.android.package-archive"
        onChange={handleNativeChange}
        className="hidden"
        disabled={isProcessing}
      />

      {/* Validation Error Banner */}
      {validationError && (
        <div className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
          <div className="flex-1 text-xs">
            <p className="font-semibold text-red-200">Validation Notice</p>
            <p className="text-red-300/90 mt-0.5">{validationError}</p>
          </div>
          <button
            onClick={() => setValidationError(null)}
            className="text-red-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Upload Box (State 1: Dropzone) */}
      {!selectedFile ? (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`relative rounded-2xl border-2 border-dashed p-8 sm:p-12 text-center transition-all duration-300 flex flex-col items-center justify-center cursor-pointer ${
            dragActive
              ? 'border-brand-500 bg-brand-500/10 shadow-orange-glow'
              : 'border-white/[0.12] bg-card-bg hover:border-brand-500/50 hover:bg-white/[0.02]'
          }`}
          onClick={handleChangeFile}
        >
          {/* Subtle icon container */}
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-5 transition-transform duration-300 ${
              dragActive
                ? 'bg-brand-500 text-black scale-110 shadow-orange-glow'
                : 'bg-neutral-900 border border-brand-500/20 text-brand-500 group-hover:scale-105'
            }`}
          >
            <UploadCloud className="w-8 h-8 stroke-[1.8]" />
          </div>

          <h3 className="text-lg font-bold text-white tracking-tight">
            {dragActive ? 'Drop your APK here' : 'Upload your APK'}
          </h3>

          <p className="text-sm text-[#A3A3A3] mt-1.5 max-w-sm">
            Drag and drop your Android application here
          </p>

          <div className="flex items-center gap-3 my-5 w-48">
            <div className="flex-1 h-px bg-white/[0.08]" />
            <span className="text-[11px] font-mono uppercase text-[#737373]">OR</span>
            <div className="flex-1 h-px bg-white/[0.08]" />
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleChangeFile();
            }}
            className="px-5 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-white text-sm font-semibold border border-white/[0.1] hover:border-white/20 transition-all shadow-sm"
          >
            Browse Files
          </button>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-[11px] text-[#737373] font-mono">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
              Supported format: <strong className="text-[#A3A3A3]">APK</strong>
            </span>
            <span>•</span>
            <span>Maximum file size: <strong className="text-[#A3A3A3]">200 MB</strong></span>
          </div>
        </div>
      ) : (
        /* Upload Box (State 2: File Selected Confirmation) */
        <div className="bg-card-bg border border-brand-500/40 rounded-2xl p-6 sm:p-8 shadow-orange-glow-sm relative">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
            <div className="flex items-start sm:items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-brand-500/15 border border-brand-500/30 flex items-center justify-center text-brand-500 shrink-0 shadow-orange-glow-sm">
                <FileCode className="w-7 h-7 stroke-[2]" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-bold text-white truncate max-w-xs sm:max-w-md">
                    {selectedFile.name}
                  </h4>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                    Valid APK
                  </span>
                </div>
                <p className="text-xs text-[#737373] mt-1 font-mono">
                  Size: {formatFileSize(selectedFile.size)} • Type: application/vnd.android.package-archive
                </p>
              </div>
            </div>

            <button
              onClick={handleRemove}
              className="self-end sm:self-center p-2 rounded-lg text-[#737373] hover:text-white hover:bg-white/[0.05] transition-colors"
              title="Remove file"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleChangeFile}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#A3A3A3] hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] transition-all flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Change File
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-red-400/90 hover:text-red-300 bg-red-500/5 hover:bg-red-500/10 border border-red-500/20 transition-all"
              >
                Remove
              </button>
            </div>

            <button
              type="button"
              onClick={handleContinue}
              className="px-6 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-black font-bold text-sm tracking-tight flex items-center justify-center gap-2 shadow-orange-glow transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Continue to Scan</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>

          <div className="mt-4 pt-4 border-t border-white/[0.05] flex items-center gap-2 text-[11px] text-[#737373]">
            <ShieldAlert className="w-3.5 h-3.5 text-brand-400 shrink-0" />
            <span>Frontend verified. Backend will unpack and independently inspect byte headers.</span>
          </div>
        </div>
      )}
    </div>
  );
}
