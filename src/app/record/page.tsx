'use client';

import React, { useState } from 'react';
import { useMedLens } from '@/context/MedLensContext';
import { StatusBadge } from '@/components/StatusBadge';
import { ProvenanceBadge } from '@/components/ProvenanceBadge';
import { TestResult, TestCategory, TestStatus } from '@/lib/types';
import { 
  Table, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  CheckSquare, 
  Square, 
  Download, 
  Printer, 
  HelpCircle,
  X,
  Save,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

export default function StructuredRecordPage() {
  const { tests, patient, updateTestResult, deleteTestResult } = useMedLens();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [editingTestId, setEditingTestId] = useState<string | null>(null);
  
  // Edit modal / inline state
  const [editForm, setEditForm] = useState<{
    value: string;
    unit: string;
    referenceRange: string;
    observations: string;
    category: TestCategory;
  }>({
    value: '',
    unit: '',
    referenceRange: '',
    observations: '',
    category: 'Other',
  });

  const categories: string[] = ['All', 'Metabolic', 'Lipids', 'Hematology', 'Renal', 'Endocrine', 'Cardiovascular', 'Other'];
  const statusOptions: string[] = ['All', 'HIGH', 'LOW', 'NORMAL', 'CANNOT DETERMINE'];

  // Filtering logic
  const filteredTests = tests.filter((t) => {
    const matchesSearch = t.testName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.observations.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCat = selectedCategory === 'All' || t.category === selectedCategory;
    const matchesStat = selectedStatus === 'All' || t.status === selectedStatus;

    return matchesSearch && matchesCat && matchesStat;
  });

  const handleStartEdit = (t: TestResult) => {
    setEditingTestId(t.id);
    setEditForm({
      value: String(t.value),
      unit: t.unit,
      referenceRange: t.referenceRange || '',
      observations: t.observations,
      category: t.category,
    });
  };

  const handleSaveEdit = (id: string) => {
    updateTestResult(id, {
      value: isNaN(parseFloat(editForm.value)) ? editForm.value : parseFloat(editForm.value),
      unit: editForm.unit,
      referenceRange: editForm.referenceRange.trim() ? editForm.referenceRange : null,
      observations: editForm.observations,
      category: editForm.category,
      verifiedByHuman: true, // Mark human verified upon editing!
    });
    setEditingTestId(null);
  };

  const toggleVerification = (t: TestResult) => {
    updateTestResult(t.id, { verifiedByHuman: !t.verifiedByHuman });
  };

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ patient, tests }, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `MedLens_Record_${patient.id}_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fade-in">
      
      {/* Title & Export Actions */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Table className="w-6 h-6 text-sky-400" />
              Structured Medical Record
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-500/20 text-sky-300 border border-sky-400/30">
              {tests.length} Total Parameters
            </span>
          </div>
          <p className="text-slate-400 text-xs mt-1">
            Auditable clinical laboratory record. Status is calculated strictly from reference ranges provided in uploaded reports.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportJSON}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold text-xs flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-4 h-4 text-sky-400" />
            Export JSON
          </button>
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold text-xs flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-4 h-4 text-indigo-400" />
            Print Report
          </button>
        </div>
      </div>

      {/* Search & Filter Controls Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          
          {/* Search Box */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search test name, category, observation..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            <span className="text-slate-400 text-xs font-medium flex items-center gap-1 shrink-0">
              <Filter className="w-3.5 h-3.5" /> Status:
            </span>
            {statusOptions.map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedStatus === st
                    ? 'bg-sky-500 text-white'
                    : 'bg-slate-950 text-slate-400 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-2 border-t border-slate-800/80">
          <span className="text-slate-400 text-[11px] font-medium shrink-0">Category:</span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-indigo-500 text-white'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Extracted Data Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold bg-slate-950/60">
                <th className="py-3 px-3">Verified</th>
                <th className="py-3 px-3">Test Parameter</th>
                <th className="py-3 px-3">Extracted Value</th>
                <th className="py-3 px-3">Report Reference Range</th>
                <th className="py-3 px-3">Strict Status</th>
                <th className="py-3 px-3">Source & Provenance</th>
                <th className="py-3 px-3">Confidence</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredTests.map((test) => {
                const isEditing = editingTestId === test.id;

                return (
                  <tr key={test.id} className="hover:bg-slate-800/40 transition-colors">
                    
                    {/* Clinician Verification Checkbox */}
                    <td className="py-3 px-3">
                      <button
                        onClick={() => toggleVerification(test)}
                        title={test.verifiedByHuman ? 'Verified by Clinician' : 'Click to verify item'}
                        className="text-slate-400 hover:text-sky-400 transition-colors"
                      >
                        {test.verifiedByHuman ? (
                          <CheckSquare className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-600" />
                        )}
                      </button>
                    </td>

                    {/* Test Parameter & Date */}
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-100">{test.testName}</div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {test.category} • {test.date}
                      </div>
                    </td>

                    {/* Value */}
                    <td className="py-3 px-3">
                      {isEditing ? (
                        <div className="flex gap-1">
                          <input
                            type="text"
                            value={editForm.value}
                            onChange={(e) => setEditForm({ ...editForm, value: e.target.value })}
                            className="w-16 px-1.5 py-0.5 rounded bg-slate-950 border border-slate-700 text-xs text-white font-mono"
                          />
                          <input
                            type="text"
                            value={editForm.unit}
                            onChange={(e) => setEditForm({ ...editForm, unit: e.target.value })}
                            className="w-12 px-1.5 py-0.5 rounded bg-slate-950 border border-slate-700 text-[10px] text-slate-300"
                          />
                        </div>
                      ) : (
                        <span className="font-mono font-bold text-slate-100">
                          {test.value} <span className="text-[10px] text-slate-400 font-normal">{test.unit}</span>
                        </span>
                      )}
                    </td>

                    {/* Reference Range */}
                    <td className="py-3 px-3">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.referenceRange}
                          onChange={(e) => setEditForm({ ...editForm, referenceRange: e.target.value })}
                          placeholder="e.g. 70 - 99"
                          className="w-24 px-1.5 py-0.5 rounded bg-slate-950 border border-slate-700 text-xs text-white font-mono"
                        />
                      ) : test.referenceRange ? (
                        <span className="font-mono text-slate-300">{test.referenceRange}</span>
                      ) : (
                        <span className="text-slate-500 italic text-[11px]" title="Strict rule: no reference range in report">
                          Not Provided
                        </span>
                      )}
                    </td>

                    {/* Strict Status */}
                    <td className="py-3 px-3">
                      <StatusBadge status={test.status} referenceRange={test.referenceRange} />
                    </td>

                    {/* Provenance */}
                    <td className="py-3 px-3">
                      <ProvenanceBadge provenance={test.provenance} />
                    </td>

                    {/* Confidence Indicator */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5">
                        <div className="w-12 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${
                              test.confidence > 90 ? 'bg-emerald-400' : test.confidence > 75 ? 'bg-amber-400' : 'bg-red-400'
                            }`}
                            style={{ width: `${test.confidence}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">{test.confidence}%</span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3 text-right">
                      {isEditing ? (
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleSaveEdit(test.id)}
                            className="p-1 rounded bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30"
                            title="Save edits"
                          >
                            <Save className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingTestId(null)}
                            className="p-1 rounded bg-slate-800 text-slate-400 hover:text-slate-200"
                            title="Cancel"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleStartEdit(test)}
                            className="p-1 rounded text-slate-400 hover:text-sky-400 hover:bg-slate-800"
                            title="Edit row"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deleteTestResult(test.id)}
                            className="p-1 rounded text-slate-400 hover:text-red-400 hover:bg-slate-800"
                            title="Delete test result"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </td>

                  </tr>
                );
              })}

              {filteredTests.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500 text-xs italic">
                    No lab test results found matching current search or filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
