import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { patientId, symptoms, answers } = body

    const visit = await prisma.visit.create({
      data: {
        patientId,
      },
    })

    
    const assessment = await prisma.symptomAssessment.create({
      data: {
        visitId: visit.id,
        symptoms,
        answers,
      },
    })

    return NextResponse.json({ visit, assessment }, { status: 201 })
  } catch (error) {
    console.error('POST /api/assessments error:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}