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
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">Patients</h1>
            <Link
              href="/dashboard/patients/new"
              className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              + Add Patient
            </Link>
          </div>

          <input
            type="text"
            placeholder="Search by name or barangay ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {loading ? (
            <p className="text-gray-500 text-sm">Loading patients...</p>
          ) : filtered.length === 0 ? (
            <p className="text-gray-500 text-sm">No patients found.</p>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Barangay ID</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Date of Birth</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Contact</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((patient) => (
                    <tr key={patient.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{patient.name}</td>
                      <td className="px-4 py-3 text-gray-600">{patient.barangayId}</td>
                      <td className="px-4 py-3 text-gray-600">
                        {new Date(patient.dob).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{patient.contactNo ?? '—'}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <Link
                            href={`/dashboard/patients/${patient.id}`}
                            className="text-blue-600 hover:underline"
                          >
                            View
                          </Link>
                          <Link
                            href={`/dashboard/patients/${patient.id}/edit`}
                            className="text-gray-600 hover:underline"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDelete(patient.id)}
                            className="text-red-500 hover:underline"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  )
}