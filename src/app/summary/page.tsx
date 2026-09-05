'use client';

import React, { useState } from 'react';
import { useMedLens } from '@/context/MedLensContext';
import { StatusBadge } from '@/components/StatusBadge';
import { ProvenanceBadge } from '@/components/ProvenanceBadge';
import { 
  Sparkles, 
  ShieldAlert, 
  CheckCircle2, 
  HelpCircle, 
  RefreshCw, 
  FileText, 
  BookOpen,
  Lock,
  User,
  ShieldCheck
} from 'lucide-react';
import { MEDICAL_DISCLAIMER_TEXT } from '@/lib/evaluator';

export default function AISummaryPage() {
  const { aiSummary, refreshAISummary, patient, tests } = useMedLens();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patient, tests }),
      });
      if (res.ok) {
        refreshAISummary();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">
      
      {/* Title & Refresh */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-sky-400" />
              Patient-Friendly AI Clinical Summary
            </h1>
            <ProvenanceBadge provenance="AI Generated" />
          </div>
          <p className="text-slate-400 text-xs mt-1">
            Consolidates available laboratory markers into plain English for patient educational overview.
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-clinical-600 hover:from-sky-400 hover:to-clinical-500 text-white font-bold text-xs shadow-lg shadow-sky-500/20 flex items-center gap-2 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh Summary
        </button>
      </div>

      {/* Safety Compliance Guardrails Bar */}
      <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-sky-950/40 border border-emerald-500/30 rounded-xl p-4">
        <h3 className="font-bold text-xs text-emerald-400 uppercase tracking-wider flex items-center gap-2 mb-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          AI Safety Rules & Medical Disclaimer Policy
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-300">
          <div className="flex items-center gap-2 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
            <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
            <span><strong>No Medical Diagnosis</strong> generated or implied.</span>
          </div>

          <div className="flex items-center gap-2 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
            <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
            <span><strong>No Prescriptions</strong> or dosage suggestions.</span>
          </div>

          <div className="flex items-center gap-2 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
            <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
            <span><strong>No Invented Ranges</strong> or ungrounded facts.</span>
          </div>
        </div>
      </div>

      {/* Main AI Summary Content Card */}
      {aiSummary && (
        <div className="space-y-6">
          
          {/* Summary Text Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="font-bold text-base text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-sky-400" />
                Clinical Overview for {patient.name} ({patient.id})
              </h2>
              <span className="text-[11px] text-slate-400 font-mono">
                {aiSummary.stabilityStatus}
              </span>
            </div>

            <div className="prose prose-invert max-w-none text-slate-200 text-sm leading-relaxed bg-slate-950/40 p-4 rounded-xl border border-slate-800">
              {aiSummary.summaryText}
            </div>

            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                {MEDICAL_DISCLAIMER_TEXT}
              </p>
            </div>
          </div>

          {/* Key Extracted Findings Summary Grid */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
            <h3 className="font-bold text-sm text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <CheckCircle2 className="w-4 h-4 text-sky-400" />
              Summarized Lab Findings Breakdown
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {aiSummary.keyFindings.map((finding, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3 text-xs">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-400 block font-mono">{finding.category}</span>
                    <span className="font-medium text-slate-200">{finding.finding}</span>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <StatusBadge status={finding.status} />
                    <ProvenanceBadge provenance={finding.provenance} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Terminology Glossary Tooltip Guide */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
            <h3 className="font-bold text-sm text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <BookOpen className="w-4 h-4 text-indigo-400" />
              Patient Medical Terminology Glossary
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {aiSummary.glossaryTerms.map((term, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <div className="font-bold text-xs text-sky-300">{term.term}</div>
                  <div className="text-xs text-slate-400 leading-relaxed">{term.definition}</div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
