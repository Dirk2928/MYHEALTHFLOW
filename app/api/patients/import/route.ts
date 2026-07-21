import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import * as XLSX from 'xlsx'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    const buffer = await file.arrayBuffer()
    const workbook = XLSX.read(buffer, { type: 'array' })
    const sheet = workbook.Sheets[workbook.SheetNames[0]]
    const rows = XLSX.utils.sheet_to_json(sheet)

    let imported = 0
    let skipped = 0
    const errors: string[] = []

    for (const row of rows as any[]) {
      try {
        const name = row.name || row.Name || row.NAME
        const dob = row.dob || row.DOB || row.date_of_birth || row.birthdate
        const barangayId = row.barangayId || row.barangay_id || row.BarangayID || row.student_id
        const address = row.address || row.Address || null
        const contactNo = row.contactNo || row.contact_no || row.ContactNo || row.phone || null
        const emergencyContact = row.emergencyContact || row.emergency_contact || row.EmergencyContact || null

        if (!name || !dob || !barangayId) {
          skipped++
          errors.push(`Row missing required fields: ${JSON.stringify(row)}`)
          continue
        }

        const parsedDate = new Date(dob)
        if (isNaN(parsedDate.getTime())) {
          skipped++
          errors.push(`Invalid date for ${name}: ${dob}`)
          continue
        }

        const exists = await prisma.patient.findFirst({
          where: { barangayId },
        })

        if (exists) {
          skipped++
          continue
        }

        await prisma.patient.create({
          data: {
            name,
            dob: parsedDate,
            barangayId,
            address: address || null,
            contactNo: contactNo || null,
            emergencyContact: emergencyContact || null,
          },
        })

        imported++
      } catch (e) {
        skipped++
        errors.push(`Error importing row: ${String(e)}`)
      }
    }

    return NextResponse.json({
      imported,
      skipped,
      total: rows.length,
      errors: errors.slice(0, 5),
    })
  } catch (error) {
    console.error('POST /api/patients/import error:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}