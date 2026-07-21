'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Navbar from '../../../components/Navbar'

type Patient = {
  id: string
  name: string
  dob: string
  barangayId: string
  contactNo: string | null
}

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch('/api/patients')
      .then((res) => res.json())
      .then((data) => {
        setPatients(data)
        setLoading(false)
      })
  }, [])

  const filtered = patients.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.barangayId.toLowerCase().includes(search.toLowerCase())
  )

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this patient?')) return
    await fetch(`/api/patients/${id}`, { method: 'DELETE' })
    setPatients(patients.filter((p) => p.id !== id))
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Patients</h1>
              <p className="text-sm text-slate-400 mt-1">{patients.length} registered patients</p>
            </div>
            <Link
              href="/dashboard/patients/new"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/20 transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Add Patient
            </Link>
          </div>

          <div className="relative mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="text"
              placeholder="Search by name or barangay ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all"
            />
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="flex items-center gap-3 text-slate-400">
                <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm">Loading patients...</span>
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-16 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-8 h-8 text-slate-300">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                </svg>
              </div>
              <p className="text-slate-400 text-sm font-medium">No patients found</p>
              {search && <p className="text-slate-300 text-xs mt-1">Try a different search term</p>}
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100">
                      <th className="text-left px-6 py-4 font-semibold text-slate-500 text-xs uppercase tracking-wider">Name</th>
                      <th className="text-left px-6 py-4 font-semibold text-slate-500 text-xs uppercase tracking-wider">Barangay ID</th>
                      <th className="text-left px-6 py-4 font-semibold text-slate-500 text-xs uppercase tracking-wider">Date of Birth</th>
                      <th className="text-left px-6 py-4 font-semibold text-slate-500 text-xs uppercase tracking-wider">Contact</th>
                      <th className="text-right px-6 py-4 font-semibold text-slate-500 text-xs uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((patient, index) => (
                      <tr 
                        key={patient.id} 
                        className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-gradient-to-br from-blue-400 to-blue-500 rounded-lg flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                              {patient.name.charAt(0)}
                            </div>
                            <span className="font-semibold text-slate-800">{patient.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-slate-500 font-medium">{patient.barangayId}</span>
                        </td>
                        <td className="px-6 py-4 text-slate-500">
                          {new Date(patient.dob).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-sm ${patient.contactNo ? 'text-slate-600' : 'text-slate-300 italic'}`}>
                            {patient.contactNo || '—'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-1">
                            <Link
                              href={`/dashboard/patients/${patient.id}`}
                              className="inline-flex items-center gap-1 text-blue-600 hover:bg-blue-50 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              View
                            </Link>
                            <Link
                              href={`/dashboard/patients/${patient.id}/edit`}
                              className="inline-flex items-center gap-1 text-slate-500 hover:bg-slate-100 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                              </svg>
                              Edit
                            </Link>
                            <button
                              onClick={() => handleDelete(patient.id)}
                              className="inline-flex items-center gap-1 text-red-500 hover:bg-red-50 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                              </svg>
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <button
            onClick={() => window.history.back()}
            className="mt-8 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-600 transition-colors font-medium"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Back to Dashboard
          </button>
        </div>
      </div>
    </>
  )
}
