'use client';

import React from 'react';
import { RiskScore } from '@/lib/types';
import { ShieldAlert, ShieldCheck, AlertCircle, Info, HelpCircle } from 'lucide-react';

interface RiskSummaryProps {
  riskScore: RiskScore;
  totalFindings: number;
  confirmedFindings: number;
  heuristicDetections: number;
}

export default function RiskSummary({
  riskScore,
  totalFindings,
  confirmedFindings,
  heuristicDetections,
}: RiskSummaryProps) {
  // Score color determinations (0 is safest, 100 is most critical risk)
  const getScoreColor = () => {
    if (riskScore.score >= 70) return { text: 'text-red-500', bg: 'bg-red-500', border: 'border-red-500/30' };
    if (riskScore.score >= 40) return { text: 'text-brand-500', bg: 'bg-brand-500', border: 'border-brand-500/30' };
    if (riskScore.score >= 20) return { text: 'text-amber-400', bg: 'bg-amber-400', border: 'border-amber-400/30' };
    return { text: 'text-emerald-400', bg: 'bg-emerald-400', border: 'border-emerald-400/30' };
  };

  const colors = getScoreColor();
  const circumference = 2 * Math.PI * 42;
  const strokeDashoffset = circumference - (riskScore.score / 100) * circumference;

  return (
    <div className="bg-card-bg border border-white/[0.08] rounded-2xl p-6 sm:p-8 space-y-6">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
        {/* Left: Visual Risk Score Dial */}
        <div className="flex items-center gap-6">
          <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
            {/* SVG circular meter */}
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="56"
                cy="56"
                r="42"
                stroke="currentColor"
                strokeWidth="8"
                className="text-neutral-800"
                fill="transparent"
              />
              <circle
                cx="56"
                cy="56"
                r="42"
                stroke="currentColor"
                strokeWidth="8"
                className={`${colors.text} transition-all duration-1000 ease-out`}
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </svg>

            {/* Score in middle */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className={`text-2xl font-black ${colors.text}`}>{riskScore.score}</span>
              <span className="text-[10px] font-mono text-[#737373] uppercase tracking-wider">/ 100</span>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-wider text-[#737373]">Risk Index</span>
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded font-mono uppercase border ${colors.border} ${colors.text} bg-white/[0.03]`}
              >
                {riskScore.level} RISK
              </span>
            </div>
            <h3 className="text-lg font-bold text-white mt-1">Static Exposure Evaluation</h3>
            <p className="text-xs text-[#A3A3A3] mt-1 max-w-sm">
              Cumulative vulnerability assessment derived from reverse-engineered bytecode analysis.
            </p>
          </div>
        </div>

        {/* Right: Severity Breakdown Counts */}
        <div className="w-full lg:w-auto grid grid-cols-2 sm:grid-cols-5 gap-3">
          {/* Critical */}
          <div className="bg-neutral-900/80 border border-red-500/30 rounded-xl p-3 text-center">
            <span className="text-xl font-black text-red-500 block">{riskScore.breakdown.critical}</span>
            <span className="text-[10px] uppercase font-mono font-semibold text-red-400">Critical</span>
          </div>

          {/* High */}
          <div className="bg-neutral-900/80 border border-brand-500/30 rounded-xl p-3 text-center">
            <span className="text-xl font-black text-brand-500 block">{riskScore.breakdown.high}</span>
            <span className="text-[10px] uppercase font-mono font-semibold text-brand-400">High</span>
          </div>

          {/* Medium */}
          <div className="bg-neutral-900/80 border border-amber-500/30 rounded-xl p-3 text-center">
            <span className="text-xl font-black text-amber-400 block">{riskScore.breakdown.medium}</span>
            <span className="text-[10px] uppercase font-mono font-semibold text-amber-400">Medium</span>
          </div>

          {/* Low */}
          <div className="bg-neutral-900/80 border border-blue-500/20 rounded-xl p-3 text-center">
            <span className="text-xl font-black text-blue-400 block">{riskScore.breakdown.low}</span>
            <span className="text-[10px] uppercase font-mono font-semibold text-blue-400">Low</span>
          </div>

          {/* Informational */}
          <div className="col-span-2 sm:col-span-1 bg-neutral-900/80 border border-white/10 rounded-xl p-3 text-center">
            <span className="text-xl font-black text-[#A3A3A3] block">{riskScore.breakdown.informational}</span>
            <span className="text-[10px] uppercase font-mono font-semibold text-[#737373]">Info</span>
          </div>
        </div>
      </div>

      {/* Transparent Scoring Methodology Note */}
      <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-start gap-3 text-xs">
        <HelpCircle className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
        <div className="flex-1 space-y-1">
          <p className="font-semibold text-white">Transparent Scoring Methodology</p>
          <p className="text-[#A3A3A3] leading-relaxed">
            {riskScore.methodology}
          </p>
          <div className="flex flex-wrap items-center gap-4 pt-1 font-mono text-[11px] text-[#737373]">
            <span>Total Rules Evaluated: <strong className="text-white">{totalFindings}</strong></span>
            <span>•</span>
            <span>Confirmed Manifest/Code Findings: <strong className="text-emerald-400">{confirmedFindings}</strong></span>
            <span>•</span>
            <span>Heuristic Detections: <strong className="text-amber-400">{heuristicDetections}</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
}
