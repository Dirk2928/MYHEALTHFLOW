import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const patient = await prisma.patient.findUnique({
      where: { id },
      include: { 
        visits: {
          include: {
            assessment: true,
            consultation: {
              include: {
                medications: true,
                nurse: true,
              },
            },
          },
          orderBy: { date: 'desc' },
        },
        followUps: true,
      },
    })
    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
    }

    const parsedPatient = {
      ...patient,
      visits: patient.visits.map((visit: any) => ({
        ...visit,
        assessment: visit.assessment ? {
          ...visit.assessment,
          symptoms: typeof visit.assessment.symptoms === 'string' 
            ? JSON.parse(visit.assessment.symptoms) 
            : visit.assessment.symptoms,
          answers: typeof visit.assessment.answers === 'string' 
            ? JSON.parse(visit.assessment.answers) 
            : visit.assessment.answers,
        } : null,
      })),
    }

    return NextResponse.json(parsedPatient)
  } catch (error) {
    console.error('GET /api/patients/[id] error:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, dob, barangayId, address, contactNo, emergencyContact } = body

    const patient = await prisma.patient.update({
      where: { id },
      data: {
        name,
        dob: new Date(dob),
        barangayId,
        address,
        contactNo,
        emergencyContact,
      },
    })
    return NextResponse.json(patient)
  } catch (error) {
    console.error('PUT /api/patients/[id] error:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    await prisma.followUp.deleteMany({ where: { patientId: id } })
    await prisma.medication.deleteMany({ where: { consultation: { visit: { patientId: id } } } })
    await prisma.consultation.deleteMany({ where: { visit: { patientId: id } } })
    await prisma.symptomAssessment.deleteMany({ where: { visit: { patientId: id } } })
    await prisma.visit.deleteMany({ where: { patientId: id } })
    await prisma.patient.delete({ where: { id } })
    
    return NextResponse.json({ message: 'Patient deleted' })
  } catch (error) {
    console.error('DELETE /api/patients/[id] error:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}