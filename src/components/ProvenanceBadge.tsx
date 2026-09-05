'use client';

import React from 'react';
import { Provenance } from '@/lib/types';
import { User, FileText, Sparkles } from 'lucide-react';

interface ProvenanceBadgeProps {
  provenance: Provenance;
  className?: string;
}

export function ProvenanceBadge({ provenance, className = '' }: ProvenanceBadgeProps) {
  if (provenance === 'Patient Input') {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-700 border border-sky-500/20 dark:bg-sky-950/50 dark:text-sky-300 dark:border-sky-800/50 ${className}`}>
        <User className="w-3 h-3 text-sky-500" />
        Patient Input
      </span>
    );
  }

  if (provenance === 'Medical Report') {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-700 border border-indigo-500/20 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800/50 ${className}`}>
        <FileText className="w-3 h-3 text-indigo-500" />
        Medical Report
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800/50 ${className}`}>
      <Sparkles className="w-3 h-3 text-emerald-500" />
      AI Generated
    </span>
  );
}
