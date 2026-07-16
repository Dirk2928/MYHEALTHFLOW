import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { patientId, date, reason } = body

    const followUp = await prisma.followUp.create({
      data: {
        patientId,
        date: new Date(date),
        reason: reason || 'Follow-up check',
        status: 'pending',
      },
    })

    return NextResponse.json(followUp, { status: 201 })
  } catch (error) {
    console.error('POST /api/follow-ups error:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const where: any = {}
    if (status && status !== 'all') {
      if (status === 'overdue') {
        where.status = 'pending'
        where.date = { lt: new Date() }
      } else {
        where.status = status
      }
    }

    const followUps = await prisma.followUp.findMany({
      where,
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            barangayId: true,
          },
        },
      },
      orderBy: { date: 'asc' },
    })

    const result = followUps.map((f) => ({
      ...f,
      isOverdue: f.status === 'pending' && new Date(f.date) < new Date(),
    }))

    return NextResponse.json(result)
  } catch (error) {
    console.error('GET /api/follow-ups error:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}