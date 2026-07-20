'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

type RecentVisit = {
  id: string
  date: string
  patient: { id: string; name: string; barangayId: string }
  assessment: { symptoms: string[] } | null
}

type DashboardData = {
  totalPatients: number
  todayVisits: number
  recentVisits: RecentVisit[]
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentTime, setCurrentTime] = useState<Date | null>(null)
  const [chartData, setChartData] = useState<any[]>([])

  useEffect(() => {
    fetch('/api/dashboard')
      .then((res) => res.json())
      .then((d) => {
        setData(d)
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    fetch('/api/dashboard/daily')
      .then((res) => res.json())
      .then((d) => setChartData(d || []))
      .catch(() => setChartData([]))
  }, [])

  useEffect(() => {
    setCurrentTime(new Date())
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="min-h-screen bg-cover bg-center bg-fixed" style={{ backgroundImage: "url('/jru_login.jpg')" }}>
      <nav className="bg-white/90 backdrop-blur-sm border-b border-gray-200 px-8 py-4 flex items-center justify-between">
        <img src="/jru_logo.png" alt="MyHealthFlow+" className="h-10 w-auto" />
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-700">
            {(session?.user as any)?.role === 'nurse' ? '' : '🔧'} {session?.user?.name}
          </span>
          <Link href="/api/auth/signout" className="text-sm text-red-500 hover:text-red-700">Sign out</Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto p-8">
        <h1 className="text-2xl font-semibold text-white mb-1 drop-shadow-lg">Dashboard</h1>
        <p className="text-sm text-yellow-100 mb-8 drop-shadow">
          {currentTime
            ? currentTime.toLocaleDateString('en-PH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })
            : 'Loading...'}
        </p>

        {loading ? (
          <p className="text-sm text-white">Loading dashboard...</p>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-white/90 backdrop-blur-sm rounded-xl border border-white/50 p-5 shadow-lg">
                <p className="text-sm text-gray-500 mb-1">Total Patients</p>
                <p className="text-3xl font-bold text-gray-900">{data?.totalPatients ?? 0}</p>
              </div>
              <div className="bg-white/90 backdrop-blur-sm rounded-xl border border-white/50 p-5 shadow-lg">
                <p className="text-sm text-gray-500 mb-1">Today's Visits</p>
                <p className="text-3xl font-bold text-gray-900">{data?.todayVisits ?? 0}</p>
              </div>
            </div>

            {chartData.length >= 0 && (
              <div className="bg-white/90 backdrop-blur-sm rounded-xl border border-white/50 p-6 mb-6 shadow-lg">
                <h2 className="text-sm font-medium text-gray-700 mb-4">Visits Per Day</h2>
                <div style={{ width: '100%', height: Math.max(chartData.length * 50, 200) }}>
                  <ResponsiveContainer>
                    <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 60, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
                      <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} stroke="#6b7280" />
                      <YAxis dataKey="date" type="category" tick={{ fontSize: 12 }} stroke="#6b7280" />
                      <Tooltip />
                      <Bar dataKey="visits" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            <div className="bg-white/90 backdrop-blur-sm rounded-xl border border-white/50 p-6 mb-6 shadow-lg">
              <h2 className="text-sm font-medium text-gray-700 mb-4">Quick Actions</h2>
              <div className="flex flex-wrap gap-3">
                <Link href="/dashboard/patients/new" className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">+ Register Patient</Link>
                <Link href="/dashboard/patients" className="bg-white text-gray-700 text-sm font-medium px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors">View All Patients</Link>
              </div>
            </div>

            <div className="bg-white/90 backdrop-blur-sm rounded-xl border border-white/50 p-6 shadow-lg">
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
                        <td className="py-3 text-gray-500">{visit.assessment ? (visit.assessment.symptoms as string[]).join(', ') : '—'}</td>
                        <td className="py-3 text-gray-500">{new Date(visit.date).toLocaleDateString()}</td>
                        <td className="py-3"><Link href={`/dashboard/patients/${visit.patient.id}`} className="text-blue-600 hover:underline">View</Link></td>
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