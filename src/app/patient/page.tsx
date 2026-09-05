'use client';

import React, { useState } from 'react';
import { useMedLens } from '@/context/MedLensContext';
import { ProvenanceBadge } from '@/components/ProvenanceBadge';
import { 
  User, 
  Plus, 
  X, 
  Save, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles, 
  RotateCcw,
  ShieldCheck,
  Stethoscope,
  Pill,
  ShieldAlert,
  FileSpreadsheet
} from 'lucide-react';
import { SAMPLE_PATIENTS } from '@/lib/sampleData';

export default function PatientPage() {
  const { patient, updatePatient, selectPatient, loadSampleData } = useMedLens();
  
  const [formData, setFormData] = useState({
    id: patient.id,
    name: patient.name,
    age: patient.age,
    sex: patient.sex,
    symptoms: [...patient.symptoms],
    existingConditions: [...patient.existingConditions],
    allergies: [...patient.allergies],
    currentMedications: [...patient.currentMedications],
  });

  const [newSymptom, setNewSymptom] = useState('');
  const [newCondition, setNewCondition] = useState('');
  const [newAllergy, setNewAllergy] = useState('');
  const [newMedication, setNewMedication] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Sync if patient in context changes
  React.useEffect(() => {
    setFormData({
      id: patient.id,
      name: patient.name,
      age: patient.age,
      sex: patient.sex,
      symptoms: [...patient.symptoms],
      existingConditions: [...patient.existingConditions],
      allergies: [...patient.allergies],
      currentMedications: [...patient.currentMedications],
    });
  }, [patient]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updatePatient(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const addItem = (field: 'symptoms' | 'existingConditions' | 'allergies' | 'currentMedications', value: string, setter: (s: string) => void) => {
    if (!value.trim()) return;
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], value.trim()]
    }));
    setter('');
  };

  const removeItem = (field: 'symptoms' | 'existingConditions' | 'allergies' | 'currentMedications', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">
      
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <User className="w-6 h-6 text-sky-400" />
              Patient Clinical Profile
            </h1>
            <ProvenanceBadge provenance="Patient Input" />
          </div>
          <p className="text-slate-400 text-xs mt-1">
            Manage patient self-reported demographic information, active symptoms, chronic conditions, and medication list.
          </p>
        </div>

        {/* Quick Demo Case Selector */}
        <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800 text-xs">
          <span className="text-slate-400 font-medium px-2">Preset Profiles:</span>
          {SAMPLE_PATIENTS.map((p) => (
            <button
              key={p.id}
              onClick={() => selectPatient(p.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                patient.id === p.id 
                  ? 'bg-sky-500 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {p.name.split(' ')[0]} ({p.id})
            </button>
          ))}
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Patient profile successfully saved to active session record!</span>
        </div>
      )}

      {/* Form Grid */}
      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Core Demographics Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <h2 className="font-bold text-sm text-slate-200 flex items-center gap-2 border-b border-slate-800 pb-3">
            <FileSpreadsheet className="w-4 h-4 text-sky-400" />
            Basic Patient Identifiers & Demographics
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 font-medium mb-1">Patient ID</label>
              <input
                type="text"
                value={formData.id}
                onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-sky-400 font-mono font-bold focus:outline-none focus:border-sky-500"
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-400 font-medium mb-1">Full Patient Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-medium focus:outline-none focus:border-sky-500"
                required
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Age (Years)</label>
              <input
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-medium focus:outline-none focus:border-sky-500"
                required
                min="0"
                max="120"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Sex</label>
              <select
                value={formData.sex}
                onChange={(e) => setFormData({ ...formData, sex: e.target.value as any })}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-medium focus:outline-none focus:border-sky-500"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Clinical History & Symptoms Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Symptoms List */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
            <h3 className="font-bold text-xs text-slate-200 flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-sky-400" />
              Reported Symptoms
            </h3>

            <div className="flex gap-2">
              <input
                type="text"
                value={newSymptom}
                onChange={(e) => setNewSymptom(e.target.value)}
                placeholder="e.g. Fatigue, Dizziness"
                className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-sky-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addItem('symptoms', newSymptom, setNewSymptom);
                  }
                }}
              />
              <button
                type="button"
                onClick={() => addItem('symptoms', newSymptom, setNewSymptom)}
                className="px-3 py-1.5 rounded-lg bg-sky-500/20 text-sky-300 font-semibold text-xs border border-sky-400/30 hover:bg-sky-500/30"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {formData.symptoms.map((s, idx) => (
                <span key={idx} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs bg-slate-800 text-slate-200 border border-slate-700">
                  {s}
                  <button type="button" onClick={() => removeItem('symptoms', idx)} className="text-slate-400 hover:text-red-400">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {formData.symptoms.length === 0 && (
                <span className="text-slate-500 italic text-xs">No symptoms entered</span>
              )}
            </div>
          </div>

          {/* Existing Chronic Conditions */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
            <h3 className="font-bold text-xs text-slate-200 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              Existing Chronic Conditions
            </h3>

            <div className="flex gap-2">
              <input
                type="text"
                value={newCondition}
                onChange={(e) => setNewCondition(e.target.value)}
                placeholder="e.g. Type 2 Diabetes, Hypertension"
                className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-sky-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addItem('existingConditions', newCondition, setNewCondition);
                  }
                }}
              />
              <button
                type="button"
                onClick={() => addItem('existingConditions', newCondition, setNewCondition)}
                className="px-3 py-1.5 rounded-lg bg-indigo-500/20 text-indigo-300 font-semibold text-xs border border-indigo-400/30 hover:bg-indigo-500/30"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {formData.existingConditions.map((c, idx) => (
                <span key={idx} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs bg-indigo-950/40 text-indigo-300 border border-indigo-800/50">
                  {c}
                  <button type="button" onClick={() => removeItem('existingConditions', idx)} className="text-indigo-400 hover:text-red-400">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {formData.existingConditions.length === 0 && (
                <span className="text-slate-500 italic text-xs">No chronic conditions listed</span>
              )}
            </div>
          </div>

          {/* Allergies */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
            <h3 className="font-bold text-xs text-slate-200 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-400" />
              Allergies & Sensitivities
            </h3>

            <div className="flex gap-2">
              <input
                type="text"
                value={newAllergy}
                onChange={(e) => setNewAllergy(e.target.value)}
                placeholder="e.g. Penicillin, Sulfa, NKDA"
                className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-sky-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addItem('allergies', newAllergy, setNewAllergy);
                  }
                }}
              />
              <button
                type="button"
                onClick={() => addItem('allergies', newAllergy, setNewAllergy)}
                className="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-300 font-semibold text-xs border border-red-400/30 hover:bg-red-500/30"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {formData.allergies.map((a, idx) => (
                <span key={idx} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs bg-red-950/40 text-red-300 border border-red-800/50">
                  {a}
                  <button type="button" onClick={() => removeItem('allergies', idx)} className="text-red-400 hover:text-white">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {formData.allergies.length === 0 && (
                <span className="text-slate-500 italic text-xs">No allergies documented</span>
              )}
            </div>
          </div>

          {/* Current Medications */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
            <h3 className="font-bold text-xs text-slate-200 flex items-center gap-2">
              <Pill className="w-4 h-4 text-emerald-400" />
              Current Medications
            </h3>

            <div className="flex gap-2">
              <input
                type="text"
                value={newMedication}
                onChange={(e) => setNewMedication(e.target.value)}
                placeholder="e.g. Metformin 500mg, Lisinopril 10mg"
                className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-sky-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addItem('currentMedications', newMedication, setNewMedication);
                  }
                }}
              />
              <button
                type="button"
                onClick={() => addItem('currentMedications', newMedication, setNewMedication)}
                className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 font-semibold text-xs border border-emerald-400/30 hover:bg-emerald-500/30"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {formData.currentMedications.map((m, idx) => (
                <span key={idx} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs bg-emerald-950/40 text-emerald-300 border border-emerald-800/50">
                  {m}
                  <button type="button" onClick={() => removeItem('currentMedications', idx)} className="text-emerald-400 hover:text-white">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {formData.currentMedications.length === 0 && (
                <span className="text-slate-500 italic text-xs">No active medications listed</span>
              )}
            </div>
          </div>

        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-clinical-600 hover:from-sky-400 hover:to-clinical-500 text-white font-bold text-xs shadow-lg shadow-sky-500/25 flex items-center gap-2 transition-all hover:scale-[1.02]"
          >
            <Save className="w-4 h-4" />
            Save Patient Profile Changes
          </button>
        </div>

      </form>

    </div>
  );
}
