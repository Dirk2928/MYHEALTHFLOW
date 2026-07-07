'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

type RecentVisit = {
  id: string
  date: string
  patient: { id: string; name: string; barangayId: string }
  assessment: { symptoms: string[] } | null
}

type DashboardData = {
  totalPatients: number
  todayVisits: number
  pendingFollowUps: number
  overdueFollowUps: number
  recentVisits: RecentVisit[]
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/dashboard')
      .then((res) => res.json())
      .then((d) => {
        setData(d)
        setLoading(false)
      })
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top navbar */}
      <nav className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
        <span className="text-base font-semibold text-gray-900">MyHealthFlow+ Lite</span>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">
            {(session?.user as any)?.role === 'nurse' ? '👩‍⚕️' : '🔧'} {session?.user?.name}
          </span>
          <Link
            href="/api/auth/signout"
            className="text-sm text-red-500 hover:text-red-700"
          >
            Sign out
          </Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto p-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">Dashboard</h1>
        <p className="text-sm text-gray-500 mb-8">
          {new Date().toLocaleDateString('en-PH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>

        {loading ? (
          <p className="text-sm text-gray-500">Loading dashboard...</p>
        ) : (
          <>
            {/* Stats cards */}
            <div className="grid grid-cols-2 gap-4 mb-8 sm:grid-cols-4">
              {[
                { label: 'Total Patients', value: data?.totalPatients ?? 0, color: 'blue' },
                { label: "Today's Visits", value: data?.todayVisits ?? 0, color: 'green' },
                { label: 'Pending Follow-ups', value: data?.pendingFollowUps ?? 0, color: 'yellow' },
                { label: 'Overdue Follow-ups', value: data?.overdueFollowUps ?? 0, color: 'red' },
              ].map((card) => (
                <div
                  key={card.label}
                  className="bg-white rounded-xl border border-gray-200 p-5"
                >
                  <p className="text-sm text-gray-500 mb-1">{card.label}</p>
                  <p className="text-3xl font-bold text-gray-900">{card.value}</p>
                </div>
              ))}
            </div>

            {/* Quick actions */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
              <h2 className="text-sm font-medium text-gray-700 mb-4">Quick Actions</h2>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/dashboard/patients/new"
                  className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  + Register Patient
                </Link>
                <Link
                  href="/dashboard/patients"
                  className="bg-white text-gray-700 text-sm font-medium px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  View All Patients
                </Link>
              </div>
            </div>

            {/* Recent visits */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-sm font-medium text-gray-700 mb-4">Recent Visits</h2>
              {data?.recentVisits.length === 0 ? (
                <p className="text-sm text-gray-400">No visits yet.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead className="border-b border-gray-100">
                    <tr>
                      <th className="text-left pb-2 font-medium text-gray-500">Patient</th>
                      <th className="text-left pb-2 font-medium text-gray-500">Barangay ID</th>
                      <th className="text-left pb-2 font-medium text-gray-500">Symptoms</th>
                      <th className="text-left pb-2 font-medium text-gray-500">Date</th>
                      <th className="text-left pb-2 font-medium text-gray-500"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.recentVisits.map((visit) => (
                      <tr key={visit.id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-3 font-medium text-gray-900">{visit.patient.name}</td>
                        <td className="py-3 text-gray-500">{visit.patient.barangayId}</td>
                        <td className="py-3 text-gray-500">
                          {visit.assessment
                            ? (visit.assessment.symptoms as string[]).join(', ')
                            : '—'}
                        </td>
                        <td className="py-3 text-gray-500">
                          {new Date(visit.date).toLocaleDateString()}
                        </td>
                        <td className="py-3">
                          <Link
                            href={`/dashboard/patients/${visit.patient.id}`}
                            className="text-blue-600 hover:underline"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}