import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'

export async function GET() {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Total patients
    const totalPatients = await prisma.patient.count()

    // Today's visits
    const todayVisits = await prisma.visit.count({
      where: {
        date: {
          gte: today,
          lt: tomorrow,
        },
      },
    })

    // Recent visits with patient info
    const recentVisits = await prisma.visit.findMany({
      take: 5,
      orderBy: { date: 'desc' },
      include: {
        patient: true,
        assessment: true,
      },
    })

    // Pending follow-ups
    const pendingFollowUps = await prisma.followUp.count({
      where: { status: 'pending' },
    })

    // Overdue follow-ups
    const overdueFollowUps = await prisma.followUp.count({
      where: {
        status: 'pending',
        date: { lt: today },
      },
    })

    return NextResponse.json({
      totalPatients,
      todayVisits,
      pendingFollowUps,
      overdueFollowUps,
      recentVisits,
    })
  } catch (error) {
    console.error('GET /api/dashboard error:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}