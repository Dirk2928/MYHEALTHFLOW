import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'

export async function GET() {
  try {
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const todayEnd = new Date(todayStart)
    todayEnd.setDate(todayEnd.getDate() + 1)

    const totalPatients = await prisma.patient.count()

    const allVisits = await prisma.visit.findMany({
      orderBy: { date: 'desc' },
      include: {
        patient: true,
        assessment: true,
      },
    })

    const todayVisits = allVisits.filter((v) => {
      const vDate = new Date(v.date)
      return vDate >= todayStart && vDate < todayEnd
    }).length

    const recentVisits = allVisits.slice(0, 5)

    return NextResponse.json({
      totalPatients,
      todayVisits,
      recentVisits,
    })
  } catch (error) {
    console.error('GET /api/dashboard error:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}