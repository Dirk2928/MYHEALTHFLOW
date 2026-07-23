'use client'

import { useEffect, useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import ImportModal from '../../components/ImportModal'

type RecentVisit = {
  id: string
  date: string
  patient: { id: string; name: string; barangayId: string }
  assessment: { symptoms: any } | null
}

type DashboardData = {
  totalPatients: number
  todayVisits: number
  recentVisits: RecentVisit[]
}

function parseSymptoms(symptoms: any): string {
  if (!symptoms) return '—'
  if (Array.isArray(symptoms)) return symptoms.join(', ')
  if (typeof symptoms === 'string') {
    try {
      const parsed = JSON.parse(symptoms)
      return Array.isArray(parsed) ? parsed.join(', ') : '—'
    } catch {
      return '—'
    }
  }
  return '—'
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentTime, setCurrentTime] = useState<Date | null>(null)
  const [chartData, setChartData] = useState<any[]>([])
  const [showImport, setShowImport] = useState(false)
  const [showSignOut, setShowSignOut] = useState(false)

  const fetchDashboard = () => {
    fetch('/api/dashboard')
      .then((res) => res.json())
      .then((d) => {
        setData(d)
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchDashboard()
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
      <nav className="bg-white/95 backdrop-blur-md border-b border-white/20 px-6 py-3 flex items-center justify-between shadow-sm">
        <img src="/jru_logo.png" alt="MyHealthFlow+" className="h-9 w-auto" />
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-100 rounded-full px-3 py-1.5">
            <div className="w-7 h-7 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
              {session?.user?.name?.charAt(0) || '?'}
            </div>
            <span className="text-sm font-medium text-slate-700">{session?.user?.name}</span>
          </div>
          <button
            onClick={() => setShowSignOut(true)}
            className="text-sm font-medium text-slate-400 hover:text-red-500 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50"
          >
            Sign out
          </button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white drop-shadow-lg">Dashboard</h1>
          <p className="text-sm text-yellow-100/90 mt-1 drop-shadow">
            {currentTime
              ? currentTime.toLocaleDateString('en-PH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })
              : 'Loading...'}
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex items-center gap-3 text-white/70">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span className="text-sm">Loading dashboard...</span>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-white/30 p-6 shadow-xl hover:shadow-2xl transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-blue-600">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-slate-500">Total Patients</p>
                </div>
                <p className="text-4xl font-bold text-slate-800">{data?.totalPatients ?? 0}</p>
              </div>
              <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-white/30 p-6 shadow-xl hover:shadow-2xl transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-emerald-600">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-slate-500">Today's Visits</p>
                </div>
                <p className="text-4xl font-bold text-slate-800">{data?.todayVisits ?? 0}</p>
              </div>
            </div>

            {chartData.length > 0 && (
              <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-white/30 p-6 mb-8 shadow-xl">
                <h2 className="text-sm font-semibold text-slate-600 mb-4">Visits Per Day</h2>
                <div style={{ width: '100%', height: Math.max(chartData.length * 50, 200) }}>
                  <ResponsiveContainer>
                    <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 60, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                      <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} stroke="#94a3b8" />
                      <YAxis dataKey="date" type="category" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                      <Tooltip />
                      <Bar dataKey="visits" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-white/30 p-6 mb-8 shadow-xl">
              <h2 className="text-sm font-semibold text-slate-600 mb-4">Quick Actions</h2>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/dashboard/patients/new"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-medium px-4 py-2.5 rounded-xl hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/20 transition-all"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  Register Patient
                </Link>
                <Link
                  href="/dashboard/patients"
                  className="inline-flex items-center gap-2 bg-white text-slate-600 text-sm font-medium px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                  </svg>
                  View All Patients
                </Link>
                <button
                  onClick={() => setShowImport(true)}
                  className="inline-flex items-center gap-2 bg-white text-slate-600 text-sm font-medium px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                  Import Patients
                </button>
              </div>
            </div>

            <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-white/30 p-6 shadow-xl">
              <h2 className="text-sm font-semibold text-slate-600 mb-4">Recent Visits</h2>
              {data?.recentVisits.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-7 h-7 text-slate-300">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                    </svg>
                  </div>
                  <p className="text-slate-400 text-sm">No visits yet</p>
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="text-left pb-3 font-semibold text-slate-400 text-xs uppercase tracking-wider">Patient</th>
                      <th className="text-left pb-3 font-semibold text-slate-400 text-xs uppercase tracking-wider">Barangay ID</th>
                      <th className="text-left pb-3 font-semibold text-slate-400 text-xs uppercase tracking-wider">Symptoms</th>
                      <th className="text-left pb-3 font-semibold text-slate-400 text-xs uppercase tracking-wider">Date</th>
                      <th className="text-right pb-3 font-semibold text-slate-400 text-xs uppercase tracking-wider"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.recentVisits.map((visit) => (
                      <tr key={visit.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 font-semibold text-slate-800">{visit.patient.name}</td>
                        <td className="py-3 text-slate-500">{visit.patient.barangayId}</td>
                        <td className="py-3 text-slate-500">{parseSymptoms(visit.assessment?.symptoms)}</td>
                        <td className="py-3 text-slate-500">{new Date(visit.date).toLocaleDateString()}</td>
                        <td className="py-3 text-right">
                          <Link href={`/dashboard/patients/${visit.patient.id}`} className="text-blue-600 hover:bg-blue-50 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors">
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

        {showImport && (
          <ImportModal
            onClose={() => setShowImport(false)}
            onSuccess={fetchDashboard}
          />
        )}

        {showSignOut && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-in">
              <div className="text-center mb-6">
                <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7 text-red-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-slate-800">Sign Out</h3>
                <p className="text-sm text-slate-500 mt-1">Are you sure you want to sign out?</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowSignOut(false)}
                  className="flex-1 text-sm font-medium text-slate-600 px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  className="flex-1 text-sm font-medium text-white px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg shadow-red-500/20 transition-all"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}