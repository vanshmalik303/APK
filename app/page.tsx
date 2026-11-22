'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import UploadArea from '@/components/UploadArea';
import ScanProgress from '@/components/ScanProgress';
import { api } from '@/lib/api';
import {
  UploadCloud,
  Cpu,
  FileCheck2,
  Shield,
  Lock,
  Terminal,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';

export default function UploadPage() {
  const router = useRouter();

  // State management for user upload & scanning journey
  const [activeStep, setActiveStep] = useState<'idle' | 'uploading' | 'scanning' | 'completed'>('idle');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [currentStageIndex, setCurrentStageIndex] = useState<number>(0);
  const [stageLogMessage, setStageLogMessage] = useState<string>('');
  const [scanError, setScanError] = useState<string | null>(null);
  const [generatedReportId, setGeneratedReportId] = useState<string | null>(null);

  const handleFileConfirmed = async (file: File) => {
    setSelectedFile(file);
    setActiveStep('uploading');
    setUploadProgress(0);
    setScanError(null);

    try {
      // Step 3: Uploading state
      const uploadResult = await api.uploadAPK(file, (progress) => {
        setUploadProgress(progress);
      });

      // Step 4: Security analysis screen
      setActiveStep('scanning');
      setCurrentStageIndex(0);

      const report = await api.startScan(
        uploadResult.fileId,
        uploadResult.fileName,
        uploadResult.sizeBytes,
        (stageIndex, log) => {
          setCurrentStageIndex(stageIndex);
          setStageLogMessage(log);
        }
      );

      // Step 5: Completed
      setActiveStep('completed');
      setGeneratedReportId(report.id);

      // Short delay for user satisfaction before navigating
      setTimeout(() => {
        router.push(`/reports/${report.id}`);
      }, 1200);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An error occurred during security analysis.';
      setScanError(message);
    }
  };

  const handleCancelScan = () => {
    setActiveStep('idle');
    setSelectedFile(null);
    setUploadProgress(0);
    setScanError(null);
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-background text-white">
      <Header />

      <main className="flex-1 flex flex-col items-center justify-start px-4 sm:px-6 lg:px-8 py-10 max-w-5xl mx-auto w-full">
        {/* If user is scanning or uploading, show ScanProgress */}
        {activeStep !== 'idle' ? (
          <div className="w-full py-8 animate-in fade-in zoom-in-95 duration-300">
            {activeStep === 'completed' ? (
              <div className="max-w-md mx-auto text-center p-8 bg-card-bg border border-emerald-500/30 rounded-2xl shadow-orange-glow-sm">
                <div className="w-14 h-14 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4 text-emerald-400">
                  <FileCheck2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-white">Static Analysis Completed!</h3>
                <p className="text-xs text-[#A3A3A3] mt-2">
                  Security report generated. Directing you to the comprehensive vulnerability breakdown...
                </p>
                {generatedReportId && (
                  <Link
                    href={`/reports/${generatedReportId}`}
                    className="mt-6 inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-black font-bold text-sm tracking-tight transition-all"
                  >
                    <span>View Security Report</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
            ) : (
              <ScanProgress
                fileName={selectedFile?.name || 'app-release.apk'}
                fileSize={selectedFile?.size || 0}
                uploadProgress={uploadProgress}
                isScanning={activeStep === 'scanning'}
                currentStageIndex={currentStageIndex}
                stageLogMessage={stageLogMessage}
                errorMessage={scanError || undefined}
                onCancel={handleCancelScan}
              />
            )}
          </div>
        ) : (
          /* Normal Landing Page View */
          <div className="w-full space-y-14">
            {/* Section A: Hero section */}
            <section className="text-center space-y-4 pt-4 sm:pt-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/25 text-brand-400 text-[11px] font-mono tracking-wider font-semibold uppercase shadow-orange-glow-sm">
                <Shield className="w-3.5 h-3.5" />
                <span>ANDROID APPLICATION SECURITY</span>
              </div>

              <div className="space-y-1">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white">
                  Secure your app.
                </h1>
                <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#737373]">
                  Before it goes live.
                </h2>
              </div>

              <p className="text-sm sm:text-base text-[#A3A3A3] max-w-2xl mx-auto leading-relaxed">
                Upload your Android application and let APKGuard inspect it for potential security
                vulnerabilities. Discover risks, understand the evidence, and improve your
                application&apos;s security.
              </p>
            </section>

            {/* Section B: APK Upload Area */}
            <section className="w-full">
              <UploadArea onFileConfirmed={handleFileConfirmed} />
            </section>

            {/* Section C: How It Works */}
            <section className="pt-4 border-t border-white/[0.06]">
              <div className="text-center mb-8">
                <h3 className="text-xs uppercase font-mono tracking-wider font-semibold text-[#737373]">
                  Static Analysis Pipeline
                </h3>
                <p className="text-lg font-bold text-white mt-1">How APKGuard Works</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Step 01 */}
                <div className="bg-card-bg border border-white/[0.06] hover:border-brand-500/30 rounded-2xl p-6 transition-all duration-300 group">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[11px] font-mono font-bold text-brand-400 bg-brand-500/10 px-2.5 py-1 rounded-lg border border-brand-500/20">
                      STEP 01
                    </span>
                    <div className="w-9 h-9 rounded-xl bg-white/[0.04] flex items-center justify-center text-[#A3A3A3] group-hover:text-white transition-colors">
                      <UploadCloud className="w-4 h-4" />
                    </div>
                  </div>
                  <h4 className="text-base font-bold text-white tracking-tight">Upload APK</h4>
                  <p className="text-xs text-[#A3A3A3] mt-2 leading-relaxed">
                    Choose an Android application from your device.
                  </p>
                </div>

                {/* Step 02 */}
                <div className="bg-card-bg border border-white/[0.06] hover:border-brand-500/30 rounded-2xl p-6 transition-all duration-300 group">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[11px] font-mono font-bold text-brand-400 bg-brand-500/10 px-2.5 py-1 rounded-lg border border-brand-500/20">
                      STEP 02
                    </span>
                    <div className="w-9 h-9 rounded-xl bg-white/[0.04] flex items-center justify-center text-[#A3A3A3] group-hover:text-white transition-colors">
                      <Cpu className="w-4 h-4" />
                    </div>
                  </div>
                  <h4 className="text-base font-bold text-white tracking-tight">
                    Security Analysis
                  </h4>
                  <p className="text-xs text-[#A3A3A3] mt-2 leading-relaxed">
                    APKGuard inspects permissions, configurations, and application code.
                  </p>
                </div>

                {/* Step 03 */}
                <div className="bg-card-bg border border-white/[0.06] hover:border-brand-500/30 rounded-2xl p-6 transition-all duration-300 group">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[11px] font-mono font-bold text-brand-400 bg-brand-500/10 px-2.5 py-1 rounded-lg border border-brand-500/20">
                      STEP 03
                    </span>
                    <div className="w-9 h-9 rounded-xl bg-white/[0.04] flex items-center justify-center text-[#A3A3A3] group-hover:text-white transition-colors">
                      <FileCheck2 className="w-4 h-4" />
                    </div>
                  </div>
                  <h4 className="text-base font-bold text-white tracking-tight">Get Your Report</h4>
                  <p className="text-xs text-[#A3A3A3] mt-2 leading-relaxed">
                    Understand potential vulnerabilities and recommended fixes.
                  </p>
                </div>
              </div>
            </section>

            {/* Section D: Security Notice */}
            <section className="pb-6">
              <div className="max-w-xl mx-auto p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center gap-3 text-center justify-center text-[11px] text-[#737373]">
                <Lock className="w-4 h-4 text-[#737373] shrink-0" />
                <p>
                  Only upload applications you own or have permission to analyze. Static analysis
                  cannot guarantee detection of every security vulnerability.
                </p>
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
