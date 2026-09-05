'use client';

import React, { useState } from 'react';
import { useMedLens } from '@/context/MedLensContext';
import { StatusBadge } from '@/components/StatusBadge';
import { ProvenanceBadge } from '@/components/ProvenanceBadge';
import { 
  GitCompare, 
  TrendingUp, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownRight, 
  Minus,
  Sparkles,
  BarChart2
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';

export default function ComparisonPage() {
  const { tests, patient, reports } = useMedLens();
  const [selectedMetric, setSelectedMetric] = useState<string>('Fasting Blood Glucose');

  // Multi-date historical trend data construction
  const trendData = [
    { date: '2026-03-10', 'Fasting Blood Glucose': 122, 'HbA1c': 6.8, 'Total Cholesterol': 198 },
    { date: '2026-06-15', 'Fasting Blood Glucose': 130, 'HbA1c': 7.1, 'Total Cholesterol': 208 },
    { date: '2026-09-02', 'Fasting Blood Glucose': 138, 'HbA1c': 7.4, 'Total Cholesterol': 215 },
  ];

  // Group tests by testName for side-by-side comparison table
  const testNames = Array.from(new Set(tests.map(t => t.testName)));

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fade-in">
      
      {/* Title */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <GitCompare className="w-6 h-6 text-sky-400" />
              Medical Report Comparison & Lab Trends
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
              Multi-Report Matrix
            </span>
          </div>
          <p className="text-slate-400 text-xs mt-1">
            Track laboratory metrics over time across historical reports to identify clinical progression or therapy response.
          </p>
        </div>
      </div>

      {/* Interactive Trend Chart Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-sky-400" />
            <h2 className="font-bold text-sm text-white">Lab Parameter Timeline Progression</h2>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Parameter:</span>
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white font-medium focus:outline-none focus:border-sky-500"
            >
              <option value="Fasting Blood Glucose">Fasting Blood Glucose (mg/dL)</option>
              <option value="HbA1c">Hemoglobin A1c (%)</option>
              <option value="Total Cholesterol">Total Cholesterol (mg/dL)</option>
            </select>
          </div>
        </div>

        {/* Recharts Line Chart Container */}
        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 12 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 12 }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                itemStyle={{ color: '#38bdf8' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Line 
                type="monotone" 
                dataKey={selectedMetric} 
                stroke="#38bdf8" 
                strokeWidth={3} 
                dot={{ r: 6, fill: '#0284c7' }} 
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Side-by-Side Lab Values Comparison Matrix */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
        <h2 className="font-bold text-sm text-white flex items-center gap-2 border-b border-slate-800 pb-3">
          <BarChart2 className="w-5 h-5 text-indigo-400" />
          Side-by-Side Historical Lab Value Comparison
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold bg-slate-950/60">
                <th className="py-3 px-3">Test Parameter</th>
                <th className="py-3 px-3">Report Reference Range</th>
                <th className="py-3 px-3">Spring Checkup (2026-03-10)</th>
                <th className="py-3 px-3">Current Report (2026-09-02)</th>
                <th className="py-3 px-3">Net Clinical Change</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              <tr className="hover:bg-slate-800/40">
                <td className="py-3 px-3 font-bold text-slate-200">Fasting Blood Glucose</td>
                <td className="py-3 px-3 font-mono text-slate-300">70 - 99 mg/dL</td>
                <td className="py-3 px-3 font-mono text-slate-300">122 mg/dL <StatusBadge status="HIGH" /></td>
                <td className="py-3 px-3 font-mono text-slate-100 font-bold">138 mg/dL <StatusBadge status="HIGH" /></td>
                <td className="py-3 px-3 text-red-400 font-semibold flex items-center gap-1">
                  <ArrowUpRight className="w-4 h-4 text-red-400" /> +16 mg/dL (Elevated)
                </td>
              </tr>

              <tr className="hover:bg-slate-800/40">
                <td className="py-3 px-3 font-bold text-slate-200">Hemoglobin A1c (HbA1c)</td>
                <td className="py-3 px-3 font-mono text-slate-300">4.0 - 5.6 %</td>
                <td className="py-3 px-3 font-mono text-slate-300">6.8 % <StatusBadge status="HIGH" /></td>
                <td className="py-3 px-3 font-mono text-slate-100 font-bold">7.4 % <StatusBadge status="HIGH" /></td>
                <td className="py-3 px-3 text-red-400 font-semibold flex items-center gap-1">
                  <ArrowUpRight className="w-4 h-4 text-red-400" /> +0.6 % (Increased)
                </td>
              </tr>

              <tr className="hover:bg-slate-800/40">
                <td className="py-3 px-3 font-bold text-slate-200">Total Cholesterol</td>
                <td className="py-3 px-3 font-mono text-slate-300">&lt; 200 mg/dL</td>
                <td className="py-3 px-3 font-mono text-slate-300">198 mg/dL <StatusBadge status="NORMAL" /></td>
                <td className="py-3 px-3 font-mono text-slate-100 font-bold">215 mg/dL <StatusBadge status="HIGH" /></td>
                <td className="py-3 px-3 text-amber-400 font-semibold flex items-center gap-1">
                  <ArrowUpRight className="w-4 h-4 text-amber-400" /> +17 mg/dL (Shifted High)
                </td>
              </tr>

              <tr className="hover:bg-slate-800/40">
                <td className="py-3 px-3 font-bold text-slate-200">Serum Creatinine</td>
                <td className="py-3 px-3 font-mono text-slate-300">0.70 - 1.30 mg/dL</td>
                <td className="py-3 px-3 font-mono text-slate-300">1.02 mg/dL <StatusBadge status="NORMAL" /></td>
                <td className="py-3 px-3 font-mono text-slate-100 font-bold">1.05 mg/dL <StatusBadge status="NORMAL" /></td>
                <td className="py-3 px-3 text-emerald-400 font-semibold flex items-center gap-1">
                  <Minus className="w-4 h-4 text-emerald-400" /> Stable (+0.03 mg/dL)
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
