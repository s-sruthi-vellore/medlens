'use client';

import React, { useState } from 'react';
import { ShieldAlert, X, Info } from 'lucide-react';
import { MEDICAL_DISCLAIMER_TEXT } from '@/lib/evaluator';

export function DisclaimerBanner() {
  const [dismissed, setDismissed] = useState(false);
  const [showFull, setShowFull] = useState(false);

  if (dismissed) {
    return (
      <div className="bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-900/50 py-1 px-4 text-xs flex items-center justify-between text-amber-800 dark:text-amber-300">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
          <span className="font-medium">Medical Intelligence Disclaimer: Informational & Educational Workflow Assistance Only</span>
        </div>
        <button 
          onClick={() => setDismissed(false)}
          className="underline hover:text-amber-900 dark:hover:text-amber-100 text-[11px]"
        >
          View Full Policy
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-amber-500/10 via-sky-500/10 to-indigo-500/10 border-b border-amber-500/20 backdrop-blur-sm px-4 py-2.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-start sm:items-center justify-between gap-3 text-xs text-slate-800 dark:text-slate-200">
        <div className="flex items-start gap-2.5">
          <div className="p-1 rounded-md bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5 sm:mt-0">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-amber-700 dark:text-amber-300 mr-2">
              CLINICAL PRIVACY & SAFETY NOTICE:
            </span>
            <span className="text-slate-600 dark:text-slate-300">
              MedLens structures and correlates clinical data. It <strong className="font-semibold text-slate-900 dark:text-slate-100">does not diagnose, prescribe, or provide medical advice</strong>. Test status is derived strictly from ranges provided in uploaded reports.
            </span>
            {showFull && (
              <p className="mt-1 text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
                {MEDICAL_DISCLAIMER_TEXT}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowFull(!showFull)}
            className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 underline"
          >
            <Info className="w-3 h-3" />
            {showFull ? 'Hide detail' : 'Read safety rule'}
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800/50"
            title="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
