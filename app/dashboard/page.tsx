import { getServerSession } from 'next-auth'
import { authOptions } from '../../lib/auth'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-semibold text-gray-900">
        Welcome, {session?.user?.name}
      </h1>
      <p className="text-sm text-gray-500 mt-1">
        Role: {(session?.user as any)?.role}
      </p>
    </div>
  )
}