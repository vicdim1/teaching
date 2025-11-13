import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateInvoiceNumber } from '@/lib/utils'

// GET all invoices
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('studentId')

    const where = studentId ? { studentId } : {}

    const invoices = await prisma.invoice.findMany({
      where,
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
      include: {
        student: true,
        sessions: true,
      },
    })

    return NextResponse.json(invoices)
  } catch (error) {
    console.error('Error fetching invoices:', error)
    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
      { status: 500 }
    )
  }
}

// POST create/generate invoice for a student for a specific month
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { studentId, month, year } = body

    if (!studentId || !month || !year) {
      return NextResponse.json(
        { error: 'Student ID, month, and year are required' },
        { status: 400 }
      )
    }

    // Check if invoice already exists
    const existingInvoice = await prisma.invoice.findFirst({
      where: {
        studentId,
        month: parseInt(month),
        year: parseInt(year),
      },
    })

    if (existingInvoice) {
      return NextResponse.json(
        { error: 'Invoice already exists for this period' },
        { status: 400 }
      )
    }

    // Get student
    const student = await prisma.student.findUnique({
      where: { id: studentId },
    })

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      )
    }

    // Get all sessions for this student in this month
    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1)
    const endDate = new Date(parseInt(year), parseInt(month), 0)

    const sessions = await prisma.session.findMany({
      where: {
        studentId,
        date: {
          gte: startDate,
          lte: endDate,
        },
        invoiceId: null, // Only uninvoiced sessions
      },
    })

    if (sessions.length === 0) {
      return NextResponse.json(
        { error: 'No sessions found for this period' },
        { status: 400 }
      )
    }

    // Calculate totals
    const totalHours = sessions.reduce((sum, session) => sum + session.duration, 0)
    const totalAmount = totalHours * student.hourlyRate

    // Generate invoice number
    const invoiceNumber = generateInvoiceNumber(
      parseInt(year),
      parseInt(month),
      studentId
    )

    // Create invoice
    const invoice = await prisma.invoice.create({
      data: {
        studentId,
        invoiceNumber,
        month: parseInt(month),
        year: parseInt(year),
        totalHours,
        hourlyRate: student.hourlyRate,
        totalAmount,
        status: 'pending',
      },
      include: {
        student: true,
        sessions: true,
      },
    })

    // Link sessions to invoice
    await prisma.session.updateMany({
      where: {
        id: {
          in: sessions.map((s) => s.id),
        },
      },
      data: {
        invoiceId: invoice.id,
      },
    })

    return NextResponse.json(invoice, { status: 201 })
  } catch (error) {
    console.error('Error creating invoice:', error)
    return NextResponse.json(
      { error: 'Failed to create invoice' },
      { status: 500 }
    )
  }
}
