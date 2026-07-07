import Link from 'next/link'

export default function Navbar() {
  return (
    <nav className="bg-white border-b border-gray-200 px-8 py-4 flex items-center gap-6">
      <Link href="/dashboard" className="text-base font-semibold text-gray-900">
        MyHealthFlow+
      </Link>
      <Link href="/dashboard/patients" className="text-sm text-gray-600 hover:text-gray-900">
        Patients
      </Link>
    </nav>
  )
}