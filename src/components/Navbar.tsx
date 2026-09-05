'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useMedLens } from '@/context/MedLensContext';
import { 
  Activity, 
  User, 
  UploadCloud, 
  Table, 
  Sparkles, 
  GitCompare, 
  AlertTriangle, 
  ChevronDown, 
  RefreshCw,
  PlusCircle,
  FileCheck,
  Clock,
  UserPlus,
  Check
} from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { 
    patient, 
    patients, 
    selectPatient, 
    startNewPatient, 
    loadSampleData, 
    conflicts, 
    tests, 
    timelineEvents,
    draftPatient 
  } = useMedLens();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const unresolvedConflicts = conflicts.filter(c => !c.resolved).length;

  const handleStartNewPatient = () => {
    startNewPatient();
    setDropdownOpen(false);
    router.push('/patient');
  };

  const navLinks = [
    { name: 'Dashboard', href: '/', icon: Activity },
    { name: 'Patient Info', href: '/patient', icon: User },
    { name: 'Medical Reports', href: '/upload', icon: UploadCloud },
    { name: 'Structured Record', href: '/record', icon: Table, count: tests.length },
    { name: 'Patient Timeline', href: '/timeline', icon: Clock, count: timelineEvents.length },
    { name: 'AI Summary', href: '/summary', icon: Sparkles },
    { name: 'Comparison', href: '/compare', icon: GitCompare },
    { name: 'Conflicts', href: '/conflicts', icon: AlertTriangle, badge: unresolvedConflicts },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 shadow-lg text-white">
      {/* Top Bar: Brand & Patient Selector & Demo Action */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-clinical-600 flex items-center justify-center shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform">
              <Activity className="w-6 h-6 text-white stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-white">
                  Med<span className="text-sky-400">Lens</span>
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-400/30 uppercase tracking-wider">
                  PromptWars Edition
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                AI-Powered Clinical Information Intelligence
              </p>
            </div>
          </Link>

          {/* Right Actions: Patient Dropdown & Quick Demo Loader */}
          <div className="flex items-center gap-3">
            
            {/* Patient Context Dropdown */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-xs font-medium text-slate-200 transition-colors"
              >
                <User className="w-3.5 h-3.5 text-sky-400" />
                <span className="max-w-[140px] truncate font-semibold">
                  {draftPatient ? `New (${draftPatient.id})` : `${patient.name} (${patient.id})`}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 rounded-xl bg-slate-800 border border-slate-700 shadow-2xl z-50 py-2 text-xs">
                  
                  {/* Create New Patient Button in Dropdown */}
                  <div className="px-2 pb-2 border-b border-slate-700/80">
                    <button
                      onClick={handleStartNewPatient}
                      className="w-full text-left px-3 py-2 rounded-lg bg-gradient-to-r from-sky-500 to-clinical-600 hover:from-sky-400 hover:to-clinical-500 text-white font-bold flex items-center justify-between shadow-md transition-all"
                    >
                      <span className="flex items-center gap-2">
                        <UserPlus className="w-4 h-4" />
                        + New Patient
                      </span>
                      <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded font-mono">Create</span>
                    </button>
                  </div>

                  <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Select Active Patient ({patients.length})
                  </div>

                  <div className="max-h-56 overflow-y-auto no-scrollbar space-y-0.5">
                    {patients.map((p) => {
                      const isSelected = !draftPatient && patient.id === p.id;
                      return (
                        <button
                          key={p.id}
                          onClick={() => {
                            selectPatient(p.id);
                            setDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 hover:bg-slate-700/70 flex flex-col gap-0.5 transition-colors ${
                            isSelected ? 'bg-sky-500/10 border-l-2 border-sky-400 text-sky-300' : 'text-slate-300'
                          }`}
                        >
                          <div className="font-medium flex items-center justify-between">
                            <span className="flex items-center gap-1.5">
                              {p.name || 'Unnamed Patient'}
                              {isSelected && <Check className="w-3 h-3 text-sky-400" />}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">{p.id}</span>
                          </div>
                          <div className="text-[11px] text-slate-400 truncate">
                            {p.age > 0 ? `${p.age}y ${p.sex}` : 'New profile'} • {p.symptoms.slice(0, 2).join(', ') || p.existingConditions.slice(0, 2).join(', ') || 'No listed history'}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="border-t border-slate-700/60 mt-1 pt-1 px-2">
                    <button
                      onClick={() => {
                        loadSampleData(0);
                        setDropdownOpen(false);
                      }}
                      className="w-full text-left px-2 py-1.5 rounded bg-slate-900/60 text-slate-300 hover:bg-slate-700 flex items-center gap-1.5 text-[11px] font-medium"
                    >
                      <RefreshCw className="w-3 h-3 text-sky-400" />
                      Reset to Demo Patient (John Doe)
                    </button>
                  </div>

                </div>
              )}
            </div>

            {/* Direct + New Patient Quick Action Button */}
            <button
              onClick={handleStartNewPatient}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 border border-sky-400/40 text-sky-300 font-semibold text-xs transition-all hover:scale-[1.02]"
              title="Create a new patient profile"
            >
              <UserPlus className="w-3.5 h-3.5 text-sky-400" />
              <span>+ New Patient</span>
            </button>

            {/* Quick Demo Loader Button for Hackathon Judges */}
            <button
              onClick={() => loadSampleData(0)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-sky-500 to-clinical-600 hover:from-sky-400 hover:to-clinical-500 text-white font-semibold text-xs shadow-md shadow-sky-500/20 transition-all hover:scale-[1.02]"
              title="Click to reset to complete demo dataset for testing"
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span className="hidden md:inline">1-Click Demo Data</span>
            </button>
          </div>
        </div>

        {/* Bottom Navigation Tabs */}
        <nav className="flex items-center gap-1 overflow-x-auto no-scrollbar py-2 border-t border-slate-800">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-sky-400' : 'text-slate-400'}`} />
                <span>{link.name}</span>
                
                {link.count !== undefined && link.count > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300">
                    {link.count}
                  </span>
                )}

                {link.badge !== undefined && link.badge > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-red-500 text-white animate-pulse">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
