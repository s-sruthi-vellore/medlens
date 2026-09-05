'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Patient, MedicalReport, TestResult, ConflictItem, AISummaryData } from '@/lib/types';
import { 
  SAMPLE_PATIENTS, 
  SAMPLE_REPORTS, 
  SAMPLE_TEST_RESULTS_PATIENT_1_CURRENT 
} from '@/lib/sampleData';
import { detectConflicts, generateLocalAISummary, evaluateTestStatus } from '@/lib/evaluator';

interface MedLensContextType {
  patient: Patient;
  reports: MedicalReport[];
  tests: TestResult[];
  conflicts: ConflictItem[];
  aiSummary: AISummaryData | null;
  activePatientId: string;
  selectPatient: (patientId: string) => void;
  updatePatient: (updated: Partial<Patient>) => void;
  addReport: (report: MedicalReport) => void;
  addTests: (newTests: TestResult[]) => void;
  updateTestResult: (id: string, updated: Partial<TestResult>) => void;
  deleteTestResult: (id: string) => void;
  resolveConflict: (conflictId: string) => void;
  loadSampleData: (index?: number) => void;
  refreshAISummary: () => void;
  resetAll: () => void;
}

const MedLensContext = createContext<MedLensContextType | undefined>(undefined);

export function MedLensProvider({ children }: { children: React.ReactNode }) {
  const [activePatientId, setActivePatientId] = useState<string>('PT-89421');
  const [patient, setPatient] = useState<Patient>(SAMPLE_PATIENTS[0]);
  const [reports, setReports] = useState<MedicalReport[]>(SAMPLE_REPORTS);
  const [tests, setTests] = useState<TestResult[]>(SAMPLE_TEST_RESULTS_PATIENT_1_CURRENT);
  const [conflicts, setConflicts] = useState<ConflictItem[]>([]);
  const [aiSummary, setAiSummary] = useState<AISummaryData | null>(null);

  // Recalculate conflicts and summary whenever patient or tests change
  useEffect(() => {
    const detected = detectConflicts(patient, tests);
    setConflicts(detected);

    const summary = generateLocalAISummary(patient, tests);
    setAiSummary(summary);
  }, [patient, tests]);

  const selectPatient = (patientId: string) => {
    const found = SAMPLE_PATIENTS.find(p => p.id === patientId);
    if (found) {
      setActivePatientId(patientId);
      setPatient(found);
      if (patientId === 'PT-89421') {
        setReports(SAMPLE_REPORTS);
        setTests(SAMPLE_TEST_RESULTS_PATIENT_1_CURRENT);
      } else if (patientId === 'PT-33104') {
        // Sarah Jenkins sample
        setReports([]);
        const sarahTests: TestResult[] = [
          {
            id: 'tr-s1',
            testName: 'Hemoglobin',
            value: 9.8,
            unit: 'g/dL',
            referenceRange: '12.0 - 16.0',
            status: evaluateTestStatus(9.8, '12.0 - 16.0'),
            date: '2026-09-04',
            observations: 'Note: Patient reports history of Amoxicillin rash during childhood.',
            provenance: 'Medical Report',
            confidence: 96,
            category: 'Hematology',
            verifiedByHuman: true,
            reportId: 'REP-SARAH-01',
            reportName: 'Sarah_Jenkins_Hematology_Panel.pdf'
          },
          {
            id: 'tr-s2',
            testName: 'Ferritin',
            value: 11,
            unit: 'ng/mL',
            referenceRange: '15 - 150',
            status: evaluateTestStatus(11, '15 - 150'),
            date: '2026-09-04',
            observations: 'Iron storage depleted.',
            provenance: 'Medical Report',
            confidence: 94,
            category: 'Hematology',
            verifiedByHuman: true,
            reportId: 'REP-SARAH-01',
            reportName: 'Sarah_Jenkins_Hematology_Panel.pdf'
          },
          {
            id: 'tr-s3',
            testName: 'TSH',
            value: 5.8,
            unit: 'mIU/L',
            referenceRange: '0.4 - 4.2',
            status: evaluateTestStatus(5.8, '0.4 - 4.2'),
            date: '2026-09-04',
            observations: 'Elevated TSH noted.',
            provenance: 'Medical Report',
            confidence: 97,
            category: 'Endocrine',
            verifiedByHuman: true,
            reportId: 'REP-SARAH-01',
            reportName: 'Sarah_Jenkins_Hematology_Panel.pdf'
          }
        ];
        setTests(sarahTests);
      } else {
        // Marcus Vance sample
        setReports([]);
        const marcusTests: TestResult[] = [
          {
            id: 'tr-m1',
            testName: 'eGFR',
            value: 52,
            unit: 'mL/min/1.73m2',
            referenceRange: '> 60',
            status: evaluateTestStatus(52, '> 60'),
            date: '2026-08-28',
            observations: 'Estimated glomerular filtration rate low.',
            provenance: 'Medical Report',
            confidence: 97,
            category: 'Renal',
            verifiedByHuman: true,
          },
          {
            id: 'tr-m2',
            testName: 'Serum Potassium',
            value: 5.4,
            unit: 'mEq/L',
            referenceRange: '3.5 - 5.0',
            status: evaluateTestStatus(5.4, '3.5 - 5.0'),
            date: '2026-08-28',
            observations: 'Slightly hyperkalemic.',
            provenance: 'Medical Report',
            confidence: 99,
            category: 'Metabolic',
            verifiedByHuman: true,
          }
        ];
        setTests(marcusTests);
      }
    }
  };

  const updatePatient = (updated: Partial<Patient>) => {
    setPatient(prev => ({
      ...prev,
      ...updated,
      lastUpdated: new Date().toISOString().split('T')[0],
    }));
  };

  const addReport = (report: MedicalReport) => {
    setReports(prev => [report, ...prev]);
    if (report.tests && report.tests.length > 0) {
      addTests(report.tests);
    }
  };

  const addTests = (newTests: TestResult[]) => {
    setTests(prev => [...newTests, ...prev]);
  };

  const updateTestResult = (id: string, updated: Partial<TestResult>) => {
    setTests(prev => prev.map(t => {
      if (t.id === id) {
        const merged = { ...t, ...updated };
        // If referenceRange or value was edited, re-evaluate status strictly!
        if (updated.value !== undefined || updated.referenceRange !== undefined) {
          merged.status = evaluateTestStatus(merged.value, merged.referenceRange);
        }
        return merged;
      }
      return t;
    }));
  };

  const deleteTestResult = (id: string) => {
    setTests(prev => prev.filter(t => t.id !== id));
  };

  const resolveConflict = (conflictId: string) => {
    setConflicts(prev => prev.map(c => c.id === conflictId ? { ...c, resolved: true } : c));
  };

  const loadSampleData = (index: number = 0) => {
    const samplePatient = SAMPLE_PATIENTS[index % SAMPLE_PATIENTS.length];
    selectPatient(samplePatient.id);
  };

  const refreshAISummary = () => {
    const summary = generateLocalAISummary(patient, tests);
    setAiSummary(summary);
  };

  const resetAll = () => {
    setPatient({
      id: `PT-${Math.floor(10000 + Math.random() * 90000)}`,
      name: 'New Patient',
      age: 40,
      sex: 'Male',
      symptoms: [],
      existingConditions: [],
      allergies: [],
      currentMedications: [],
      lastUpdated: new Date().toISOString().split('T')[0]
    });
    setReports([]);
    setTests([]);
    setConflicts([]);
    setAiSummary(null);
  };

  return (
    <MedLensContext.Provider
      value={{
        patient,
        reports,
        tests,
        conflicts,
        aiSummary,
        activePatientId,
        selectPatient,
        updatePatient,
        addReport,
        addTests,
        updateTestResult,
        deleteTestResult,
        resolveConflict,
        loadSampleData,
        refreshAISummary,
        resetAll,
      }}
    >
      {children}
    </MedLensContext.Provider>
  );
}

export function useMedLens() {
  const context = useContext(MedLensContext);
  if (!context) {
    throw new Error('useMedLens must be used within a MedLensProvider');
  }
  return context;
}
