export type Provenance = 'Patient Input' | 'Medical Report' | 'AI Generated';

export type TestStatus = 'LOW' | 'NORMAL' | 'HIGH' | 'CANNOT DETERMINE';

export type TestCategory = 
  | 'Hematology' 
  | 'Metabolic' 
  | 'Lipids' 
  | 'Endocrine' 
  | 'Renal' 
  | 'Hepatic' 
  | 'Cardiovascular'
  | 'Other';

export interface TestResult {
  id: string;
  testName: string;
  value: number | string;
  unit: string;
  referenceRange: string | null; // e.g. "70 - 99", "< 200", null
  status: TestStatus;
  date: string;
  observations: string;
  provenance: Provenance;
  confidence: number; // 0 - 100
  category: TestCategory;
  verifiedByHuman: boolean;
  reportId?: string;
  reportName?: string;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  sex: 'Male' | 'Female' | 'Other';
  symptoms: string[];
  existingConditions: string[];
  allergies: string[];
  currentMedications: string[];
  lastUpdated: string;
}

export interface MedicalReport {
  id: string;
  title: string;
  fileName: string;
  fileSize: string;
  uploadDate: string;
  reportDate: string;
  labName: string;
  extractedCount: number;
  status: 'Processed' | 'Processing' | 'Failed';
  rawText?: string;
  tests: TestResult[];
}

export interface ConflictItem {
  id: string;
  title: string;
  type: 'Allergy Discrepancy' | 'Condition vs Lab Conflict' | 'Medication Discrepancy' | 'Unreported Lab Finding';
  severity: 'High' | 'Medium' | 'Low';
  patientData: string;
  reportData: string;
  description: string;
  suggestedAction: string;
  resolved?: boolean;
}

export interface AISummaryData {
  patientId: string;
  generatedAt: string;
  summaryText: string;
  keyFindings: {
    category: string;
    finding: string;
    status: TestStatus;
    provenance: Provenance;
  }[];
  stabilityStatus: string;
  glossaryTerms: {
    term: string;
    definition: string;
  }[];
  disclaimer: string;
}

export type TimelineEventType = 
  | 'patient_update' 
  | 'report_uploaded' 
  | 'report_processed' 
  | 'record_extracted' 
  | 'record_updated' 
  | 'summary_generated';

export interface TimelineEvent {
  id: string;
  timestamp: string; // ISO string
  formattedDate: string; // e.g. "Sep 5, 2026, 12:45 PM"
  title: string;
  description: string;
  provenance: Provenance;
  type: TimelineEventType;
  patientId: string;
}
