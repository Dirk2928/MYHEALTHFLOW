'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

const SYMPTOMS = [
  {
    key: 'dizziness',
    label: 'Dizziness',
    followUps: [
      { key: 'duration', label: 'How long have you had dizziness?', type: 'select' as const, options: ['Less than 1 day', '1–3 days', 'More than 3 days'] },
      { key: 'severity', label: 'Severity (1–10)', type: 'number' as const },
      { key: 'fainting', label: 'Any fainting episodes?', type: 'select' as const, options: ['Yes', 'No'] },
      { key: 'bp_history', label: 'History of high blood pressure?', type: 'select' as const, options: ['Yes', 'No', 'Unknown'] },
    ],
  },
  {
    key: 'fever',
    label: 'Fever',
    followUps: [
      { key: 'temperature', label: 'Temperature (°C)', type: 'number' as const },
      { key: 'duration', label: 'How long have you had fever?', type: 'select' as const, options: ['Less than 1 day', '1–3 days', 'More than 3 days'] },
      { key: 'chills', label: 'Chills or shivering?', type: 'select' as const, options: ['Yes', 'No'] },
    ],
  },
  {
    key: 'cough',
    label: 'Cough',
    followUps: [
      { key: 'type', label: 'Type of cough', type: 'select' as const, options: ['Dry', 'With phlegm', 'With blood'] },
      { key: 'duration', label: 'How long have you had cough?', type: 'select' as const, options: ['Less than 1 day', '1–3 days', 'More than 3 days'] },
    ],
  },
  {
    key: 'headache',
    label: 'Headache',
    followUps: [
      { key: 'location', label: 'Where is the headache?', type: 'select' as const, options: ['Forehead', 'Temple', 'Back of head', 'Whole head'] },
      { key: 'severity', label: 'Severity (1–10)', type: 'number' as const },
      { key: 'nausea', label: 'Accompanied by nausea?', type: 'select' as const, options: ['Yes', 'No'] },
    ],
  },
  {
    key: 'fatigue',
    label: 'Fatigue',
    followUps: [
      { key: 'duration', label: 'How long have you felt fatigued?', type: 'select' as const, options: ['Less than 1 day', '1–3 days', 'More than 3 days'] },
      { key: 'sleep', label: 'Hours of sleep per night', type: 'number' as const },
    ],
  },
]

const MEDICATION_SUGGESTIONS = [
  {
    symptomKey: 'dizziness',
    medications: [
      { key: 'betahistine', label: 'Betahistine 16mg', category: 'medicine' as const },
      { key: 'rest', label: 'Bed rest advised', category: 'advice' as const },
      { key: 'hydration', label: 'Increase fluid intake', category: 'advice' as const },
      { key: 'bp_monitoring', label: 'Monitor blood pressure daily', category: 'advice' as const },
    ],
  },
  {
    symptomKey: 'fever',
    medications: [
      { key: 'paracetamol', label: 'Paracetamol 500mg', category: 'medicine' as const },
      { key: 'hydration', label: 'Increase fluid intake', category: 'advice' as const },
      { key: 'cold_compress', label: 'Cold compress', category: 'advice' as const },
      { key: 'rest', label: 'Bed rest advised', category: 'advice' as const },
    ],
  },
  {
    symptomKey: 'cough',
    medications: [
      { key: 'carbocisteine', label: 'Carbocisteine 500mg', category: 'medicine' as const },
      { key: 'warm_water', label: 'Drink warm water', category: 'advice' as const },
      { key: 'steam', label: 'Steam inhalation', category: 'advice' as const },
      { key: 'avoid_cold', label: 'Avoid cold drinks', category: 'advice' as const },
    ],
  },
  {
    symptomKey: 'headache',
    medications: [
      { key: 'paracetamol', label: 'Paracetamol 500mg', category: 'medicine' as const },
      { key: 'rest', label: 'Rest in quiet, dark room', category: 'advice' as const },
      { key: 'hydration', label: 'Increase fluid intake', category: 'advice' as const },
      { key: 'eye_check', label: 'Refer for eye checkup', category: 'advice' as const },
    ],
  },
  {
    symptomKey: 'fatigue',
    medications: [
      { key: 'multivitamins', label: 'Multivitamins', category: 'medicine' as const },
      { key: 'iron_supplement', label: 'Iron supplement', category: 'medicine' as const },
      { key: 'sleep_hygiene', label: 'Improve sleep hygiene', category: 'advice' as const },
      { key: 'balanced_diet', label: 'Balanced diet advice', category: 'advice' as const },
    ],
  },
]

type MLPrediction = {
  prediction: string
  confidence: number
  all_probabilities: Record<string, number>
  disclaimer: string
}

