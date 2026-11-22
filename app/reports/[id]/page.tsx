'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import RiskSummary from '@/components/RiskSummary';
import VulnerabilityCard from '@/components/VulnerabilityCard';
import { api } from '@/lib/api';
import { SecurityReport, SeverityLevel } from '@/lib/types';
import {
  FileCode,
  Download,
  FileJson,
  ArrowLeft,
  ShieldCheck,
  ShieldAlert,
  Calendar,
  Layers,
  Key,
  Search,
  Filter,
  CheckCircle2,
  Printer,
} from 'lucide-react';
import Link from 'next/link';

export default function SecurityReportPage() {
  const params = useParams();
  const router = useRouter();
  const reportId = params?.id as string;

  const [report, setReport] = useState<SecurityReport | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeSeverityFilter, setActiveSeverityFilter] = useState<'ALL' | SeverityLevel>('ALL');
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'FINDINGS' | 'PERMISSIONS'>('FINDINGS');

  useEffect(() => {
    async function fetchReport() {
      if (!reportId) return;
      try {
        const data = await api.getReport(reportId);
        setReport(data);
      } catch (err) {
        console.error('Failed to load report:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchReport();
  }, [reportId]);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col min-h-screen bg-background text-white">
        <Header />
        <main className="flex-1 p-8 max-w-6xl mx-auto w-full space-y-6">
          <div className="h-28 bg-card-bg border border-white/[0.06] rounded-2xl animate-pulse" />
          <div className="h-64 bg-card-bg border border-white/[0.06] rounded-2xl animate-pulse" />
          <div className="h-96 bg-card-bg border border-white/[0.06] rounded-2xl animate-pulse" />
        </main>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="flex-1 flex flex-col min-h-screen bg-background text-white">
        <Header />
        <main className="flex-1 p-8 max-w-xl mx-auto w-full text-center py-24">
          <div className="w-16 h-16 rounded-2xl bg-card-bg border border-white/[0.08] flex items-center justify-center mx-auto mb-4 text-[#737373]">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white">Security Report Not Found</h2>
          <p className="text-xs text-[#A3A3A3] mt-2">
            The requested audit record may have been removed or does not exist.
          </p>
          <Link
            href="/files"
            className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-black font-bold text-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to APK Library</span>
          </Link>
        </main>
      </div>
    );
  }

  // Filter findings
  const filteredFindings = report.findings.filter((f) => {
    if (activeSeverityFilter !== 'ALL' && f.severity !== activeSeverityFilter) {
      return false;
    }
    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase();
      return (
        f.title.toLowerCase().includes(q) ||
        f.affectedComponent.toLowerCase().includes(q) ||
        f.shortExplanation.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handlePrintPDF = () => {
    window.print();
  };

  const handleExportJSON = () => {
    api.exportReportJSON(report);
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-background text-white">
      <Header
        title={`Audit: ${report.fileName}`}
        subtitle={`Package: ${report.packageName}`}
        actions={
          <div className="flex items-center gap-2 no-print">
            <button
              onClick={handlePrintPDF}
              type="button"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-xs font-semibold text-white border border-white/[0.08] transition-all"
              title="Download or Print PDF Report"
            >
              <Printer className="w-3.5 h-3.5 text-brand-400" />
              <span>Download PDF</span>
            </button>

            <button
              onClick={handleExportJSON}
              type="button"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-xs font-semibold text-white border border-white/[0.08] transition-all"
              title="Export Report JSON"
            >
              <FileJson className="w-3.5 h-3.5 text-brand-400" />
              <span>Export JSON</span>
            </button>
          </div>
        }
      />

      <main className="flex-1 p-6 sm:p-8 max-w-6xl mx-auto w-full space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between no-print">
          <Link
            href="/files"
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#A3A3A3] hover:text-white transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to My Files</span>
          </Link>

          <span className="text-[11px] font-mono text-[#737373]">
            SHA-256: {report.sha256.substring(0, 16)}...
          </span>
        </div>

        {/* Section A: Overview Banner */}
        <div className="bg-card-bg border border-white/[0.08] rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-start sm:items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-brand-500/15 border border-brand-500/30 flex items-center justify-center text-brand-500 shrink-0 shadow-orange-glow-sm">
                <FileCode className="w-8 h-8 stroke-[2]" />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight truncate">
                    {report.fileName}
                  </h2>
                  <span
                    className={`text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full border ${
                      report.status === 'SAFE'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-brand-500/10 text-brand-400 border-brand-500/20'
                    }`}
                  >
                    {report.status === 'SAFE' ? 'No issues detected' : 'Issues Found'}
                  </span>
                </div>
                <p className="text-xs text-[#737373] font-mono mt-1">
                  Package: <span className="text-[#A3A3A3]">{report.packageName}</span> • Target SDK: {report.targetSdkVersion} • Min SDK: {report.minSdkVersion}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-[#A3A3A3] pt-4 lg:pt-0 border-t lg:border-t-0 border-white/[0.06]">
              <div>
                <span className="text-[#737373] text-[10px] block uppercase">Scan Date</span>
                <span className="text-white font-medium">{report.scanDate}</span>
              </div>
              <div className="h-6 w-px bg-white/[0.08] hidden sm:block" />
              <div>
                <span className="text-[#737373] text-[10px] block uppercase">File Size</span>
                <span className="text-white font-medium">{report.formattedSize}</span>
              </div>
              <div className="h-6 w-px bg-white/[0.08] hidden sm:block" />
              <div>
                <span className="text-[#737373] text-[10px] block uppercase">Risk Rating</span>
                <span className="text-brand-400 font-bold">{report.riskScore.level} RISK</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section B & C: Risk Score & Vulnerability Summary */}
        <RiskSummary
          riskScore={report.riskScore}
          totalFindings={report.summary.totalFindings}
          confirmedFindings={report.summary.confirmedFindings}
          heuristicDetections={report.summary.heuristicDetections}
        />

        {/* Section D & E: Vulnerability Details & Tabs */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
            {/* View Tabs */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('FINDINGS')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  activeTab === 'FINDINGS'
                    ? 'bg-brand-500 text-black shadow-orange-glow-sm'
                    : 'bg-card-bg text-[#A3A3A3] hover:text-white border border-white/[0.06]'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Detected Findings ({report.findings.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('PERMISSIONS')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  activeTab === 'PERMISSIONS'
                    ? 'bg-brand-500 text-black shadow-orange-glow-sm'
                    : 'bg-card-bg text-[#A3A3A3] hover:text-white border border-white/[0.06]'
                }`}
              >
                <Key className="w-3.5 h-3.5" />
                <span>Manifest Permissions ({report.permissions.length})</span>
              </button>
            </div>

            {/* Quick Search inside findings */}
            {activeTab === 'FINDINGS' && (
              <div className="relative w-full sm:w-64 no-print">
                <Search className="w-3.5 h-3.5 text-[#737373] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder="Filter findings..."
                  className="w-full bg-card-bg border border-white/[0.08] focus:border-brand-500 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-[#737373] focus:outline-none"
                />
              </div>
            )}
          </div>

          {/* Tab 1: Findings */}
          {activeTab === 'FINDINGS' && (
            <div className="space-y-5">
              {/* Severity Filter Pills */}
              <div className="flex flex-wrap items-center gap-1.5 no-print">
                <span className="text-[11px] font-mono uppercase text-[#737373] mr-2">Severity:</span>
                {(['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFORMATIONAL'] as const).map(
                  (sev) => {
                    const isSelected = activeSeverityFilter === sev;
                    return (
                      <button
                        key={sev}
                        type="button"
                        onClick={() => setActiveSeverityFilter(sev)}
                        className={`px-3 py-1 rounded-lg text-xs font-medium font-mono transition-all ${
                          isSelected
                            ? 'bg-white text-black font-bold'
                            : 'bg-card-bg text-[#737373] hover:text-white border border-white/[0.06]'
                        }`}
                      >
                        {sev}
                      </button>
                    );
                  }
                )}
              </div>

              {/* Finding Cards */}
              {filteredFindings.length > 0 ? (
                <div className="space-y-4">
                  {filteredFindings.map((finding) => (
                    <VulnerabilityCard key={finding.id} finding={finding} />
                  ))}
                </div>
              ) : (
                <div className="bg-card-bg border border-white/[0.06] rounded-2xl p-12 text-center">
                  <p className="text-sm font-semibold text-white">No findings matched your criteria</p>
                  <p className="text-xs text-[#737373] mt-1">
                    Try clearing the severity filter or search phrase to view all detected findings.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Permissions */}
          {activeTab === 'PERMISSIONS' && (
            <div className="bg-card-bg border border-white/[0.08] rounded-2xl p-6 space-y-4">
              <div>
                <h4 className="text-base font-bold text-white">Declared Android Permissions</h4>
                <p className="text-xs text-[#737373] mt-0.5">
                  Extracted from <code className="font-mono text-brand-400">AndroidManifest.xml</code> via static manifest decoder.
                </p>
              </div>

              <div className="space-y-2.5 pt-2">
                {report.permissions.map((perm) => (
                  <div
                    key={perm.name}
                    className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <code className="text-xs font-mono text-white font-semibold">{perm.name}</code>
                        {perm.isDangerous ? (
                          <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20">
                            Dangerous
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.05] text-[#A3A3A3]">
                            Normal
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#737373] mt-1">{perm.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
