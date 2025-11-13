import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendInvoiceEmail } from '@/lib/email/invoice-email'
import { getMonthName } from '@/lib/utils'

export async function POST(
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

    // Determine recipient email
    const recipientEmail =
      invoice.student.parentEmail || invoice.student.email

    if (!recipientEmail) {
      return NextResponse.json(
        { error: 'No email address found for student or parent' },
        { status: 400 }
      )
    }

    // Send email
    const studentName = invoice.student.parentName
      ? `${invoice.student.parentName} (parent of ${invoice.student.firstName})`
      : `${invoice.student.firstName} ${invoice.student.lastName}`

    await sendInvoiceEmail(
      recipientEmail,
      studentName,
      invoice.invoiceNumber,
      getMonthName(invoice.month),
      invoice.year,
      invoice.totalHours,
      invoice.totalAmount
    )

    // Update invoice status
    await prisma.invoice.update({
      where: { id },
      data: {
        status: 'sent',
        sentAt: new Date(),
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error sending invoice:', error)
    return NextResponse.json(
      { error: 'Failed to send invoice email' },
      { status: 500 }
    )
  }
}
