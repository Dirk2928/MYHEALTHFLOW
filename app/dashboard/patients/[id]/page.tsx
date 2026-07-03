'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

type Patient = {
  id: string
  name: string
  dob: string
  barangayId: string
  address: string | null
  contactNo: string | null
  emergencyContact: string | null
  createdAt: string
}

export default function PatientProfilePage() {
  const { id } = useParams()
  const router = useRouter()
  const [patient, setPatient] = useState<Patient | null>(null)
  const [loading, setLoading] = useState(true)

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

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-xl mx-auto">
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
            <button
              onClick={handleDelete}
              className="bg-red-500 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>

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