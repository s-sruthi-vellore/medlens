'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Patient, MedicalReport, TestResult, ConflictItem, AISummaryData, TimelineEvent, Provenance } from '@/lib/types';
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
  timelineEvents: TimelineEvent[];
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

function formatTimelineDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

const INITIAL_TIMELINE_EVENTS: TimelineEvent[] = [
  {
    id: 'tl-1',
    timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
    formattedDate: formatTimelineDate(new Date(Date.now() - 3600000 * 3)),
    title: 'Patient Information Recorded',
    description: 'Demographic profile, symptoms (Fatigue, Thirst), and Penicillin allergy recorded',
    provenance: 'Patient Input',
    type: 'patient_update',
    patientId: 'PT-89421'
  },
  {
    id: 'tl-2',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    formattedDate: formatTimelineDate(new Date(Date.now() - 3600000 * 2)),
    title: 'Medical Report Uploaded',
    description: 'Quest_Diagnostics_Comprehensive_Panel.pdf uploaded to patient record',
    provenance: 'Medical Report',
    type: 'report_uploaded',
    patientId: 'PT-89421'
  },
  {
    id: 'tl-3',
    timestamp: new Date(Date.now() - 3600000 * 1.8).toISOString(),
    formattedDate: formatTimelineDate(new Date(Date.now() - 3600000 * 1.8)),
    title: 'Medical Report Processed',
    description: '11 laboratory values extracted with reference ranges and status evaluated',
    provenance: 'Medical Report',
    type: 'report_processed',
    patientId: 'PT-89421'
  },
  {
    id: 'tl-4',
    timestamp: new Date(Date.now() - 3600000 * 1.2).toISOString(),
    formattedDate: formatTimelineDate(new Date(Date.now() - 3600000 * 1.2)),
    title: 'Structured Record Verified',
    description: 'Clinician verified Fasting Blood Glucose (138 mg/dL) & HbA1c (7.4%) values',
    provenance: 'Medical Report',
    type: 'record_updated',
    patientId: 'PT-89421'
  },
  {
    id: 'tl-5',
    timestamp: new Date(Date.now() - 3600000 * 0.5).toISOString(),
    formattedDate: formatTimelineDate(new Date(Date.now() - 3600000 * 0.5)),
    title: 'AI Summary Generated',
    description: 'Patient-friendly summary created with clinical safety guardrails',
    provenance: 'AI Generated',
    type: 'summary_generated',
    patientId: 'PT-89421'
  }
];

