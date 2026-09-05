'use client';

import React, { useState } from 'react';
import { useMedLens } from '@/context/MedLensContext';
import { ProvenanceBadge } from '@/components/ProvenanceBadge';
import { Provenance } from '@/lib/types';
import { 
  Clock, 
  User, 
  FileText, 
  Sparkles, 
  Table, 
  CheckCircle2, 
  Filter, 
  ArrowDown, 
  Calendar,
  Layers,
  Activity
} from 'lucide-react';

export default function PatientTimelinePage() {
  const { timelineEvents, patient } = useMedLens();
  const [selectedProvenance, setSelectedProvenance] = useState<string>('All');

  const filteredEvents = timelineEvents.filter(event => {
    if (selectedProvenance === 'All') return true;
    return event.provenance === selectedProvenance;
  });

  const getEventIcon = (type: string, provenance: Provenance) => {
    if (provenance === 'Patient Input') {
      return <User className="w-4 h-4 text-sky-400" />;
    }
    if (provenance === 'AI Generated') {
      return <Sparkles className="w-4 h-4 text-emerald-400" />;
    }
    if (type === 'report_uploaded') {
      return <FileText className="w-4 h-4 text-indigo-400" />;
    }
    if (type === 'report_processed' || type === 'record_extracted') {
      return <Table className="w-4 h-4 text-indigo-400" />;
    }
    return <Activity className="w-4 h-4 text-indigo-400" />;
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
      
      {/* Title Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Clock className="w-6 h-6 text-sky-400" />
              Patient Activity Timeline
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-500/20 text-sky-300 border border-sky-400/30">
              {filteredEvents.length} Events Logged
            </span>
          </div>
          <p className="text-slate-400 text-xs mt-1">
            Chronological audit log of clinical history updates, report uploads, OCR extractions, and AI summary generations for <strong className="text-slate-200">{patient.name} ({patient.id})</strong>.
          </p>
        </div>
      </div>

      {/* Provenance Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
          <Filter className="w-4 h-4 text-sky-400" />
          <span>Filter Events by Source:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {['All', 'Patient Input', 'Medical Report', 'AI Generated'].map((prov) => (
            <button
              key={prov}
              onClick={() => setSelectedProvenance(prov)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                selectedProvenance === prov
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {prov}
            </button>
          ))}
        </div>
      </div>

      {/* Main Chronological Timeline Feed */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-8 shadow-xl relative">
        
        {/* Timeline Center/Left Vertical Connector Line */}
        <div className="absolute left-8 sm:left-12 top-12 bottom-12 w-0.5 bg-gradient-to-b from-sky-500 via-indigo-500 to-slate-800 pointer-events-none" />

        {filteredEvents.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs italic">
            No activity timeline events recorded matching current filter.
          </div>
        ) : (
          filteredEvents.map((event, idx) => (
            <div key={event.id} className="relative flex items-start gap-4 sm:gap-6 pl-2 sm:pl-4 group">
              
              {/* Timeline Icon Node Badge */}
              <div className="relative z-10 w-10 h-10 rounded-xl bg-slate-950 border border-slate-700 flex items-center justify-center shrink-0 shadow-md group-hover:scale-110 group-hover:border-sky-500 transition-all">
                {getEventIcon(event.type, event.provenance)}
              </div>

              {/* Event Content Card */}
              <div className="flex-1 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl p-4 space-y-2 transition-all shadow-md">
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-800/80 pb-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-slate-100">{event.title}</h3>
                    <ProvenanceBadge provenance={event.provenance} />
                  </div>

                  <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-500" />
                    {event.formattedDate}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  {event.description}
                </p>

                <div className="pt-1 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                  <span>Patient ID: {event.patientId}</span>
                  <span className="capitalize text-slate-400">Type: {event.type.replace('_', ' ')}</span>
                </div>

              </div>

            </div>
          ))
        )}

      </div>

    </div>
  );
}
