import { TestStatus, TestResult, Patient, ConflictItem, AISummaryData } from './types';

/**
 * STRICT REFERENCE RANGE EVALUATOR
 * Requirement #3: Determine status ONLY from reference ranges present in the uploaded report.
 * NEVER INVENT reference ranges! If no reference range is in the report, return 'CANNOT DETERMINE'.
 */
export function evaluateTestStatus(valueStr: string | number, referenceRangeStr: string | null | undefined): TestStatus {
  // Rule 1: If no reference range present in report -> CANNOT DETERMINE
  if (!referenceRangeStr || referenceRangeStr.trim() === '' || referenceRangeStr.toLowerCase() === 'n/a' || referenceRangeStr.toLowerCase() === 'none') {
    return 'CANNOT DETERMINE';
  }

  // Parse numerical value
  const numValue = typeof valueStr === 'number' ? valueStr : parseFloat(String(valueStr).replace(/[^0-9.-]/g, ''));
  if (isNaN(numValue)) {
    return 'CANNOT DETERMINE';
  }

  const range = referenceRangeStr.trim();

  // Pattern 1: Min - Max (e.g., "70 - 99", "3.5-5.0", "12.0 - 16.0")
  const rangeMatch = range.match(/^([0-9.]+)\s*[-–—]\s*([0-9.]+)$/);
  if (rangeMatch) {
    const min = parseFloat(rangeMatch[1]);
    const max = parseFloat(rangeMatch[2]);
    if (!isNaN(min) && !isNaN(max)) {
      if (numValue < min) return 'LOW';
      if (numValue > max) return 'HIGH';
      return 'NORMAL';
    }
  }

  // Pattern 2: Less than < X (e.g., "< 200", "<100")
  const ltMatch = range.match(/^<\s*([0-9.]+)$/);
  if (ltMatch) {
    const max = parseFloat(ltMatch[1]);
    if (!isNaN(max)) {
      return numValue >= max ? 'HIGH' : 'NORMAL';
    }
  }

  // Pattern 3: Greater than > X (e.g., "> 60", ">40")
  const gtMatch = range.match(/^>\s*([0-9.]+)$/);
  if (gtMatch) {
    const min = parseFloat(gtMatch[1]);
    if (!isNaN(min)) {
      return numValue <= min ? 'LOW' : 'NORMAL';
    }
  }

  // Pattern 4: <= X
  const lteMatch = range.match(/^<=\s*([0-9.]+)$/);
  if (lteMatch) {
    const max = parseFloat(lteMatch[1]);
    if (!isNaN(max)) {
      return numValue > max ? 'HIGH' : 'NORMAL';
    }
  }

  // Pattern 5: >= X
  const gteMatch = range.match(/^>=\s*([0-9.]+)$/);
  if (gteMatch) {
    const min = parseFloat(gteMatch[1]);
    if (!isNaN(min)) {
      return numValue < min ? 'LOW' : 'NORMAL';
    }
  }

  // If pattern matching fails, return CANNOT DETERMINE rather than guessing
  return 'CANNOT DETERMINE';
}

/**
 * INCONSISTENCY & CONFLICT DETECTOR
 * Detects discrepancies between self-reported patient info and lab report findings.
 */
