import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Patient, TestResult } from '@/lib/types';
import { generateLocalAISummary, MEDICAL_DISCLAIMER_TEXT } from '@/lib/evaluator';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { patient, tests } = body as { patient: Patient; tests: TestResult[] };

    if (!patient || !tests) {
      return NextResponse.json({ error: 'Patient profile and test results required' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey && apiKey !== 'your_gemini_api_key_here') {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const prompt = `
        You are a patient-friendly medical intelligence assistant for MedLens.
        Summarize the following patient information and lab test results into plain, easy-to-understand English.

        PATIENT DETAILS:
        Name: ${patient.name}
        Age: ${patient.age}, Sex: ${patient.sex}
        Symptoms: ${patient.symptoms.join(', ') || 'None reported'}
        Conditions: ${patient.existingConditions.join(', ') || 'None listed'}
        Allergies: ${patient.allergies.join(', ') || 'None listed'}
        Current Medications: ${patient.currentMedications.join(', ') || 'None listed'}

        LAB TEST RESULTS:
        ${tests.map(t => `- ${t.testName}: ${t.value} ${t.unit} (Ref Range: ${t.referenceRange || 'NOT PROVIDED IN REPORT'}, Status: ${t.status})`).join('\n')}

        STRICT SAFETY RULES:
        1. Do NOT diagnose the patient with any condition.
        2. Do NOT recommend any treatment plans, surgeries, or therapies.
        3. Do NOT recommend or prescribe any medications or dosages.
        4. Summarize ONLY the data provided above.
        5. Explain lab results in clear, non-jargon language for the patient.

        Return JSON with:
        - summaryText (string)
        - stabilityStatus (string)
      `;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        const local = generateLocalAISummary(patient, tests);
        return NextResponse.json({
          success: true,
          aiSummary: {
            ...local,
            summaryText: parsed.summaryText || local.summaryText,
            stabilityStatus: parsed.stabilityStatus || local.stabilityStatus,
          },
          mode: 'Gemini AI',
        });
      }
    }

    // Fallback to local safety engine summary
    const localSummary = generateLocalAISummary(patient, tests);
    return NextResponse.json({
      success: true,
      aiSummary: localSummary,
      mode: 'Local Clinical Safety Engine',
    });

  } catch (err: any) {
    console.error('Summary API error:', err);
    return NextResponse.json({ error: err.message || 'Summary generation failed' }, { status: 500 });
  }
}