export function MedLensProvider({ children }: { children: React.ReactNode }) {
  const [activePatientId, setActivePatientId] = useState<string>('PT-89421');
  const [patient, setPatient] = useState<Patient>(SAMPLE_PATIENTS[0]);
  const [reports, setReports] = useState<MedicalReport[]>(SAMPLE_REPORTS);
  const [tests, setTests] = useState<TestResult[]>(SAMPLE_TEST_RESULTS_PATIENT_1_CURRENT);
  const [conflicts, setConflicts] = useState<ConflictItem[]>([]);
  const [aiSummary, setAiSummary] = useState<AISummaryData | null>(null);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>(INITIAL_TIMELINE_EVENTS);

  // Recalculate conflicts and summary whenever patient or tests change
  useEffect(() => {
    const detected = detectConflicts(patient, tests);
    setConflicts(detected);

    const summary = generateLocalAISummary(patient, tests);
    setAiSummary(summary);
  }, [patient, tests]);

  const addTimelineEvent = (
    title: string,
    description: string,
    provenance: Provenance,
    type: TimelineEvent['type']
  ) => {
    const now = new Date();
    const newEvent: TimelineEvent = {
      id: `tl-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: now.toISOString(),
      formattedDate: formatTimelineDate(now),
      title,
      description,
      provenance,
      type,
      patientId: patient.id
    };
    setTimelineEvents(prev => [newEvent, ...prev]);
  };

  const selectPatient = (patientId: string) => {
    const found = SAMPLE_PATIENTS.find(p => p.id === patientId);
    if (found) {
      setActivePatientId(patientId);
      setPatient(found);
      if (patientId === 'PT-89421') {
        setReports(SAMPLE_REPORTS);
        setTests(SAMPLE_TEST_RESULTS_PATIENT_1_CURRENT);
        setTimelineEvents(INITIAL_TIMELINE_EVENTS);
      } else if (patientId === 'PT-33104') {
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
          }
        ];
        setTests(sarahTests);
        setTimelineEvents([
          {
            id: 'tl-s1',
            timestamp: new Date().toISOString(),
            formattedDate: formatTimelineDate(new Date()),
            title: 'Patient Information Loaded',
            description: 'Loaded profile for Sarah Jenkins (Severe Fatigue, Cold Sensitivity)',
            provenance: 'Patient Input',
            type: 'patient_update',
            patientId: 'PT-33104'
          },
          {
            id: 'tl-s2',
            timestamp: new Date().toISOString(),
            formattedDate: formatTimelineDate(new Date()),
            title: 'Medical Report Processed',
            description: 'Sarah_Jenkins_Hematology_Panel.pdf processed with 2 extracted markers',
            provenance: 'Medical Report',
            type: 'report_processed',
            patientId: 'PT-33104'
          }
        ]);
      } else {
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
          }
        ];
        setTests(marcusTests);
        setTimelineEvents([
          {
            id: 'tl-m1',
            timestamp: new Date().toISOString(),
            formattedDate: formatTimelineDate(new Date()),
            title: 'Patient Profile Selected',
            description: 'Loaded profile for Marcus Vance (Renal Status)',
            provenance: 'Patient Input',
            type: 'patient_update',
            patientId: 'PT-51299'
          }
        ]);
      }
    }
  };

  const updatePatient = (updated: Partial<Patient>) => {
    setPatient(prev => {
      const merged = {
        ...prev,
        ...updated,
        lastUpdated: new Date().toISOString().split('T')[0],
      };
      
      // Log timeline event automatically
      const symptomsStr = merged.symptoms.length > 0 ? `Symptoms: ${merged.symptoms.join(', ')}` : 'No symptoms';
      const condStr = merged.existingConditions.length > 0 ? `Conditions: ${merged.existingConditions.join(', ')}` : 'No conditions';
      
      addTimelineEvent(
        'Patient Information Updated',
        `${merged.name} (${merged.id}): ${symptomsStr} | ${condStr}`,
        'Patient Input',
        'patient_update'
      );

      return merged;
    });
  };

  const addReport = (report: MedicalReport) => {
    setReports(prev => [report, ...prev]);

    // Log timeline event for Upload
    addTimelineEvent(
      'Medical Report Uploaded',
      `File: ${report.fileName} (${report.fileSize}) from ${report.labName}`,
      'Medical Report',
      'report_uploaded'
    );

    if (report.tests && report.tests.length > 0) {
      addTests(report.tests);
      
      // Log timeline event for Processing & Extraction
      addTimelineEvent(
        'Report Processed & Extracted',
        `${report.tests.length} laboratory test values extracted with reference ranges`,
        'Medical Report',
        'report_processed'
      );
    }
  };

  const addTests = (newTests: TestResult[]) => {
    setTests(prev => [...newTests, ...prev]);
  };

  const updateTestResult = (id: string, updated: Partial<TestResult>) => {
    setTests(prev => prev.map(t => {
      if (t.id === id) {
        const merged = { ...t, ...updated };
        if (updated.value !== undefined || updated.referenceRange !== undefined) {
          merged.status = evaluateTestStatus(merged.value, merged.referenceRange);
        }

        // Log timeline event for Record Update
        addTimelineEvent(
          'Structured Record Updated',
          `${merged.testName}: ${merged.value} ${merged.unit} (${merged.verifiedByHuman ? 'Verified by Clinician' : 'Edited'})`,
          'Medical Report',
          'record_updated'
        );

        return merged;
      }
      return t;
    }));
  };

  const deleteTestResult = (id: string) => {
    const found = tests.find(t => t.id === id);
    setTests(prev => prev.filter(t => t.id !== id));
    if (found) {
      addTimelineEvent(
        'Structured Record Item Deleted',
        `Removed parameter ${found.testName} from active patient record`,
        'Medical Report',
        'record_updated'
      );
    }
  };

  const resolveConflict = (conflictId: string) => {
    setConflicts(prev => prev.map(c => {
      if (c.id === conflictId) {
        addTimelineEvent(
          'Clinical Conflict Reconciled',
          `Reconciled discrepancy: ${c.title}`,
          'Patient Input',
          'patient_update'
        );
        return { ...c, resolved: true };
      }
      return c;
    }));
  };

  const loadSampleData = (index: number = 0) => {
    const samplePatient = SAMPLE_PATIENTS[index % SAMPLE_PATIENTS.length];
    selectPatient(samplePatient.id);
  };

  const refreshAISummary = () => {
    const summary = generateLocalAISummary(patient, tests);
    setAiSummary(summary);

    // Log timeline event for AI Summary Generation
    addTimelineEvent(
      'AI Summary Generated',
      'Patient-friendly summary created with clinical safety guardrails',
      'AI Generated',
      'summary_generated'
    );
  };

  const resetAll = () => {
    const newId = `PT-${Math.floor(10000 + Math.random() * 90000)}`;
    setPatient({
      id: newId,
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
    setTimelineEvents([
      {
        id: `tl-reset-${Date.now()}`,
        timestamp: new Date().toISOString(),
        formattedDate: formatTimelineDate(new Date()),
        title: 'New Patient Record Created',
        description: `Initialized empty record for ${newId}`,
        provenance: 'Patient Input',
        type: 'patient_update',
        patientId: newId
      }
    ]);
  };

  return (
    <MedLensContext.Provider
      value={{
        patient,
        reports,
        tests,
        conflicts,
        aiSummary,
        timelineEvents,
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