export function detectConflicts(patient: Patient, tests: TestResult[]): ConflictItem[] {
  const conflicts: ConflictItem[] = [];

  // Check 1: High Glucose / HbA1c without self-reported Diabetes
  const glucoseTest = tests.find(t => t.testName.toLowerCase().includes('glucose') || t.testName.toLowerCase().includes('hba1c'));
  if (glucoseTest && glucoseTest.status === 'HIGH') {
    const hasDiabetesCondition = patient.existingConditions.some(c => 
      c.toLowerCase().includes('diabet') || c.toLowerCase().includes('hyperglycemia')
    );
    if (!hasDiabetesCondition) {
      conflicts.push({
        id: `conf-glu-${Date.now()}`,
        title: 'Elevated Glucose / HbA1c Without Listed Condition',
        type: 'Condition vs Lab Conflict',
        severity: 'High',
        patientData: patient.existingConditions.length ? patient.existingConditions.join(', ') : 'No chronic conditions listed',
        reportData: `${glucoseTest.testName}: ${glucoseTest.value} ${glucoseTest.unit} (Status: HIGH, Ref: ${glucoseTest.referenceRange || 'N/A'})`,
        description: 'Lab results show elevated glycemic markers, but patient history does not list pre-diabetes or diabetes mellitus.',
        suggestedAction: 'Clinician should review for potential undiagnosed glycemic dysregulation.',
        resolved: false
      });
    }
  }

  // Check 2: Low Hemoglobin/RBC without Anemia history
  const hgbTest = tests.find(t => t.testName.toLowerCase().includes('hemoglobin') || t.testName.toLowerCase().includes('hgb'));
  if (hgbTest && hgbTest.status === 'LOW') {
    const hasAnemia = patient.existingConditions.some(c => c.toLowerCase().includes('anemia'));
    if (!hasAnemia) {
      conflicts.push({
        id: `conf-hgb-${Date.now()}`,
        title: 'Low Hemoglobin Without Listed Anemia History',
        type: 'Condition vs Lab Conflict',
        severity: 'Medium',
        patientData: patient.existingConditions.length ? patient.existingConditions.join(', ') : 'No conditions listed',
        reportData: `${hgbTest.testName}: ${hgbTest.value} ${hgbTest.unit} (Status: LOW, Ref: ${hgbTest.referenceRange || 'N/A'})`,
        description: 'Hemoglobin level is below normal range reported by lab, but patient profile does not document anemia.',
        suggestedAction: 'Verify iron studies or check for unreported fatigue/blood loss symptoms.',
        resolved: false
      });
    }
  }

  // Check 3: Allergy Discrepancy (e.g. self-reported NKDA vs report observations)
  const reportObservationWithAllergy = tests.find(t => t.observations.toLowerCase().includes('allergy') || t.observations.toLowerCase().includes('sensitive'));
  if (reportObservationWithAllergy) {
    const patientAllergiesStr = patient.allergies.join(', ').toLowerCase();
    if (patientAllergiesStr.includes('none') || patientAllergiesStr.includes('nkda') || patient.allergies.length === 0) {
      conflicts.push({
        id: `conf-alg-${Date.now()}`,
        title: 'Potential Unlisted Sensitivity in Report Notes',
        type: 'Allergy Discrepancy',
        severity: 'High',
        patientData: patient.allergies.length ? patient.allergies.join(', ') : 'No Known Drug Allergies (NKDA)',
        reportData: `Observation Note: "${reportObservationWithAllergy.observations}"`,
        description: 'Lab report observations reference potential sensitivity/allergy notes, but patient self-reports No Known Allergies.',
        suggestedAction: 'Confirm allergy status directly with patient before issuing prescription.',
        resolved: false
      });
    }
  }

  // Check 4: Thyroid Discrepancy (High TSH without Thyroid condition)
  const tshTest = tests.find(t => t.testName.toUpperCase() === 'TSH' || t.testName.toLowerCase().includes('thyroid stimulating'));
  if (tshTest && (tshTest.status === 'HIGH' || tshTest.status === 'LOW')) {
    const hasThyroid = patient.existingConditions.some(c => c.toLowerCase().includes('thyroid') || c.toLowerCase().includes('hashimoto') || c.toLowerCase().includes('grave'));
    if (!hasThyroid) {
      conflicts.push({
        id: `conf-tsh-${Date.now()}`,
        title: 'Abnormal TSH Level Without Documented Thyroid Condition',
        type: 'Condition vs Lab Conflict',
        severity: 'Medium',
        patientData: patient.existingConditions.join(', ') || 'No thyroid condition listed',
        reportData: `TSH: ${tshTest.value} ${tshTest.unit} (Status: ${tshTest.status}, Ref: ${tshTest.referenceRange || 'N/A'})`,
        description: 'TSH is outside lab reference range, but thyroid disease is not documented in patient medical history.',
        suggestedAction: 'Consider evaluating thyroid antibody panel and clinical symptoms.',
        resolved: false
      });
    }
  }

  return conflicts;
}

/**
 * PATIENT SUMMARY SAFETY ENGINE
 * Ensures summary contains NO diagnosis, NO treatment plans, NO dosage recommendations.
 */
export const MEDICAL_DISCLAIMER_TEXT = 
  "SAFETY & PRIVACY DISCLAIMER: MedLens is an AI-powered clinical data organizing tool intended solely for informational and educational workflow assistance. MedLens DOES NOT provide medical diagnoses, treatment recommendations, or medication dosages. All AI-generated outputs must be reviewed and verified by a qualified healthcare professional before making any clinical decisions.";

export function generateLocalAISummary(patient: Patient, tests: TestResult[]): AISummaryData {
  const highTests = tests.filter(t => t.status === 'HIGH');
  const lowTests = tests.filter(t => t.status === 'LOW');
  const undeterTests = tests.filter(t => t.status === 'CANNOT DETERMINE');
  const normalTests = tests.filter(t => t.status === 'NORMAL');

  let summaryText = `This report summary consolidates ${tests.length} extracted laboratory findings for patient ${patient.name} (${patient.id}, ${patient.age}y ${patient.sex}). `;
  
  if (highTests.length === 0 && lowTests.length === 0) {
    summaryText += `All lab parameters with reference ranges provided in the report were within expected normal limits. `;
  } else {
    summaryText += `Out of the evaluated test results, ${normalTests.length} fall within report reference ranges, while ${highTests.length} markers are elevated and ${lowTests.length} markers are lower than reference ranges. `;
  }

  if (undeterTests.length > 0) {
    summaryText += `Note: ${undeterTests.length} tests could not have status determined because the uploaded laboratory report did not specify reference ranges for those items. `;
  }

  if (patient.symptoms.length > 0) {
    summaryText += `Self-reported symptoms include: ${patient.symptoms.join(', ')}. `;
  }

  const keyFindings = tests.map(t => ({
    category: t.category,
    finding: `${t.testName}: ${t.value} ${t.unit} (Ref Range: ${t.referenceRange || 'Not Provided'})`,
    status: t.status,
    provenance: t.provenance,
  }));

  const glossaryTerms = [
    { term: 'Reference Range', definition: 'The set of values established by the testing laboratory for a normal healthy individual.' },
    { term: 'CANNOT DETERMINE', definition: 'Status assigned when the uploaded report omits reference range data, preventing automated comparison.' },
    { term: 'Provenance', definition: 'The documented origin of clinical data (Patient Input vs Medical Report vs AI Generated).' },
    { term: 'HbA1c', definition: 'A measurement of average blood glucose levels over the past 2 to 3 months.' },
    { term: 'eGFR', definition: 'Estimated Glomerular Filtration Rate, a key calculation measuring kidney function.' }
  ];

  return {
    patientId: patient.id,
    generatedAt: new Date().toISOString(),
    summaryText: summaryText.trim(),
    keyFindings,
    stabilityStatus: highTests.length + lowTests.length > 0 
      ? `Requires Review: ${highTests.length + lowTests.length} lab values outside report reference range` 
      : 'All reported lab values within normal report bounds',
    glossaryTerms,
    disclaimer: MEDICAL_DISCLAIMER_TEXT,
  };
}
