import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'

// GET all patients
export async function GET() {
  try {
    const patients = await prisma.patient.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(patients)
  } catch (error) {
    console.error('GET /api/patients error:', error)
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    )
  }
}

// POST new patient
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, dob, barangayId, address, contactNo, emergencyContact } = body

    const patient = await prisma.patient.create({
      data: {
        name,
        dob: new Date(dob),
        barangayId,
        address,
        contactNo,
        emergencyContact,
      },
    })
    return NextResponse.json(patient, { status: 201 })
  } catch (error) {
    console.error('POST /api/patients error:', error)
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    )
  }
}