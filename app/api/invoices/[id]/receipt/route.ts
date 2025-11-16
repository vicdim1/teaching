import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendReceiptEmail } from '@/lib/email/invoice-email'
import { getMonthName } from '@/lib/utils'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Check if email is configured
    if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      return NextResponse.json(
        { error: 'Email is not configured. Please set up EMAIL_HOST, EMAIL_USER, and EMAIL_PASSWORD in your .env file.' },
        { status: 500 }
      )
    }

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

    if (invoice.status !== 'paid' || !invoice.paidAt) {
      return NextResponse.json(
        { error: 'Invoice must be marked as paid before sending a receipt' },
        { status: 400 }
      )
    }

    // Determine recipient email
    const recipientEmail =
      invoice.student.parentEmail || invoice.student.email

    if (!recipientEmail) {
      return NextResponse.json(
        { error: 'No email address found for student or parent' },
        { status: 400 }
      )
    }

    // Send receipt email
    const studentName = invoice.student.parentName
      ? `${invoice.student.parentName} (parent of ${invoice.student.firstName})`
      : `${invoice.student.firstName} ${invoice.student.lastName}`

    await sendReceiptEmail(
      recipientEmail,
      studentName,
      invoice.invoiceNumber,
      getMonthName(invoice.month),
      invoice.year,
      invoice.totalHours,
      invoice.totalAmount,
      invoice.paidAt,
      invoice.sessions
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error sending receipt:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to send receipt email' },
      { status: 500 }
    )
  }
}
