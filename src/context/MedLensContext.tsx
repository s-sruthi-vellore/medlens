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
  patients: Patient[];
  patient: Patient;
  draftPatient: Patient | null;
  reports: MedicalReport[];
  tests: TestResult[];
  conflicts: ConflictItem[];
  aiSummary: AISummaryData | null;
  timelineEvents: TimelineEvent[];
  activePatientId: string;
  selectPatient: (patientId: string) => void;
  startNewPatient: () => void;
  cancelNewPatient: () => void;
  createPatient: (newPatient: Patient) => void;
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

export function formatTimelineDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

// Initial Sample Timelines per patient
const INITIAL_TIMELINE_EVENTS_PT1: TimelineEvent[] = [
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

const INITIAL_TIMELINE_EVENTS_PT2: TimelineEvent[] = [
  {
    id: 'tl-s1',
    timestamp: new Date(Date.now() - 3600000 * 1).toISOString(),
    formattedDate: formatTimelineDate(new Date(Date.now() - 3600000 * 1)),
    title: 'Patient Information Loaded',
    description: 'Loaded profile for Sarah Jenkins (Severe Fatigue, Cold Sensitivity)',
    provenance: 'Patient Input',
    type: 'patient_update',
    patientId: 'PT-33104'
  },
  {
    id: 'tl-s2',
    timestamp: new Date(Date.now() - 3600000 * 0.8).toISOString(),
    formattedDate: formatTimelineDate(new Date(Date.now() - 3600000 * 0.8)),
    title: 'Medical Report Processed',
    description: 'Sarah_Jenkins_Hematology_Panel.pdf processed with 2 extracted markers',
    provenance: 'Medical Report',
    type: 'report_processed',
    patientId: 'PT-33104'
  }
];

const INITIAL_TIMELINE_EVENTS_PT3: TimelineEvent[] = [
  {
    id: 'tl-m1',
    timestamp: new Date(Date.now() - 3600000 * 0.5).toISOString(),
    formattedDate: formatTimelineDate(new Date(Date.now() - 3600000 * 0.5)),
    title: 'Patient Profile Selected',
    description: 'Loaded profile for Marcus Vance (Renal Status)',
    provenance: 'Patient Input',
    type: 'patient_update',
    patientId: 'PT-51299'
  }
];

const SARAH_TESTS: TestResult[] = [
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

const MARCUS_TESTS: TestResult[] = [
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

export function MedLensProvider({ children }: { children: React.ReactNode }) {
  const [patients, setPatients] = useState<Patient[]>(SAMPLE_PATIENTS);
  const [activePatientId, setActivePatientId] = useState<string>('PT-89421');
  const [draftPatient, setDraftPatient] = useState<Patient | null>(null);

  // Maps for patient data: patientId -> items
  const [allReports, setAllReports] = useState<Record<string, MedicalReport[]>>({
    'PT-89421': SAMPLE_REPORTS,
    'PT-33104': [],
    'PT-51299': [],
  });

  const [allTests, setAllTests] = useState<Record<string, TestResult[]>>({
    'PT-89421': SAMPLE_TEST_RESULTS_PATIENT_1_CURRENT,
    'PT-33104': SARAH_TESTS,
    'PT-51299': MARCUS_TESTS,
  });

  const [allTimelineEvents, setAllTimelineEvents] = useState<Record<string, TimelineEvent[]>>({
    'PT-89421': INITIAL_TIMELINE_EVENTS_PT1,
    'PT-33104': INITIAL_TIMELINE_EVENTS_PT2,
    'PT-51299': INITIAL_TIMELINE_EVENTS_PT3,
  });

  const [conflicts, setConflicts] = useState<ConflictItem[]>([]);
  const [aiSummary, setAiSummary] = useState<AISummaryData | null>(null);

  // Load state from localStorage on mount if available
  useEffect(() => {
    try {
      const savedPatients = localStorage.getItem('medlens_patients');
      const savedActiveId = localStorage.getItem('medlens_active_id');
      const savedReports = localStorage.getItem('medlens_reports');
      const savedTests = localStorage.getItem('medlens_tests');
      const savedTimelines = localStorage.getItem('medlens_timelines');

      if (savedPatients) setPatients(JSON.parse(savedPatients));
      if (savedReports) setAllReports(JSON.parse(savedReports));
      if (savedTests) setAllTests(JSON.parse(savedTests));
      if (savedTimelines) setAllTimelineEvents(JSON.parse(savedTimelines));
      if (savedActiveId) setActivePatientId(savedActiveId);
    } catch (e) {
      console.warn('LocalStorage error on load:', e);
    }
  }, []);

  // Save state changes to localStorage
  const persistState = (
    newPatients?: Patient[],
    newActiveId?: string,
    newReports?: Record<string, MedicalReport[]>,
    newTests?: Record<string, TestResult[]>,
    newTimelines?: Record<string, TimelineEvent[]>
  ) => {
    try {
      if (newPatients) localStorage.setItem('medlens_patients', JSON.stringify(newPatients));
      if (newActiveId) localStorage.setItem('medlens_active_id', newActiveId);
      if (newReports) localStorage.setItem('medlens_reports', JSON.stringify(newReports));
      if (newTests) localStorage.setItem('medlens_tests', JSON.stringify(newTests));
      if (newTimelines) localStorage.setItem('medlens_timelines', JSON.stringify(newTimelines));
    } catch (e) {
      console.warn('LocalStorage error on save:', e);
    }
  };

  // Derive current active patient & details
  const currentPatient = draftPatient || patients.find(p => p.id === activePatientId) || patients[0] || SAMPLE_PATIENTS[0];
  const currentReports = allReports[currentPatient.id] || [];
  const currentTests = allTests[currentPatient.id] || [];
  const currentTimelineEvents = allTimelineEvents[currentPatient.id] || [];

  // Recalculate conflicts and summary whenever active patient or tests change
  useEffect(() => {
    if (!draftPatient) {
      const detected = detectConflicts(currentPatient, currentTests);
      setConflicts(detected);

      const summary = generateLocalAISummary(currentPatient, currentTests);
      setAiSummary(summary);
    }
  }, [currentPatient, currentTests, draftPatient]);

  const addTimelineEventForPatient = (
    targetPatientId: string,
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
      patientId: targetPatientId
    };

    setAllTimelineEvents(prev => {
      const existing = prev[targetPatientId] || [];
      const updated = {
        ...prev,
        [targetPatientId]: [newEvent, ...existing]
      };
      persistState(undefined, undefined, undefined, undefined, updated);
      return updated;
    });
  };

  const selectPatient = (patientId: string) => {
    setDraftPatient(null);
    setActivePatientId(patientId);
    persistState(undefined, patientId);
  };

  const startNewPatient = () => {
    const newId = `PT-${Math.floor(10000 + Math.random() * 90000)}`;
    const blankDraft: Patient = {
      id: newId,
      name: '',
      age: 30,
      sex: 'Male',
      symptoms: [],
      existingConditions: [],
      allergies: [],
      currentMedications: [],
      lastUpdated: new Date().toISOString().split('T')[0]
    };
    setDraftPatient(blankDraft);
  };

  const cancelNewPatient = () => {
    setDraftPatient(null);
  };

  const createPatient = (newPatient: Patient) => {
    // 1. Add to patients list
    const updatedPatients = [...patients, newPatient];
    setPatients(updatedPatients);

    // 2. Initialize reports and tests arrays
    const updatedReports = { ...allReports, [newPatient.id]: [] };
    const updatedTests = { ...allTests, [newPatient.id]: [] };
    setAllReports(updatedReports);
    setAllTests(updatedTests);

    // 3. Create initial "Patient Profile Created" timeline event ONLY NOW upon saving
    const now = new Date();
    const creationEvent: TimelineEvent = {
      id: `tl-created-${Date.now()}`,
      timestamp: now.toISOString(),
      formattedDate: formatTimelineDate(now),
      title: 'Patient Profile Created',
      description: `Patient profile created for ${newPatient.name} (${newPatient.id}). Age: ${newPatient.age}, Sex: ${newPatient.sex}. Symptoms: ${newPatient.symptoms.join(', ') || 'None reported'}.`,
      provenance: 'Patient Input',
      type: 'patient_update',
      patientId: newPatient.id
    };

    const updatedTimelines = {
      ...allTimelineEvents,
      [newPatient.id]: [creationEvent]
    };
    setAllTimelineEvents(updatedTimelines);

    // 4. Set active patient and reset draft
    setActivePatientId(newPatient.id);
    setDraftPatient(null);

    // 5. Persist to localStorage
    persistState(updatedPatients, newPatient.id, updatedReports, updatedTests, updatedTimelines);
  };

  const updatePatient = (updated: Partial<Patient>) => {
    setPatients(prev => {
      const updatedList = prev.map(p => {
        if (p.id === currentPatient.id) {
          const merged = {
            ...p,
            ...updated,
            lastUpdated: new Date().toISOString().split('T')[0],
          };

          // Log timeline event for update
          const symptomsStr = merged.symptoms.length > 0 ? `Symptoms: ${merged.symptoms.join(', ')}` : 'No symptoms';
          const condStr = merged.existingConditions.length > 0 ? `Conditions: ${merged.existingConditions.join(', ')}` : 'No conditions';
          
          addTimelineEventForPatient(
            merged.id,
            'Patient Information Updated',
            `${merged.name} (${merged.id}): ${symptomsStr} | ${condStr}`,
            'Patient Input',
            'patient_update'
          );

          return merged;
        }
        return p;
      });

      persistState(updatedList);
      return updatedList;
    });
  };

  const addReport = (report: MedicalReport) => {
    const pid = currentPatient.id;
    const updatedReports = {
      ...allReports,
      [pid]: [report, ...(allReports[pid] || [])]
    };
    setAllReports(updatedReports);

    addTimelineEventForPatient(
      pid,
      'Medical Report Uploaded',
      `File: ${report.fileName} (${report.fileSize}) from ${report.labName}`,
      'Medical Report',
      'report_uploaded'
    );

    if (report.tests && report.tests.length > 0) {
      addTests(report.tests);
      addTimelineEventForPatient(
        pid,
        'Report Processed & Extracted',
        `${report.tests.length} laboratory test values extracted with reference ranges`,
        'Medical Report',
        'report_processed'
      );
    }

    persistState(undefined, undefined, updatedReports);
  };

  const addTests = (newTests: TestResult[]) => {
    const pid = currentPatient.id;
    const updatedTests = {
      ...allTests,
      [pid]: [...newTests, ...(allTests[pid] || [])]
    };
    setAllTests(updatedTests);
    persistState(undefined, undefined, undefined, updatedTests);
  };

  const updateTestResult = (id: string, updated: Partial<TestResult>) => {
    const pid = currentPatient.id;
    const updatedTests = {
      ...allTests,
      [pid]: (allTests[pid] || []).map(t => {
        if (t.id === id) {
          const merged = { ...t, ...updated };
          if (updated.value !== undefined || updated.referenceRange !== undefined) {
            merged.status = evaluateTestStatus(merged.value, merged.referenceRange);
          }

          addTimelineEventForPatient(
            pid,
            'Structured Record Updated',
            `${merged.testName}: ${merged.value} ${merged.unit} (${merged.verifiedByHuman ? 'Verified by Clinician' : 'Edited'})`,
            'Medical Report',
            'record_updated'
          );

          return merged;
        }
        return t;
      })
    };

    setAllTests(updatedTests);
    persistState(undefined, undefined, undefined, updatedTests);
  };

  const deleteTestResult = (id: string) => {
    const pid = currentPatient.id;
    const found = (allTests[pid] || []).find(t => t.id === id);
    const updatedTests = {
      ...allTests,
      [pid]: (allTests[pid] || []).filter(t => t.id !== id)
    };

    setAllTests(updatedTests);
    if (found) {
      addTimelineEventForPatient(
        pid,
        'Structured Record Item Deleted',
        `Removed parameter ${found.testName} from active patient record`,
        'Medical Report',
        'record_updated'
      );
    }

    persistState(undefined, undefined, undefined, updatedTests);
  };

  const resolveConflict = (conflictId: string) => {
    setConflicts(prev => prev.map(c => {
      if (c.id === conflictId) {
        addTimelineEventForPatient(
          currentPatient.id,
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
    const summary = generateLocalAISummary(currentPatient, currentTests);
    setAiSummary(summary);

    addTimelineEventForPatient(
      currentPatient.id,
      'AI Summary Generated',
      'Patient-friendly summary created with clinical safety guardrails',
      'AI Generated',
      'summary_generated'
    );
  };

  const resetAll = () => {
    try {
      localStorage.clear();
    } catch (e) {}
    setPatients(SAMPLE_PATIENTS);
    setActivePatientId('PT-89421');
    setDraftPatient(null);
    setAllReports({
      'PT-89421': SAMPLE_REPORTS,
      'PT-33104': [],
      'PT-51299': [],
    });
    setAllTests({
      'PT-89421': SAMPLE_TEST_RESULTS_PATIENT_1_CURRENT,
      'PT-33104': SARAH_TESTS,
      'PT-51299': MARCUS_TESTS,
    });
    setAllTimelineEvents({
      'PT-89421': INITIAL_TIMELINE_EVENTS_PT1,
      'PT-33104': INITIAL_TIMELINE_EVENTS_PT2,
      'PT-51299': INITIAL_TIMELINE_EVENTS_PT3,
    });
  };

  return (
    <MedLensContext.Provider
      value={{
        patients,
        patient: currentPatient,
        draftPatient,
        reports: currentReports,
        tests: currentTests,
        conflicts,
        aiSummary,
        timelineEvents: currentTimelineEvents,
        activePatientId,
        selectPatient,
        startNewPatient,
        cancelNewPatient,
        createPatient,
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
