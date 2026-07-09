'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

type Visit = {
  id: string
  date: string
  assessment: {
    id: string
    symptoms: string[]
    answers: any
  } | null
  consultation: {
    id: string
    notes: string
    date: string
    nurse: { name: string }
    medications: { id: string; name: string; notes: string | null }[]
  } | null
}

type Patient = {
  id: string
  name: string
  dob: string
  barangayId: string
  address: string | null
  contactNo: string | null
  emergencyContact: string | null
  createdAt: string
  visits: Visit[]
}

export default function PatientProfilePage() {
  const { id } = useParams()
  const router = useRouter()
  const [patient, setPatient] = useState<Patient | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'info' | 'assessments' | 'consultations'>('info')

  useEffect(() => {
    fetch(`/api/patients/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setPatient(data)
        setLoading(false)
      })
  }, [id])

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this patient?')) return
    await fetch(`/api/patients/${id}`, { method: 'DELETE' })
    router.push('/dashboard/patients')
  }

  if (loading) return <p className="p-8 text-gray-500 text-sm">Loading...</p>
  if (!patient) return <p className="p-8 text-gray-500 text-sm">Patient not found.</p>

  const assessments = patient.visits.filter(v => v.assessment)
  const consultations = patient.visits.filter(v => v.consultation)

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">{patient.name}</h1>
          <div className="flex gap-2">
            <Link
              href={`/dashboard/patients/${id}/edit`}
              className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Edit
            </Link>
            <Link
              href={`/dashboard/patients/${id}/assess`}
              className="bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              New Assessment
            </Link>
            <Link
              href={`/dashboard/patients/${id}/consult`}
              className="bg-purple-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              New Consultation
            </Link>
            <button
              onClick={handleDelete}
              className="bg-red-500 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-white rounded-lg border border-gray-200 p-1">
          {[
            { key: 'info', label: 'Patient Info' },
            { key: 'assessments', label: `Assessments (${assessments.length})` },
            { key: 'consultations', label: `Consultations (${consultations.length})` },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`flex-1 text-sm font-medium px-4 py-2 rounded-md transition-colors ${
                activeTab === tab.key
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Patient Info Tab */}
        {activeTab === 'info' && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
            {[
              { label: 'Barangay ID', value: patient.barangayId },
              { label: 'Date of Birth', value: new Date(patient.dob).toLocaleDateString() },
              { label: 'Address', value: patient.address ?? '—' },
              { label: 'Contact Number', value: patient.contactNo ?? '—' },
              { label: 'Emergency Contact', value: patient.emergencyContact ?? '—' },
              { label: 'Registered On', value: new Date(patient.createdAt).toLocaleDateString() },
            ].map((item) => (
              <div key={item.label} className="flex justify-between border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                <span className="text-sm font-medium text-gray-600">{item.label}</span>
                <span className="text-sm text-gray-900">{item.value}</span>
              </div>
            ))}
          </div>
        )}

        {/* Assessments Tab */}
        {activeTab === 'assessments' && (
          <div className="space-y-4">
            {assessments.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">No assessments yet.</p>
            ) : (
              assessments.map((visit) => (
                <div key={visit.id} className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-sm font-medium text-gray-900">
                      {new Date(visit.date).toLocaleDateString('en-PH', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </h3>
                    <span className="text-xs text-gray-400">Assessment</span>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Symptoms:</span>{' '}
                      {(visit.assessment?.symptoms as string[])?.join(', ') || '—'}
                    </p>
                    {visit.assessment?.answers && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-xs font-medium text-gray-500 mb-2">Follow-up Answers:</p>
                        <div className="grid grid-cols-2 gap-2">
                          {Object.entries(visit.assessment.answers as Record<string, Record<string, string>>).map(([symptom, qa]) => (
                            <div key={symptom} className="bg-gray-50 rounded-lg p-2">
                              <p className="text-xs font-medium text-gray-700">{symptom}</p>
                              {Object.entries(qa).map(([q, a]) => (
                                <p key={q} className="text-xs text-gray-500">{q}: {a}</p>
                              ))}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Consultations Tab */}
        {activeTab === 'consultations' && (
          <div className="space-y-4">
            {consultations.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">No consultations yet.</p>
            ) : (
              consultations.map((visit) => (
                <div key={visit.id} className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">
                        {new Date(visit.date).toLocaleDateString('en-PH', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        Nurse: {visit.consultation?.nurse?.name || '—'}
                      </p>
                    </div>
                    <span className="text-xs text-gray-400">Consultation</span>
                  </div>

                  {/* Symptoms from assessment */}
                  {visit.assessment && (
                    <p className="text-sm text-gray-600 mb-3">
                      <span className="font-medium">Symptoms:</span>{' '}
                      {(visit.assessment.symptoms as string[])?.join(', ') || '—'}
                    </p>
                  )}

                  {/* Notes */}
                  {visit.consultation?.notes && (
                    <div className="bg-gray-50 rounded-lg p-3 mb-3">
                      <p className="text-xs font-medium text-gray-500 mb-1">Notes:</p>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{visit.consultation.notes}</p>
                    </div>
                  )}

                  {/* Medications */}
                  {visit.consultation?.medications && visit.consultation.medications.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-xs font-medium text-gray-500 mb-2">Medications:</p>
                      <div className="flex flex-wrap gap-2">
                        {visit.consultation.medications.map((med) => (
                          <span
                            key={med.id}
                            className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {med.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        <button
          onClick={() => router.back()}
          className="mt-4 text-sm text-gray-500 hover:text-gray-700"
        >
          ← Back to patients
        </button>
      </div>
    </div>
  )
}