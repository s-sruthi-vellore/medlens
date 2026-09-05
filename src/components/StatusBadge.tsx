'use client';

import React from 'react';
import { TestStatus } from '@/lib/types';
import { ArrowUp, ArrowDown, CheckCircle2, HelpCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: TestStatus;
  referenceRange?: string | null;
  className?: string;
}

export function StatusBadge({ status, referenceRange, className = '' }: StatusBadgeProps) {
  if (status === 'HIGH') {
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-red-500/10 text-red-700 border border-red-500/20 dark:bg-red-950/60 dark:text-red-300 dark:border-red-800/50 ${className}`}>
        <ArrowUp className="w-3.5 h-3.5 text-red-500 stroke-[3]" />
        HIGH
      </span>
    );
  }

  if (status === 'LOW') {
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-amber-500/10 text-amber-700 border border-amber-500/20 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/50 ${className}`}>
        <ArrowDown className="w-3.5 h-3.5 text-amber-500 stroke-[3]" />
        LOW
      </span>
    );
  }

  if (status === 'NORMAL') {
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/50 ${className}`}>
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 stroke-[2.5]" />
        NORMAL
      </span>
    );
  }

  // CANNOT DETERMINE
  return (
    <span 
      title={referenceRange ? "Value or range could not be evaluated" : "Report omitted reference range - status strictly withheld per safety rules"} 
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-500/10 text-slate-600 border border-slate-500/20 dark:bg-slate-800/60 dark:text-slate-400 dark:border-slate-700 ${className}`}
    >
      <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
      CANNOT DETERMINE
    </span>
  );
}
