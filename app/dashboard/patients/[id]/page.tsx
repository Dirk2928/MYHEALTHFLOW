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
      .catch((error) => {
        console.error('Error fetching patient:', error)
        setLoading(false)
      })
  }, [id])

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this patient?')) return
    try {
      const res = await fetch(`/api/patients/${id}`, { method: 'DELETE' })
      if (res.ok) {
        router.push('/dashboard/patients')
      } else {
        alert('Failed to delete patient')
      }
    } catch (error) {
      console.error('Error deleting patient:', error)
      alert('An error occurred')
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
      <div className="flex items-center gap-3 text-slate-400">
        <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm">Loading patient...</span>
      </div>
    </div>
  )

  if (!patient) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
      <p className="text-slate-400 text-sm">Patient not found.</p>
    </div>
  )

  const assessments = patient.visits.filter(v => v.assessment)
  const consultations = patient.visits.filter(v => v.consultation)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-500/20">
                {patient.name.charAt(0)}
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800">{patient.name}</h1>
                <p className="text-sm text-slate-400">ID: {patient.barangayId}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link
                href={`/dashboard/patients/${id}/edit`}
                className="inline-flex items-center gap-1.5 bg-white border border-slate-200 text-slate-600 text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                </svg>
                Edit
              </Link>
              <Link
                href={`/dashboard/patients/${id}/consult`}
                className="inline-flex items-center gap-1.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-medium px-4 py-2.5 rounded-xl hover:from-emerald-600 hover:to-emerald-700 shadow-lg shadow-emerald-500/20 transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                New Consultation
              </Link>
              <button
                onClick={handleDelete}
                className="inline-flex items-center gap-1.5 bg-white border border-red-200 text-red-500 text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-red-50 hover:border-red-300 transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
                Delete
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-white rounded-xl border border-slate-100 p-1.5 shadow-sm">
          {[
            { key: 'info', label: 'Overview', icon: 'M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z' },
            { key: 'assessments', label: `Assessments (${assessments.length})`, icon: 'M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z' },
            { key: 'consultations', label: `Consultations (${consultations.length})`, icon: 'M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m5.231 13.481L15 17.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v16.5c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9zm3.75 11.625a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`flex-1 flex items-center justify-center gap-2 text-sm font-medium px-4 py-2.5 rounded-lg transition-all ${
                activeTab === tab.key
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d={tab.icon} />
              </svg>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Patient Info Tab */}
        {activeTab === 'info' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-6">Personal Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: 'Barangay ID', value: patient.barangayId },
                  { label: 'Date of Birth', value: new Date(patient.dob).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' }) },
                  { label: 'Address', value: patient.address || '—' },
                  { label: 'Contact Number', value: patient.contactNo || '—' },
                  { label: 'Emergency Contact', value: patient.emergencyContact || '—' },
                  { label: 'Registered On', value: new Date(patient.createdAt).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' }) },
                ].map((item) => (
                  <div key={item.label} className="bg-slate-50 rounded-xl p-4">
                    <p className="text-xs font-medium text-slate-400 mb-1">{item.label}</p>
                    <p className="text-sm font-semibold text-slate-800">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 text-center">
                <p className="text-3xl font-bold text-blue-600">{patient.visits.length}</p>
                <p className="text-xs font-medium text-slate-400 mt-1">Total Visits</p>
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 text-center">
                <p className="text-3xl font-bold text-emerald-600">{assessments.length}</p>
                <p className="text-xs font-medium text-slate-400 mt-1">Assessments</p>
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 text-center">
                <p className="text-3xl font-bold text-purple-600">{consultations.length}</p>
                <p className="text-xs font-medium text-slate-400 mt-1">Consultations</p>
              </div>
            </div>
          </div>
        )}

        {/* Assessments Tab */}
        {activeTab === 'assessments' && (
          <div className="space-y-4">
            {assessments.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-8 h-8 text-slate-300">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                  </svg>
                </div>
                <p className="text-slate-400 text-sm font-medium">No assessments yet</p>
              </div>
            ) : (
              assessments.map((visit) => (
                <div key={visit.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-emerald-600">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          {new Date(visit.date).toLocaleDateString('en-PH', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                        </p>
                        <p className="text-xs text-slate-400">{new Date(visit.date).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>
                    <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">Assessment</span>
                  </div>
                  <div className="ml-13">
                    <p className="text-sm text-slate-600 mb-3">
                      <span className="font-medium text-slate-700">Symptoms:</span>{' '}
                      {(visit.assessment?.symptoms as string[])?.join(', ') || '—'}
                    </p>
                    {visit.assessment?.answers && (
                      <div className="bg-slate-50 rounded-xl p-4">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Follow-up Answers</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {Object.entries(visit.assessment.answers as Record<string, Record<string, string>>).map(([symptom, qa]) => (
                            <div key={symptom} className="bg-white rounded-lg p-3 border border-slate-100">
                              <p className="text-xs font-semibold text-slate-700 capitalize mb-2">{symptom}</p>
                              {Object.entries(qa).map(([q, a]) => (
                                <div key={q} className="flex justify-between text-xs py-0.5">
                                  <span className="text-slate-400 capitalize">{q}:</span>
                                  <span className="font-medium text-slate-600">{a}</span>
                                </div>
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
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-8 h-8 text-slate-300">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m5.231 13.481L15 17.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v16.5c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9zm3.75 11.625a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                  </svg>
                </div>
                <p className="text-slate-400 text-sm font-medium">No consultations yet</p>
              </div>
            ) : (
              consultations.map((visit) => (
                <div key={visit.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-purple-600">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m5.231 13.481L15 17.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v16.5c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9zm3.75 11.625a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          {new Date(visit.date).toLocaleDateString('en-PH', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-slate-400">{new Date(visit.date).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })}</span>
                          <span className="text-slate-300">·</span>
                          <span className="text-xs text-slate-500">Nurse: {visit.consultation?.nurse?.name || '—'}</span>
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-medium text-purple-600 bg-purple-50 px-3 py-1 rounded-full">Consultation</span>
                  </div>
                  <div className="ml-13">
                    {visit.assessment && (
                      <p className="text-sm text-slate-600 mb-3">
                        <span className="font-medium text-slate-700">Symptoms:</span>{' '}
                        {(visit.assessment.symptoms as string[])?.join(', ') || '—'}
                      </p>
                    )}
                    {visit.consultation?.notes && (
                      <div className="bg-slate-50 rounded-xl p-4 mb-3">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Clinical Notes</p>
                        <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{visit.consultation.notes}</p>
                      </div>
                    )}
                    {visit.consultation?.medications && visit.consultation.medications.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Medications & Advice</p>
                        <div className="flex flex-wrap gap-2">
                          {visit.consultation.medications.map((med) => (
                            <span
                              key={med.id}
                              className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100"
                            >
                              {med.name}
                            </span>
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

        <button
          onClick={() => router.push('/dashboard')}
          className="mt-8 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-600 transition-colors font-medium"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Back to Dashboard
        </button>
      </div>
    </div>
  )
}