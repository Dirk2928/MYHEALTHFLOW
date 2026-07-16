'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Navbar from '../../../components/Navbar'

type FollowUp = {
  id: string
  date: string
  reason: string
  status: string
  isOverdue: boolean
  patient: {
    id: string
    name: string
    barangayId: string
  }
}

export default function FollowUpsPage() {
  const [followUps, setFollowUps] = useState<FollowUp[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchFollowUps()
  }, [filter])

  const fetchFollowUps = async () => {
    setLoading(true)
    const res = await fetch(`/api/follow-ups?status=${filter}`)
    const data = await res.json()
    setFollowUps(data)
    setLoading(false)
  }

  const handleMarkComplete = async (id: string) => {
    await fetch(`/api/follow-ups/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'completed' }),
    })
    fetchFollowUps()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this follow-up?')) return
    await fetch(`/api/follow-ups/${id}`, { method: 'DELETE' })
    fetchFollowUps()
  }

  const getStatusBadge = (followUp: FollowUp) => {
    if (followUp.status === 'completed') {
      return 'bg-green-100 text-green-700'
    }
    if (followUp.isOverdue) {
      return 'bg-red-100 text-red-700'
    }
    return 'bg-yellow-100 text-yellow-700'
  }

  const getStatusLabel = (followUp: FollowUp) => {
    if (followUp.status === 'completed') return 'Completed'
    if (followUp.isOverdue) return 'Overdue'
    return 'Pending'
  }

  const pendingCount = followUps.filter((f) => f.status === 'pending' && !f.isOverdue).length
  const overdueCount = followUps.filter((f) => f.isOverdue).length

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Follow-Ups</h1>
              <p className="text-sm text-gray-500 mt-1">
                {overdueCount > 0 && (
                  <span className="text-red-600 font-medium">{overdueCount} overdue</span>
                )}
                {overdueCount > 0 && pendingCount > 0 && ' · '}
                {pendingCount > 0 && (
                  <span className="text-yellow-600 font-medium">{pendingCount} pending</span>
                )}
              </p>
            </div>
          </div>

          <div className="flex gap-2 mb-6">
            {[
              { key: 'all', label: 'All' },
              { key: 'pending', label: 'Pending' },
              { key: 'overdue', label: 'Overdue' },
              { key: 'completed', label: 'Completed' },
            ].map((btn) => (
              <button
                key={btn.key}
                onClick={() => setFilter(btn.key)}
                className={`text-sm font-medium px-4 py-2 rounded-lg transition-colors ${
                  filter === btn.key
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>

          {loading ? (
            <p className="text-sm text-gray-500">Loading follow-ups...</p>
          ) : followUps.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <p className="text-gray-500 text-sm">No follow-ups found.</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Patient</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Barangay ID</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Reason</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {followUps.map((f) => (
                    <tr key={f.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">
                        <Link href={`/dashboard/patients/${f.patient.id}`} className="text-blue-600 hover:underline">
                          {f.patient.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{f.patient.barangayId}</td>
                      <td className="px-4 py-3 text-gray-600">
                        {new Date(f.date).toLocaleDateString('en-PH', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{f.reason}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusBadge(f)}`}>
                          {getStatusLabel(f)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          {f.status === 'pending' && (
                            <button
                              onClick={() => handleMarkComplete(f.id)}
                              className="text-green-600 hover:underline text-xs font-medium"
                            >
                              Mark Complete
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(f.id)}
                            className="text-red-500 hover:underline text-xs"
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