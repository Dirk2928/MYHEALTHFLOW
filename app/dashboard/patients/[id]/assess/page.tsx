'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

const SYMPTOMS = [
  {
    key: 'fever',
    label: 'Fever',
    followUps: [
      { key: 'duration', label: 'How long?', type: 'text' },
      { key: 'temperature', label: 'Temperature', type: 'number' },
    ],
  },
  {
    key: 'cough',
    label: 'Cough',
    followUps: [
      {
        key: 'type',
        label: 'Cough type',
        type: 'select',
        options: ['Dry', 'Wet'],
      },
      { key: 'duration', label: 'How long?', type: 'text' },
    ],
  },
] as const

export default function AssessmentPage() {
  const { id } = useParams()
  const router = useRouter()
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([])
  const [answers, setAnswers] = useState<Record<string, Record<string, string>>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedSymptoms.length === 0) {
      setError('Please select at least one symptom.')
      return
    }
    setLoading(true)
    setError('')

    const res = await fetch('/api/assessments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        patientId: id,
        symptoms: selectedSymptoms,
        answers,
      }),
    })

    if (res.ok) {
      const data = await res.json()
      router.push(`/dashboard/patients/${id}`)
    } else {
      setError('Failed to save assessment. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Symptom Assessment</h1>
        <p className="text-sm text-gray-500 mb-6">Select all symptoms that apply, then answer the follow-up questions.</p>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Symptom checkboxes */}
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

          {/* Conditional follow-up questions */}
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

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white text-sm font-medium px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Assessment'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="text-sm text-gray-600 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}