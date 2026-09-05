'use client';

import React from 'react';
import Link from 'next/link';
import { useMedLens } from '@/context/MedLensContext';
import { StatusBadge } from '@/components/StatusBadge';
import { ProvenanceBadge } from '@/components/ProvenanceBadge';
import { 
  Activity, 
  User, 
  FileText, 
  AlertTriangle, 
  Sparkles, 
  ArrowRight, 
  UploadCloud, 
  Table, 
  CheckCircle2, 
  ShieldCheck, 
  BarChart3,
  Flame,
  HelpCircle
} from 'lucide-react';

export default function DashboardPage() {
  const { patient, tests, reports, conflicts, aiSummary, loadSampleData } = useMedLens();

  const highCount = tests.filter(t => t.status === 'HIGH').length;
  const lowCount = tests.filter(t => t.status === 'LOW').length;
  const undeterCount = tests.filter(t => t.status === 'CANNOT DETERMINE').length;
  const normalCount = tests.filter(t => t.status === 'NORMAL').length;
  const unresolvedConflicts = conflicts.filter(c => !c.resolved).length;

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-clinical-900 border border-slate-800 p-6 sm:p-8 shadow-xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-sky-500/20 text-sky-300 border border-sky-400/30">
                Active Patient Case: {patient.id}
              </span>
              <span className="text-slate-400 text-xs">Last updated: {patient.lastUpdated}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Clinical Intelligence Dashboard: <span className="text-sky-400">{patient.name}</span>
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl">
              Real-time synthesis of patient-reported history and extracted laboratory reports with strict reference range evaluation and provenance auditing.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => loadSampleData(0)}
              className="px-4 py-2 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 border border-sky-400/40 text-sky-300 font-semibold text-xs flex items-center gap-2 transition-all"
            >
              <Flame className="w-4 h-4 text-sky-400" />
              Reset Demo Profile
            </button>

            <Link
              href="/upload"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-clinical-600 hover:from-sky-400 hover:to-clinical-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-sky-500/25 transition-all"
            >
              <UploadCloud className="w-4 h-4" />
              Upload Medical Report
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Metric 1: Total Extracted Tests */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Extracted Markers</span>
            <Table className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-bold text-white">{tests.length}</div>
          <div className="text-[11px] text-slate-400">Across {reports.length} report documents</div>
        </div>

        {/* Metric 2: Elevated (HIGH) */}
        <div className="bg-slate-900/90 border border-red-500/30 rounded-xl p-4 space-y-1 bg-red-950/10">
          <div className="flex items-center justify-between text-red-400 text-xs font-medium">
            <span>High Markers</span>
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
          </div>
          <div className="text-2xl font-bold text-red-400">{highCount}</div>
          <div className="text-[11px] text-slate-400">Exceeding report max range</div>
        </div>

        {/* Metric 3: Low Markers */}
        <div className="bg-slate-900/90 border border-amber-500/30 rounded-xl p-4 space-y-1 bg-amber-950/10">
          <div className="flex items-center justify-between text-amber-400 text-xs font-medium">
            <span>Low Markers</span>
            <span className="w-2 h-2 rounded-full bg-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-400">{lowCount}</div>
          <div className="text-[11px] text-slate-400">Below report min range</div>
        </div>

        {/* Metric 4: Cannot Determine (Strict Rule) */}
        <div className="bg-slate-900/90 border border-slate-700 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Cannot Determine</span>
            <HelpCircle className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-300">{undeterCount}</div>
          <div className="text-[11px] text-slate-400">Missing range in report</div>
        </div>

        {/* Metric 5: Unresolved Conflicts */}
        <div className="col-span-2 lg:col-span-1 bg-slate-900/90 border border-indigo-500/30 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between text-indigo-400 text-xs font-medium">
            <span>Active Conflicts</span>
            <AlertTriangle className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-indigo-300">{unresolvedConflicts}</div>
          <div className="text-[11px] text-slate-400">Discrepancies flagged</div>
        </div>

      </div>

      {/* Main Grid: Patient Overview & Recent Lab Findings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Patient Profile Card & AI Summary Snippet */}
        <div className="space-y-6 lg:col-span-1">
          
          {/* Patient Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-sky-400" />
                <h2 className="font-bold text-base text-white">Patient Profile</h2>
              </div>
              <ProvenanceBadge provenance="Patient Input" />
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Age & Sex</span>
                <span className="font-semibold text-slate-200">{patient.age} years old ({patient.sex})</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Patient ID</span>
                <span className="font-semibold text-sky-400 font-mono">{patient.id}</span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <span className="text-slate-400 font-medium block">Reported Symptoms:</span>
              <div className="flex flex-wrap gap-1.5">
                {patient.symptoms.length > 0 ? (
                  patient.symptoms.map((s, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {s}
                    </span>
                  ))
                ) : (
                  <span className="text-slate-500 italic">No current symptoms reported</span>
                )}
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <span className="text-slate-400 font-medium block">Existing Chronic Conditions:</span>
              <div className="flex flex-wrap gap-1.5">
                {patient.existingConditions.length > 0 ? (
                  patient.existingConditions.map((c, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded bg-clinical-900/60 text-sky-300 border border-clinical-700/50">
                      {c}
                    </span>
                  ))
                ) : (
                  <span className="text-slate-500 italic">No chronic conditions listed</span>
                )}
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <span className="text-slate-400 font-medium block">Allergies:</span>
              <div className="flex flex-wrap gap-1.5">
                {patient.allergies.map((a, idx) => (
                  <span key={idx} className="px-2 py-0.5 rounded bg-red-950/40 text-red-300 border border-red-800/50">
                    {a}
                  </span>
                ))}
              </div>
            </div>

            <div className="border-t border-slate-800 pt-3">
              <Link 
                href="/patient" 
                className="text-xs font-semibold text-sky-400 hover:text-sky-300 flex items-center justify-between"
              >
                <span>Edit Full Patient Profile</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* AI Summary Highlight Box */}
          {aiSummary && (
            <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-sky-950/40 border border-sky-500/30 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-sky-400" />
                  <h3 className="font-bold text-sm text-white">AI Summary Snapshot</h3>
                </div>
                <ProvenanceBadge provenance="AI Generated" />
              </div>
              
              <p className="text-xs text-slate-300 leading-relaxed line-clamp-4">
                {aiSummary.summaryText}
              </p>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  {aiSummary.stabilityStatus}
                </span>
                <Link
                  href="/summary"
                  className="text-xs font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1"
                >
                  View Full Summary <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}

        </div>

        {/* Right 2 Columns: Extracted Lab Results Table */}
        <div className="lg:col-span-2 space-y-4">
          
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <h2 className="font-bold text-base text-white flex items-center gap-2">
                  <Table className="w-5 h-5 text-sky-400" />
                  Extracted Lab Test Results ({tests.length})
                </h2>
                <p className="text-slate-400 text-xs">
                  Status evaluated ONLY from reference ranges present in uploaded medical reports.
                </p>
              </div>

              <Link
                href="/record"
                className="text-xs font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1 self-start sm:self-auto"
              >
                Full Structured Record <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Test Results Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-semibold bg-slate-950/40">
                    <th className="py-2.5 px-3">Test Parameter</th>
                    <th className="py-2.5 px-3">Value</th>
                    <th className="py-2.5 px-3">Report Reference Range</th>
                    <th className="py-2.5 px-3">Strict Status</th>
                    <th className="py-2.5 px-3">Provenance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {tests.slice(0, 7).map((test) => (
                    <tr key={test.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-200">{test.testName}</div>
                        <div className="text-[10px] text-slate-500">{test.category} • {test.date}</div>
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-slate-100">
                        {test.value} <span className="text-[10px] text-slate-400 font-normal">{test.unit}</span>
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-300">
                        {test.referenceRange ? (
                          <span>{test.referenceRange}</span>
                        ) : (
                          <span className="text-slate-500 italic text-[11px]">Not in report</span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <StatusBadge status={test.status} referenceRange={test.referenceRange} />
                      </td>
                      <td className="py-3 px-3">
                        <ProvenanceBadge provenance={test.provenance} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {tests.length > 7 && (
              <div className="text-center pt-2 border-t border-slate-800">
                <Link href="/record" className="text-xs text-sky-400 font-medium hover:underline">
                  + {tests.length - 7} more lab test parameters extracted
                </Link>
              </div>
            )}

          </div>

          {/* Quick Action Navigation Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            <Link
              href="/upload"
              className="bg-slate-900 border border-slate-800 hover:border-sky-500/50 rounded-xl p-4 flex items-center gap-3 transition-all hover:scale-[1.01] group"
            >
              <div className="w-10 h-10 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center shrink-0 group-hover:bg-sky-500 group-hover:text-white transition-colors">
                <UploadCloud className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-slate-200">Process Report</h4>
                <p className="text-[11px] text-slate-400">OCR & Gemini extraction</p>
              </div>
            </Link>

            <Link
              href="/compare"
              className="bg-slate-900 border border-slate-800 hover:border-sky-500/50 rounded-xl p-4 flex items-center gap-3 transition-all hover:scale-[1.01] group"
            >
              <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-slate-200">Lab Trends</h4>
                <p className="text-[11px] text-slate-400">Multi-report matrix</p>
              </div>
            </Link>

            <Link
              href="/conflicts"
              className="bg-slate-900 border border-slate-800 hover:border-sky-500/50 rounded-xl p-4 flex items-center gap-3 transition-all hover:scale-[1.01] group"
            >
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-slate-200">Conflict Detector</h4>
                <p className="text-[11px] text-slate-400">{unresolvedConflicts} discrepancies</p>
              </div>
            </Link>

          </div>

        </div>

      </div>

    </div>
  );
}
