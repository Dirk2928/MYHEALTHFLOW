import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'

export async function GET() {
  try {
    const visits = await prisma.visit.findMany({
      select: { date: true },
      orderBy: { date: 'asc' },
    })

    const grouped: Record<string, number> = {}
    visits.forEach((v) => {
      const dateKey = new Date(v.date).toLocaleDateString('en-PH', {
        month: 'short',
        day: 'numeric',
      })
      grouped[dateKey] = (grouped[dateKey] || 0) + 1
    })

    const data = Object.entries(grouped)
      .slice(-14)
      .map(([date, visits]) => ({ date, visits }))

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}