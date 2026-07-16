import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { status } = body

    const followUp = await prisma.followUp.update({
      where: { id },
      data: { status },
    })

    return NextResponse.json(followUp)
  } catch (error) {
    console.error('PATCH /api/follow-ups/[id] error:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.followUp.delete({ where: { id } })
    return NextResponse.json({ message: 'Follow-up deleted' })
  } catch (error) {
    console.error('DELETE /api/follow-ups/[id] error:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}