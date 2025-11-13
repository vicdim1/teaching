import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET single invoice
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        student: true,
        sessions: {
          orderBy: { date: 'asc' },
        },
      },
    })

    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(invoice)
  } catch (error) {
    console.error('Error fetching invoice:', error)
    return NextResponse.json(
      { error: 'Failed to fetch invoice' },
      { status: 500 }
    )
  }
}

// PUT update invoice (mainly for status changes)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { status, notes } = body

    const updateData: any = {}
    if (status) {
      updateData.status = status
      if (status === 'sent' && !updateData.sentAt) {
        updateData.sentAt = new Date()
      }
      if (status === 'paid') {
        updateData.paidAt = new Date()
      }
    }
    if (notes !== undefined) {
      updateData.notes = notes
    }

    const invoice = await prisma.invoice.update({
      where: { id },
      data: updateData,
      include: {
        student: true,
        sessions: true,
      },
    })

    return NextResponse.json(invoice)
  } catch (error) {
    console.error('Error updating invoice:', error)
    return NextResponse.json(
      { error: 'Failed to update invoice' },
      { status: 500 }
    )
  }
}

// DELETE invoice
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // First, unlink sessions
    await prisma.session.updateMany({
      where: { invoiceId: id },
      data: { invoiceId: null },
    })

    // Then delete invoice
    await prisma.invoice.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting invoice:', error)
    return NextResponse.json(
      { error: 'Failed to delete invoice' },
      { status: 500 }
    )
  }
}
