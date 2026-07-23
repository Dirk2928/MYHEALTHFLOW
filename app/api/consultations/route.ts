import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../lib/auth'
import { prisma } from '../../../lib/prisma'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { patientId, symptoms, answers, notes, medications } = body

    const session = await getServerSession(authOptions)
    
    const userEmail = session?.user?.email
    const userId = (session?.user as any)?.id

    let nurse = null
    if (userId) {
      nurse = await prisma.nurse.findUnique({ where: { id: userId } })
    }
    if (!nurse && userEmail) {
      nurse = await prisma.nurse.findUnique({ where: { email: userEmail } })
    }

    if (!nurse) {
      return NextResponse.json({ 
        error: 'Nurse not found',
        sessionExists: !!session,
        userEmail,
        userId 
      }, { status: 401 })
    }

    const visit = await prisma.visit.create({
      data: { patientId },
    })

    const assessment = await prisma.symptomAssessment.create({
      data: {
        visitId: visit.id,
        symptoms: JSON.stringify(symptoms),
        answers: JSON.stringify(answers),
      },
    })

    const consultation = await prisma.consultation.create({
      data: {
        visitId: visit.id,
        nurseId: nurse.id,
        notes: notes || '',
        medications: {
          create: medications.map((med: any) => ({
            name: med.name || med.label || String(med),
            notes: med.notes || null,
          })),
        },
      },
      include: {
        medications: true,
      },
    })

    return NextResponse.json({ visit, assessment, consultation }, { status: 201 })
  } catch (error) {
    console.error('POST /api/consultations error:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}