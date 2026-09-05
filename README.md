# MedLens – AI-Powered Clinical Information Intelligence

**MedLens** is a production-grade clinical intelligence application built for the **PromptWars** hackathon. It synthesizes patient-reported medical histories and laboratory reports into structured, auditable clinical records with strict reference range evaluation rules, clear provenance tracking, conflict detection, and patient-friendly AI summaries.

![MedLens Architecture](https://img.shields.io/badge/Status-Production%20Ready-emerald)
![Next.js](https://img.shields.io/badge/Framework-Next.js%2014-blue)
![TypeScript](https://img.shields.io/badge/Language-TypeScript-blue)
![Google Cloud Run](https://img.shields.io/badge/Deploy-Google%20Cloud%20Run-sky)
![Gemini AI](https://img.shields.io/badge/AI-Google%20Gemini%20API-teal)

---

## 🌟 Core Clinical Features & Innovation

1. **Patient Information Management (`Patient Input`)**:
   - Manages Patient ID, Age, Sex, Symptoms, Chronic Conditions, Allergies, and Active Medications.
   - Pre-configured preset profiles (John Doe - Diabetes Monitoring, Sarah Jenkins - Anemia & Thyroid, Marcus Vance - Renal Status).

2. **Medical Report Processing & OCR (`Medical Report`)**:
   - Drag-and-drop file uploader supporting PDF and Image lab scans.
   - Powered by **Google Gemini Vision API** (`GEMINI_API_KEY`) with fallback clinical OCR parsing engine.
   - Instant 1-Click sample report templates for rapid evaluation.

3. **Strict Reference Range Evaluator Rule**:
   - Status (`LOW`, `NORMAL`, `HIGH`, `CANNOT DETERMINE`) is calculated **ONLY** from reference ranges explicitly present in the uploaded report.
   - **Never invents reference ranges**: If reference range is missing in the report, status is strictly set to `CANNOT DETERMINE` with an explanatory safety tooltip.

4. **Source & Provenance Auditing**:
   - Every piece of data is tagged with visual provenance badges:
     - 👤 `Patient Input` (Blue)
     - 📄 `Medical Report` (Indigo)
     - ✨ `AI Generated` (Teal)

5. **Inconsistency & Conflict Inspector**:
   - Cross-checks self-reported history against lab findings (e.g. self-reported "No Allergies" vs report observation note of Penicillin sensitivity; or elevated HbA1c without documented Diabetes history).
   - Allows human clinician reconciliation.

6. **Patient-Friendly AI Summary & Safety Guardrails**:
   - Summarizes available lab metrics into plain English.
   - **Strict Safety Rules**: No medical diagnosis, no treatment plans, no medication/dosage recommendations.
   - Interactive medical terminology glossary.

7. **Multi-Report Comparison & Trend Tracking**:
   - Side-by-side comparative matrix tracking baseline vs current lab values.
   - Interactive trend chart tracking glycemic and lipid markers over time.

---

## 🚀 Quick Start (Local Development)

### 1. Clone & Install Dependencies
```bash
git clone <your-repo-url>
cd Project
npm install
```

### 2. Environment Setup
Create a `.env` file in the root directory (or copy `.env.example`):
```bash
cp .env.example .env
```

Add your Google Gemini API key:
```env
GEMINI_API_KEY=your_gemini_api_key_here
PORT=3000
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ☁️ Google Cloud Run Deployment

MedLens is containerized using a multi-stage `Dockerfile` optimized for standalone Next.js builds.

### Deploy to Cloud Run using Google Cloud CLI:

```bash
# 1. Set Google Cloud Project
gcloud config set project YOUR_PROJECT_ID

# 2. Build and submit container image to Artifact Registry / Container Registry
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/medlens:latest

# 3. Deploy to Google Cloud Run with Gemini API Key secret
gcloud run deploy medlens \
  --image gcr.io/YOUR_PROJECT_ID/medlens:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
```

---

## 🐳 Local Docker Testing

```bash
# Build Docker image
docker build -t medlens-app .

# Run Docker container
docker run -p 3000:3000 -e GEMINI_API_KEY="YOUR_GEMINI_API_KEY" medlens-app
```

---

## 🛡️ Safety & Privacy Disclaimer

MedLens is an AI-powered clinical information organization tool intended for informational and workflow demonstration purposes only. It does not provide medical advice, diagnosis, or treatment plans. All outputs must be reviewed and verified by a qualified healthcare professional before making any clinical decisions.