export default function ConsultationPage() {
  const { id } = useParams()
  const router = useRouter()
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([])
  const [answers, setAnswers] = useState<Record<string, Record<string, string>>>({})
  const [notes, setNotes] = useState('')
  const [selectedMeds, setSelectedMeds] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState<'symptoms' | 'consultation' | 'prediction'>('symptoms')
  const [mlPrediction, setMlPrediction] = useState<MLPrediction | null>(null)
  const [mlLoading, setMlLoading] = useState(false)

  const toggleSymptom = (key: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(key) ? prev.filter((s) => s !== key) : [...prev, key]
    )
  }

  const handleAnswer = (symptomKey: string, questionKey: string, value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [symptomKey]: {
        ...prev[symptomKey],
        [questionKey]: value,
      },
    }))
  }

  const suggestedMeds = MEDICATION_SUGGESTIONS.filter((s) =>
    selectedSymptoms.includes(s.symptomKey)
  ).flatMap((s) => s.medications)

  const toggleMed = (key: string) => {
    setSelectedMeds((prev) =>
      prev.includes(key) ? prev.filter((m) => m !== key) : [...prev, key]
    )
  }

  const getMaxSeverity = () => {
    let maxSeverity = 1
    SYMPTOMS.filter((s) => selectedSymptoms.includes(s.key)).forEach((symptom) => {
      const severityAnswer = answers[symptom.key]?.['severity']
      if (severityAnswer) {
        const num = parseInt(severityAnswer)
        if (!isNaN(num) && num > maxSeverity) maxSeverity = num
      }
    })
    return maxSeverity
  }

  const getMaxDuration = () => {
    let maxDuration = 1
    SYMPTOMS.filter((s) => selectedSymptoms.includes(s.key)).forEach((symptom) => {
      const durationAnswer = answers[symptom.key]?.['duration']
      if (durationAnswer) {
        if (durationAnswer === 'Less than 1 day') maxDuration = Math.max(maxDuration, 1)
        else if (durationAnswer === '1–3 days') maxDuration = Math.max(maxDuration, 2)
        else if (durationAnswer === 'More than 3 days') maxDuration = Math.max(maxDuration, 5)
      }
    })
    return maxDuration
  }

  const getMLPrediction = async () => {
    setMlLoading(true)
    try {
      const severity = getMaxSeverity()
      const durationDays = getMaxDuration()
      const res = await fetch('https://myhealthflow.onrender.com/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symptoms: selectedSymptoms, severity, duration_days: durationDays, age_group: 'adult' }),
      })
      if (res.ok) {
        const data = await res.json()
        setMlPrediction(data)
        setStep('prediction')
      }
    } catch (err) {
      console.error('ML API error:', err)
    } finally {
      setMlLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedSymptoms.length === 0) {
      setError('Please select at least one symptom.')
      return
    }
    setLoading(true)
    setError('')
    const res = await fetch('/api/consultations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        patientId: id,
        symptoms: selectedSymptoms,
        answers,
        notes,
        medications: selectedMeds.map((medKey) => {
          const med = suggestedMeds.find((m) => m.key === medKey)
          return { name: med?.label || medKey, notes: null }
        }),
        mlPrediction,
      }),
    })
    if (res.ok) {
      router.push(`/dashboard/patients/${id}`)
    } else {
      setError('Failed to save consultation. Please try again.')
      setLoading(false)
    }
  }

  const getConcernColor = (concern: string) => {
    if (concern.includes('Severe')) return 'from-red-50 to-red-100 border-red-200'
    if (concern.includes('Moderate')) return 'from-yellow-50 to-yellow-100 border-yellow-200'
    return 'from-green-50 to-green-100 border-green-200'
  }

  const getConcernIcon = (concern: string) => {
    if (concern.includes('Severe')) return 'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z'
    if (concern.includes('Moderate')) return 'M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z'
    return 'M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-800">Patient Consultation</h1>
          <p className="text-sm text-slate-400 mt-1">Record symptoms, findings, and medications for this visit.</p>
        </div>

        <div className="flex gap-1 mb-8 bg-white rounded-xl border border-slate-100 p-1.5 shadow-sm">
          {[
            { key: 'symptoms', label: 'Symptoms', num: 1 },
            { key: 'consultation', label: 'Notes & Meds', num: 2 },
            { key: 'prediction', label: 'ML Assessment', num: 3 },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                if (tab.key === 'prediction' && !mlPrediction) return
                setStep(tab.key as typeof step)
              }}
              className={`flex-1 flex items-center justify-center gap-2 text-sm font-medium px-4 py-2.5 rounded-lg transition-all ${
                step === tab.key
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
              } ${tab.key === 'prediction' && !mlPrediction ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span className="w-5 h-5 rounded-full bg-current bg-opacity-20 flex items-center justify-center text-xs font-bold">{tab.num}</span>
              {tab.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {step === 'symptoms' && (
            <>
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <h2 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-blue-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                  </svg>
                  Select Symptoms
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  {SYMPTOMS.map((symptom) => (
                    <label
                      key={symptom.key}
                      className={`flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                        selectedSymptoms.includes(symptom.key)
                          ? 'border-blue-400 bg-blue-50 shadow-sm'
                          : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedSymptoms.includes(symptom.key)}
                        onChange={() => toggleSymptom(symptom.key)}
                        className="accent-blue-600 w-4 h-4"
                      />
                      <span className="text-sm font-medium text-slate-700">{symptom.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {SYMPTOMS.filter((s) => selectedSymptoms.includes(s.key)).map((symptom) => (
                <div key={symptom.key} className="bg-white rounded-2xl shadow-sm border border-blue-100 p-6">
                  <h2 className="text-sm font-semibold text-blue-600 mb-4 flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    Follow-up: {symptom.label}
                  </h2>
                  <div className="space-y-4">
                    {symptom.followUps.map((q) => (
                      <div key={q.key}>
                        <label className="block text-sm font-medium text-slate-600 mb-2">{q.label}</label>
                        {q.type === 'select' ? (
                          <select
                            onChange={(e) => handleAnswer(symptom.key, q.key, e.target.value)}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all"
                          >
                            <option value="">Select an option</option>
                            {q.options?.map((opt) => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type={q.type}
                            onChange={(e) => handleAnswer(symptom.key, q.key, e.target.value)}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all"
                            placeholder={q.type === 'number' ? '0' : ''}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </>
          )}

          {step === 'consultation' && (
            <>
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <h2 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-purple-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                  </svg>
                  Consultation Notes
                </h2>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Enter clinical findings, observations, and notes..."
                  rows={5}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all resize-none"
                />
              </div>

              {suggestedMeds.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                  <h2 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-emerald-500">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
                    </svg>
                    Suggested Medications & Advice
                  </h2>
                  <p className="text-xs text-slate-400 mb-4">Based on selected symptoms. Select the ones to prescribe.</p>
                  <div className="space-y-2">
                    {suggestedMeds.map((med) => (
                      <label
                        key={med.key}
                        className={`flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                          selectedMeds.includes(med.key)
                            ? 'border-emerald-400 bg-emerald-50 shadow-sm'
                            : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedMeds.includes(med.key)}
                          onChange={() => toggleMed(med.key)}
                          className="accent-emerald-600 w-4 h-4"
                        />
                        <span className="text-sm font-medium text-slate-700">{med.label}</span>
                        <span className={`ml-auto text-xs font-medium px-2.5 py-1 rounded-full ${
                          med.category === 'medicine' ? 'bg-blue-100 text-blue-700' :
                          med.category === 'advice' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-purple-100 text-purple-700'
                        }`}>
                          {med.category}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <h2 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-indigo-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                  </svg>
                  ML-Assisted Risk Assessment
                </h2>
                <p className="text-xs text-slate-400 mb-4">Get an AI-assisted health concern prediction based on symptoms.</p>
                <button
                  type="button"
                  onClick={getMLPrediction}
                  disabled={mlLoading}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:from-indigo-600 hover:to-indigo-700 shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-50"
                >
                  {mlLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                      </svg>
                      Run ML Assessment
                    </>
                  )}
                </button>
              </div>
            </>
          )}

          {step === 'prediction' && mlPrediction && (
            <div className={`bg-gradient-to-br ${getConcernColor(mlPrediction.prediction)} rounded-2xl border p-6`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d={getConcernIcon(mlPrediction.prediction)} />
                  </svg>
                  ML Risk Assessment
                </h2>
                <span className="text-sm font-bold bg-white bg-opacity-50 px-3 py-1 rounded-full">
                  {mlPrediction.confidence}% confidence
                </span>
              </div>
              <p className="text-2xl font-bold mb-4">{mlPrediction.prediction}</p>
              <div className="w-full bg-white bg-opacity-30 rounded-full h-2.5 mb-4">
                <div className="bg-white bg-opacity-80 h-2.5 rounded-full transition-all duration-500" style={{ width: `${mlPrediction.confidence}%` }} />
              </div>
              <div className="space-y-1.5 mb-4">
                <p className="text-sm font-semibold">All Predictions:</p>
                {Object.entries(mlPrediction.all_probabilities).map(([concern, prob]) => (
                  <div key={concern} className="flex justify-between text-sm">
                    <span>{concern}</span>
                    <span className="font-bold">{(prob * 100).toFixed(1)}%</span>
                  </div>
                ))}
              </div>
              <p className="text-xs italic border-t border-current border-opacity-20 pt-3 mt-3 opacity-75">
                {mlPrediction.disclaimer}
              </p>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 shrink-0">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              {error}
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            {step === 'symptoms' && (
              <button
                type="button"
                onClick={() => setStep('consultation')}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-medium px-6 py-2.5 rounded-xl hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/20 transition-all"
              >
                Next: Notes & Medications
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </button>
            )}
            {step === 'consultation' && (
              <button
                type="button"
                onClick={() => mlPrediction ? setStep('prediction') : setError('Please run ML Assessment first')}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-medium px-6 py-2.5 rounded-xl hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/20 transition-all"
              >
                Next: Review
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </button>
            )}
            {step === 'prediction' && (
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-medium px-6 py-2.5 rounded-xl hover:from-emerald-600 hover:to-emerald-700 shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    Save Consultation
                  </>
                )}
              </button>
            )}
            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 text-sm text-slate-500 px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 hover:text-slate-700 transition-colors font-medium ml-auto"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
