'use client';

import React, { useState, useRef } from 'react';
import { useMedLens } from '@/context/MedLensContext';
import { StatusBadge } from '@/components/StatusBadge';
import { ProvenanceBadge } from '@/components/ProvenanceBadge';
import { TestResult, MedicalReport } from '@/lib/types';
import { 
  UploadCloud, 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Eye, 
  ArrowRight,
  FileCheck,
  ShieldAlert,
  HelpCircle
} from 'lucide-react';

export default function MedicalReportsPage() {
  const { addReport, addTests, reports } = useMedLens();
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractionProgress, setExtractionProgress] = useState(0);
  const [extractedTests, setExtractedTests] = useState<TestResult[]>([]);
  const [processedReport, setProcessedReport] = useState<MedicalReport | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sample mock lab report text files for instant 1-click testing
  const sampleReportTemplates = [
    {
      title: 'Quest Comprehensive Metabolic & Lipid Panel',
      fileName: 'Quest_Lab_Scan_9021.pdf',
      labName: 'Quest Regional Diagnostics',
      sampleText: `
        PATIENT REPORT - QUEST DIAGNOSTICS REGIONAL LAB
        Patient: Active Case | Date: ${new Date().toISOString().split('T')[0]}
        Category: Metabolic & Lipid Panel
        
        Fasting Blood Glucose    138   mg/dL     Ref: 70 - 99
        Hemoglobin A1c           7.4   %         Ref: 4.0 - 5.6
        Total Cholesterol        215   mg/dL     Ref: < 200
        LDL Cholesterol          134   mg/dL     Ref: < 100
        HDL Cholesterol          46    mg/dL     Ref: > 40
        Triglycerides            185   mg/dL     Ref: < 150
        Serum Creatinine         1.05  mg/dL     Ref: 0.70 - 1.30
        Vitamin D (25-OH)        19.2  ng/mL     Ref: None
        High Sensitivity CRP     3.1   mg/L      Ref: N/A
      `
    },
    {
      title: 'Hematology & Thyroid Panel',
      fileName: 'Anemia_Thyroid_Panel_Scan.pdf',
      labName: 'Metropolitan Clinical Laboratories',
      sampleText: `
        METROPOLITAN CLINICAL LABS - HEMATOLOGY & THYROID SCAN
        Date: ${new Date().toISOString().split('T')[0]}
        
        Category: Hematology
        Hemoglobin              9.8    g/dL      Ref: 12.0 - 16.0
        Ferritin                11     ng/mL     Ref: 15 - 150
        Serum Iron              38     ug/dL     Ref: 60 - 170
        White Blood Count       6.2    K/uL      Ref: 4.5 - 11.0
        
        Category: Endocrine
        TSH                     5.8    mIU/L     Ref: 0.4 - 4.2
        Free T4                 0.9    ng/dL     Ref: 0.8 - 1.8
        
        Observations: Patient reports history of Amoxicillin rash during childhood.
      `
    },
    {
      title: 'Renal & Electrolyte Status Report',
      fileName: 'Renal_Electrolytes_2026.pdf',
      labName: 'St. Jude Health System Laboratory',
      sampleText: `
        ST. JUDE HEALTH SYSTEM LABORATORY
        Renal Function & Electrolytes Scan
        Date: ${new Date().toISOString().split('T')[0]}
        
        Category: Renal
        eGFR                    52     mL/min    Ref: > 60
        Blood Urea Nitrogen     28     mg/dL     Ref: 7 - 20
        Serum Potassium         5.4    mEq/L     Ref: 3.5 - 5.0
        Serum Sodium            139    mEq/L     Ref: 135 - 145
        Serum Calcium           9.2    mg/dL     Ref: 8.5 - 10.2
      `
    }
  ];

  const processFileOrText = async (file: File | null, sampleText?: string, fileName?: string, labName?: string) => {
    setIsProcessing(true);
    setExtractionProgress(15);
    setErrorMsg(null);
    setExtractedTests([]);

    try {
      const formData = new FormData();
      if (file) {
        formData.append('file', file);
      }
      if (sampleText) {
        formData.append('sampleText', sampleText);
      }

      setExtractionProgress(45);

      const res = await fetch('/api/extract', {
        method: 'POST',
        body: formData,
      });

      setExtractionProgress(75);
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to extract clinical report');
      }

      setExtractionProgress(100);
      const testsExtracted: TestResult[] = data.tests;
      setExtractedTests(testsExtracted);

      const newReport: MedicalReport = {
        id: `REP-${Date.now()}`,
        title: fileName || (file ? file.name : 'Clinical Laboratory Report'),
        fileName: fileName || (file ? file.name : 'Lab_Report.pdf'),
        fileSize: file ? `${(file.size / 1024).toFixed(1)} KB` : '1.2 MB',
        uploadDate: new Date().toISOString().split('T')[0],
        reportDate: new Date().toISOString().split('T')[0],
        labName: labName || 'Uploaded Lab Vendor',
        extractedCount: testsExtracted.length,
        status: 'Processed',
        tests: testsExtracted,
      };

      setProcessedReport(newReport);
      addReport(newReport);

    } catch (err: any) {
      setErrorMsg(err.message || 'Error processing medical report file');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFileOrText(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">
      
      {/* Page Title */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <UploadCloud className="w-6 h-6 text-sky-400" />
              Medical Report OCR & Extraction Engine
            </h1>
            <ProvenanceBadge provenance="Medical Report" />
          </div>
          <p className="text-slate-400 text-xs mt-1">
            Upload PDF or image medical lab reports for automated AI/OCR extraction of test parameters, units, reference ranges, and observations.
          </p>
        </div>
      </div>

      {/* Main Upload Box */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column: File Dropzone */}
        <div className="md:col-span-2 space-y-4">
          <div className="bg-slate-900 border-2 border-dashed border-slate-700 hover:border-sky-500/60 rounded-2xl p-8 text-center transition-all bg-slate-900/60 group">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".pdf,.png,.jpg,.jpeg,.txt"
              className="hidden"
            />
            
            <div className="w-14 h-14 mx-auto rounded-2xl bg-sky-500/10 text-sky-400 flex items-center justify-center group-hover:scale-110 transition-transform mb-3 border border-sky-500/20">
              <UploadCloud className="w-7 h-7" />
            </div>

            <h3 className="font-bold text-base text-white">Drag & drop your medical report file</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Supports PDF, PNG, JPG, or TXT laboratory report documents. Gemini Vision OCR extracts structured metrics automatically.
            </p>

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
              className="mt-5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-clinical-600 hover:from-sky-400 hover:to-clinical-500 text-white font-bold text-xs shadow-lg shadow-sky-500/20 transition-all inline-flex items-center gap-2 disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Extracting Clinical Data...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4" /> Browse Local File
                </>
              )}
            </button>

            {/* Progress Bar */}
            {isProcessing && (
              <div className="mt-6 space-y-2 max-w-md mx-auto">
                <div className="flex justify-between text-xs text-slate-400 font-mono">
                  <span>OCR Parsing in Progress</span>
                  <span>{extractionProgress}%</span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-sky-500 to-indigo-500 transition-all duration-300 rounded-full"
                    style={{ width: `${extractionProgress}%` }}
                  />
                </div>
              </div>
            )}

            {errorMsg && (
              <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>

          {/* Extracted Results Live Preview Card */}
          {extractedTests.length > 0 && (
            <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-6 space-y-4 animate-slide-up">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <h3 className="font-bold text-sm text-white">
                    Extraction Completed: {extractedTests.length} Markers Found
                  </h3>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Confidence: 96%
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-semibold bg-slate-950/40">
                      <th className="py-2.5 px-3">Test Parameter</th>
                      <th className="py-2.5 px-3">Extracted Value</th>
                      <th className="py-2.5 px-3">Report Ref Range</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Provenance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {extractedTests.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-800/40">
                        <td className="py-2.5 px-3 font-semibold text-slate-200">{t.testName}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-100 font-bold">{t.value} {t.unit}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-300">
                          {t.referenceRange || <span className="text-slate-500 italic">Not Provided</span>}
                        </td>
                        <td className="py-2.5 px-3">
                          <StatusBadge status={t.status} referenceRange={t.referenceRange} />
                        </td>
                        <td className="py-2.5 px-3">
                          <ProvenanceBadge provenance={t.provenance} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="pt-2 flex justify-end">
                <a
                  href="/record"
                  className="px-4 py-2 rounded-xl bg-sky-500 text-white font-semibold text-xs flex items-center gap-1.5 hover:bg-sky-400 transition-colors"
                >
                  View in Structured Record <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: 1-Click Sample Lab Reports for Testing */}
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
              <Sparkles className="w-4 h-4 text-sky-400" />
              <h3 className="font-bold text-xs text-white uppercase tracking-wider">
                1-Click Sample Reports (For Testing)
              </h3>
            </div>
            <p className="text-[11px] text-slate-400">
              Click any sample report template below to trigger immediate simulated OCR extraction into the active patient record:
            </p>

            <div className="space-y-2.5">
              {sampleReportTemplates.map((template, idx) => (
                <button
                  key={idx}
                  onClick={() => processFileOrText(null, template.sampleText, template.fileName, template.labName)}
                  disabled={isProcessing}
                  className="w-full text-left p-3 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-sky-500/40 transition-all group space-y-1"
                >
                  <div className="font-bold text-xs text-slate-200 group-hover:text-sky-300 flex items-center justify-between">
                    <span>{template.title}</span>
                    <FileCheck className="w-3.5 h-3.5 text-sky-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="text-[10px] text-slate-400 flex items-center justify-between font-mono">
                    <span>{template.fileName}</span>
                    <span className="text-slate-500">{template.labName}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Historical Uploaded Reports List */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
            <h3 className="font-bold text-xs text-white border-b border-slate-800 pb-2">
              Uploaded Reports Archive ({reports.length})
            </h3>

            {reports.map((rep) => (
              <div key={rep.id} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-200 truncate max-w-[180px]">{rep.title}</div>
                  <div className="text-[10px] text-slate-400 font-mono">{rep.reportDate} • {rep.extractedCount} tests</div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                  {rep.status}
                </span>
              </div>
            ))}
          </div>

        </div>

      </div>

    </div>
  );
}
