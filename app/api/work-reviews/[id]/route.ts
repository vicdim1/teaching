import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET single work review
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const workReview = await prisma.workReview.findUnique({
      where: { id },
      include: { student: true },
    })

    if (!workReview) {
      return NextResponse.json(
        { error: 'Work review not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(workReview)
  } catch (error) {
    console.error('Error fetching work review:', error)
    return NextResponse.json(
      { error: 'Failed to fetch work review' },
      { status: 500 }
    )
  }
}

// PUT update work review (mainly for tutor notes)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { tutorNotes } = body

    const workReview = await prisma.workReview.update({
      where: { id },
      data: { tutorNotes },
      include: { student: true },
    })

    return NextResponse.json(workReview)
  } catch (error) {
    console.error('Error updating work review:', error)
    return NextResponse.json(
      { error: 'Failed to update work review' },
      { status: 500 }
    )
  }
}

// DELETE work review
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.workReview.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting work review:', error)
    return NextResponse.json(
      { error: 'Failed to delete work review' },
      { status: 500 }
    )
  }
}
