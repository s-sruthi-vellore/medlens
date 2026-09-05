'use client';

import React, { useState, useEffect } from 'react';
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
  ShieldCheck, 
  Stethoscope, 
  Pill, 
  ShieldAlert, 
  FileSpreadsheet, 
  UserPlus, 
  Loader2 
} from 'lucide-react';

export default function PatientPage() {
  const { 
    patient, 
    draftPatient, 
    updatePatient, 
    createPatient, 
    startNewPatient, 
    cancelNewPatient 
  } = useMedLens();

  const isCreatingNew = draftPatient !== null;
  const currentTarget = draftPatient || patient;

  const [formData, setFormData] = useState({
    id: currentTarget.id,
    name: currentTarget.name,
    age: currentTarget.age,
    sex: currentTarget.sex,
    symptoms: [...currentTarget.symptoms],
    existingConditions: [...currentTarget.existingConditions],
    allergies: [...currentTarget.allergies],
    currentMedications: [...currentTarget.currentMedications],
  });

  const [newSymptom, setNewSymptom] = useState('');
  const [newCondition, setNewCondition] = useState('');
  const [newAllergy, setNewAllergy] = useState('');
  const [newMedication, setNewMedication] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState<string | null>(null);

  // Sync state if active patient or draft patient changes
  useEffect(() => {
    const target = draftPatient || patient;
    setFormData({
      id: target.id,
      name: target.name,
      age: target.age,
      sex: target.sex,
      symptoms: [...target.symptoms],
      existingConditions: [...target.existingConditions],
      allergies: [...target.allergies],
      currentMedications: [...target.currentMedications],
    });
  }, [patient, draftPatient]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert('Please enter a valid patient name.');
      return;
    }

    setIsSaving(true);
    setSavedSuccess(null);

    // Realistic saving delay so loading state is clearly visible
    await new Promise((resolve) => setTimeout(resolve, 600));

    if (isCreatingNew) {
      // Create new patient
      const newPatientObj = {
        ...formData,
        name: formData.name.trim(),
        lastUpdated: new Date().toISOString().split('T')[0],
      };
      createPatient(newPatientObj);
      setSavedSuccess(`New patient "${newPatientObj.name}" (${newPatientObj.id}) successfully created and saved!`);
    } else {
      // Update existing patient
      updatePatient(formData);
      setSavedSuccess(`Patient profile for "${formData.name}" successfully saved!`);
    }

    setIsSaving(false);
    setTimeout(() => setSavedSuccess(null), 4000);
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
              {isCreatingNew ? 'Create New Patient Profile' : 'Patient Clinical Profile'}
            </h1>
            {isCreatingNew ? (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-400/30">
                New Registration
              </span>
            ) : (
              <ProvenanceBadge provenance="Patient Input" />
            )}
          </div>
          <p className="text-slate-400 text-xs mt-1">
            {isCreatingNew 
              ? 'Enter demographic info, active symptoms, chronic conditions, and medication details for the new patient.'
              : 'Manage patient self-reported demographic information, active symptoms, chronic conditions, and medication list.'
            }
          </p>
        </div>

        {/* Action Controls: + New Patient Button */}
        <div className="flex items-center gap-2">
          {!isCreatingNew ? (
            <button
              onClick={startNewPatient}
              className="px-3.5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs shadow-md flex items-center gap-1.5 transition-all hover:scale-[1.02]"
            >
              <UserPlus className="w-4 h-4" />
              + New Patient
            </button>
          ) : (
            <button
              onClick={cancelNewPatient}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs border border-slate-700 transition-colors"
            >
              Cancel Registration
            </button>
          )}
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2 animate-fade-in shadow-md">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-semibold">{savedSuccess}</span>
        </div>
      )}

      {/* Form Grid */}
      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Core Demographics Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="font-bold text-sm text-slate-200 flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-sky-400" />
              Basic Patient Identifiers & Demographics
            </h2>
            <span className="text-xs text-slate-400 font-mono">
              Status: {isCreatingNew ? 'Draft Profile' : 'Saved Patient'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 font-medium mb-1">Patient ID (Auto-Generated)</label>
              <input
                type="text"
                value={formData.id}
                onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-sky-400 font-mono font-bold focus:outline-none focus:border-sky-500"
                required
                disabled={isSaving}
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-400 font-medium mb-1">Full Patient Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Jane Doe"
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-medium focus:outline-none focus:border-sky-500"
                required
                disabled={isSaving}
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Age (Years) *</label>
              <input
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-medium focus:outline-none focus:border-sky-500"
                required
                min="0"
                max="120"
                disabled={isSaving}
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Biological Sex *</label>
              <select
                value={formData.sex}
                onChange={(e) => setFormData({ ...formData, sex: e.target.value as any })}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-medium focus:outline-none focus:border-sky-500"
                disabled={isSaving}
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
                placeholder="e.g. Fatigue, Fever, Shortness of breath"
                className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-sky-500"
                disabled={isSaving}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addItem('symptoms', newSymptom, setNewSymptom);
                  }
                }}
              />
              <button
                type="button"
                disabled={isSaving}
                onClick={() => addItem('symptoms', newSymptom, setNewSymptom)}
                className="px-3 py-1.5 rounded-lg bg-sky-500/20 text-sky-300 font-semibold text-xs border border-sky-400/30 hover:bg-sky-500/30 disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {formData.symptoms.map((s, idx) => (
                <span key={idx} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs bg-slate-800 text-slate-200 border border-slate-700">
                  {s}
                  <button type="button" disabled={isSaving} onClick={() => removeItem('symptoms', idx)} className="text-slate-400 hover:text-red-400 disabled:opacity-50">
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
                placeholder="e.g. Type 2 Diabetes, Hypertension, Asthma"
                className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-sky-500"
                disabled={isSaving}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addItem('existingConditions', newCondition, setNewCondition);
                  }
                }}
              />
              <button
                type="button"
                disabled={isSaving}
                onClick={() => addItem('existingConditions', newCondition, setNewCondition)}
                className="px-3 py-1.5 rounded-lg bg-indigo-500/20 text-indigo-300 font-semibold text-xs border border-indigo-400/30 hover:bg-indigo-500/30 disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {formData.existingConditions.map((c, idx) => (
                <span key={idx} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs bg-indigo-950/40 text-indigo-300 border border-indigo-800/50">
                  {c}
                  <button type="button" disabled={isSaving} onClick={() => removeItem('existingConditions', idx)} className="text-indigo-400 hover:text-red-400 disabled:opacity-50">
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
                disabled={isSaving}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addItem('allergies', newAllergy, setNewAllergy);
                  }
                }}
              />
              <button
                type="button"
                disabled={isSaving}
                onClick={() => addItem('allergies', newAllergy, setNewAllergy)}
                className="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-300 font-semibold text-xs border border-red-400/30 hover:bg-red-500/30 disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {formData.allergies.map((a, idx) => (
                <span key={idx} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs bg-red-950/40 text-red-300 border border-red-800/50">
                  {a}
                  <button type="button" disabled={isSaving} onClick={() => removeItem('allergies', idx)} className="text-red-400 hover:text-white disabled:opacity-50">
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
                placeholder="e.g. Metformin 500mg, Amoxicillin"
                className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-sky-500"
                disabled={isSaving}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addItem('currentMedications', newMedication, setNewMedication);
                  }
                }}
              />
              <button
                type="button"
                disabled={isSaving}
                onClick={() => addItem('currentMedications', newMedication, setNewMedication)}
                className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 font-semibold text-xs border border-emerald-400/30 hover:bg-emerald-500/30 disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {formData.currentMedications.map((m, idx) => (
                <span key={idx} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs bg-emerald-950/40 text-emerald-300 border border-emerald-800/50">
                  {m}
                  <button type="button" disabled={isSaving} onClick={() => removeItem('currentMedications', idx)} className="text-emerald-400 hover:text-white disabled:opacity-50">
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
          {isCreatingNew && (
            <button
              type="button"
              onClick={cancelNewPatient}
              disabled={isSaving}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs border border-slate-700 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          )}

          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-clinical-600 hover:from-sky-400 hover:to-clinical-500 text-white font-bold text-xs shadow-lg shadow-sky-500/25 flex items-center gap-2 transition-all hover:scale-[1.02] disabled:opacity-75 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>{isCreatingNew ? 'Creating Patient Profile...' : 'Saving Profile Changes...'}</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{isCreatingNew ? 'Create Patient Profile & Initialize Timeline' : 'Save Patient Profile Changes'}</span>
              </>
            )}
          </button>
        </div>

      </form>

    </div>
  );
}
