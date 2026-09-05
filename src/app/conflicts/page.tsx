'use client';

import React from 'react';
import { useMedLens } from '@/context/MedLensContext';
import { ProvenanceBadge } from '@/components/ProvenanceBadge';
import { 
  AlertTriangle, 
  CheckCircle2, 
  ShieldAlert, 
  ArrowRight, 
  UserCheck, 
  RotateCcw,
  Sparkles,
  HelpCircle
} from 'lucide-react';

export default function ConflictsPage() {
  const { conflicts, resolveConflict, patient, tests } = useMedLens();

  const unresolved = conflicts.filter(c => !c.resolved);
  const resolved = conflicts.filter(c => c.resolved);

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">
      
      {/* Title */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-amber-400" />
              Clinical Conflict & Inconsistency Inspector
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-400/30">
              {unresolved.length} Unresolved Discrepancies
            </span>
          </div>
          <p className="text-slate-400 text-xs mt-1">
            Automated cross-validation engine comparing patient self-reported history against extracted laboratory observations.
          </p>
        </div>
      </div>

      {/* Unresolved Conflicts Section */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-red-400" />
          Active Flagged Discrepancies ({unresolved.length})
        </h2>

        {unresolved.length === 0 ? (
          <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-8 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
            <h3 className="font-bold text-base text-white">No Active Conflicts Detected</h3>
            <p className="text-xs text-slate-400">
              Patient self-reported information aligns consistently with extracted laboratory report metrics.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {unresolved.map((conflict) => (
              <div 
                key={conflict.id}
                className="bg-slate-900 border border-amber-500/30 rounded-2xl p-6 space-y-4 shadow-xl hover:border-amber-500/50 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold ${
                      conflict.severity === 'High' ? 'bg-red-500/20 text-red-300 border border-red-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      {conflict.severity} Severity
                    </span>
                    <h3 className="font-bold text-base text-white">{conflict.title}</h3>
                  </div>

                  <span className="text-xs text-slate-400 font-mono">
                    Type: {conflict.type}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {conflict.description}
                </p>

                {/* Source A vs Source B Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  
                  {/* Source A: Patient Input */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-sky-500/20 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-200">Source A: Self-Reported History</span>
                      <ProvenanceBadge provenance="Patient Input" />
                    </div>
                    <p className="text-sky-300 font-mono font-medium">{conflict.patientData}</p>
                  </div>

                  {/* Source B: Medical Report */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-indigo-500/20 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-200">Source B: Laboratory Scan</span>
                      <ProvenanceBadge provenance="Medical Report" />
                    </div>
                    <p className="text-indigo-300 font-mono font-medium">{conflict.reportData}</p>
                  </div>

                </div>

                {/* Recommendation & Resolution Action */}
                <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-800">
                  <div className="text-[11px] text-slate-400">
                    <strong className="text-slate-300">Suggested Workflow Action:</strong> {conflict.suggestedAction}
                  </div>

                  <button
                    onClick={() => resolveConflict(conflict.id)}
                    className="px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/40 font-semibold text-xs flex items-center gap-1.5 transition-colors shrink-0"
                  >
                    <UserCheck className="w-4 h-4" />
                    Mark Reconciled by Clinician
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

      {/* Resolved Conflicts Archive */}
      {resolved.length > 0 && (
        <div className="space-y-3 pt-4">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Resolved & Reconciled Discrepancies ({resolved.length})
          </h2>

          {resolved.map((conflict) => (
            <div key={conflict.id} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs flex items-center justify-between opacity-70">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-semibold text-slate-300">{conflict.title}</span>
                <span className="text-slate-500">({conflict.type})</span>
              </div>
              <span className="text-emerald-400 font-semibold text-[11px]">Reconciled</span>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
