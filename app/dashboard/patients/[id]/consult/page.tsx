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
        if (!isNaN(num) && num > maxSeverity) {
          maxSeverity = num
        }
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

      const res = await fetch('http://localhost:5000/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symptoms: selectedSymptoms,
          severity: severity,
          duration_days: durationDays,
          age_group: 'adult',
        }),
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
          return {
            name: med?.label || medKey,
            notes: null,
          }
        }),
        mlPrediction: mlPrediction,
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
    if (concern.includes('Severe')) return 'bg-red-100 border-red-300 text-red-800'
    if (concern.includes('Moderate')) return 'bg-yellow-100 border-yellow-300 text-yellow-800'
    return 'bg-green-100 border-green-300 text-green-800'
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Patient Consultation</h1>
        <p className="text-sm text-gray-500 mb-6">
          Record symptoms, findings, and medications for this visit.
        </p>

        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setStep('symptoms')}
            className={`text-sm font-medium px-4 py-2 rounded-lg transition-colors ${
              step === 'symptoms'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 border border-gray-300'
            }`}
          >
            1. Symptoms
          </button>
          <button
            onClick={() => setStep('consultation')}
            className={`text-sm font-medium px-4 py-2 rounded-lg transition-colors ${
              step === 'consultation'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 border border-gray-300'
            }`}
          >
            2. Notes & Meds
          </button>
          <button
            onClick={() => mlPrediction && setStep('prediction')}
            className={`text-sm font-medium px-4 py-2 rounded-lg transition-colors ${
              step === 'prediction'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 border border-gray-300'
            }`}
          >
            3. ML Assessment
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {step === 'symptoms' && (
            <>
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-sm font-medium text-gray-700 mb-4">Select Symptoms</h2>
                <div className="grid grid-cols-2 gap-3">
                  {SYMPTOMS.map((symptom) => (
                    <label
                      key={symptom.key}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedSymptoms.includes(symptom.key)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedSymptoms.includes(symptom.key)}
                        onChange={() => toggleSymptom(symptom.key)}
                        className="accent-blue-600"
                      />
                      <span className="text-sm text-gray-800">{symptom.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {SYMPTOMS.filter((s) => selectedSymptoms.includes(s.key)).map((symptom) => (
                <div key={symptom.key} className="bg-white rounded-xl border border-blue-200 p-6">
                  <h2 className="text-sm font-medium text-blue-700 mb-4">
                    Follow-up: {symptom.label}
                  </h2>
                  <div className="space-y-4">
                    {symptom.followUps.map((q) => (
                      <div key={q.key}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {q.label}
                        </label>
                        {q.type === 'select' ? (
                          <select
                            onChange={(e) => handleAnswer(symptom.key, q.key, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-sm font-medium text-gray-700 mb-4">Consultation Notes</h2>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Enter clinical findings, observations, and notes..."
                  rows={5}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              {suggestedMeds.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h2 className="text-sm font-medium text-gray-700 mb-2">
                    Suggested Medications & Advice
                  </h2>
                  <p className="text-xs text-gray-400 mb-4">
                    Based on selected symptoms. Select the ones you want to prescribe.
                  </p>
                  <div className="space-y-2">
                    {suggestedMeds.map((med) => (
                      <label
                        key={med.key}
                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                          selectedMeds.includes(med.key)
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedMeds.includes(med.key)}
                          onChange={() => toggleMed(med.key)}
                          className="accent-green-600"
                        />
                        <div>
                          <span className="text-sm text-gray-800">{med.label}</span>
                          <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                            med.category === 'medicine'
                              ? 'bg-blue-100 text-blue-700'
                              : med.category === 'advice'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-purple-100 text-purple-700'
                          }`}>
                            {med.category}
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-sm font-medium text-gray-700 mb-4">ML-Assisted Risk Assessment</h2>
                <p className="text-xs text-gray-400 mb-4">
                  Click below to get an AI-assisted health concern prediction based on the selected symptoms.
                </p>
                <button
                  type="button"
                  onClick={getMLPrediction}
                  disabled={mlLoading}
                  className="bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  {mlLoading ? 'Analyzing...' : 'Run ML Assessment'}
                </button>
              </div>
            </>
          )}

          {step === 'prediction' && mlPrediction && (
            <div className={`rounded-xl border p-6 ${getConcernColor(mlPrediction.prediction)}`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">ML Risk Assessment</h2>
                <span className="text-sm font-medium">
                  Confidence: {mlPrediction.confidence}%
                </span>
              </div>
              
              <div className="mb-4">
                <p className="text-2xl font-bold mb-2">{mlPrediction.prediction}</p>
                <div className="w-full bg-white bg-opacity-30 rounded-full h-3">
                  <div
                    className="bg-white bg-opacity-80 h-3 rounded-full transition-all"
                    style={{ width: `${mlPrediction.confidence}%` }}
                  />
                </div>
              </div>

              <div className="space-y-1 mb-4">
                <p className="text-sm font-medium">All Predictions:</p>
                {Object.entries(mlPrediction.all_probabilities).map(([concern, prob]) => (
                  <div key={concern} className="flex justify-between text-sm">
                    <span>{concern}</span>
                    <span className="font-medium">{(prob * 100).toFixed(1)}%</span>
                  </div>
                ))}
              </div>

              <p className="text-xs italic opacity-75 border-t border-current pt-3 mt-3">
                {mlPrediction.disclaimer}
              </p>
            </div>
          )}

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex gap-3">
            {step === 'symptoms' && (
              <button
                type="button"
                onClick={() => setStep('consultation')}
                className="bg-blue-600 text-white text-sm font-medium px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Next: Notes & Medications →
              </button>
            )}
            {step === 'consultation' && (
              <button
                type="button"
                onClick={() => mlPrediction ? setStep('prediction') : setError('Please run ML Assessment first')}
                className="bg-blue-600 text-white text-sm font-medium px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Next: Review →
              </button>
            )}
            {step === 'prediction' && (
              <button
                type="submit"
                disabled={loading}
                className="bg-green-600 text-white text-sm font-medium px-6 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Consultation'}
              </button>
            )}
            <button
              type="button"
              onClick={() => router.back()}
              className="text-sm text-gray-600 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 ml-auto"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}