import * as nodemailer from 'nodemailer'

let transporter: nodemailer.Transporter | null = null

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false
      }
    })
  }
  return transporter
}

export async function sendInvoiceEmail(
  to: string,
  studentName: string,
  invoiceNumber: string,
  month: string,
  year: number,
  totalHours: number,
  totalAmount: number,
  sessions?: Array<{ date: Date; duration: number; notes?: string | null }>,
  pdfBuffer?: Buffer
) {
  const subject = `Invoice ${invoiceNumber} for ${month} ${year}`

  // Format sessions HTML
  const sessionsHtml = sessions && sessions.length > 0 ? `
    <div class="invoice-details">
      <h3>Session Details</h3>
      <table style="border: 1px solid #ddd;">
        <thead>
          <tr style="background-color: #f0f0f0;">
            <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Date</th>
            <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Duration</th>
            <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Notes</th>
          </tr>
        </thead>
        <tbody>
          ${sessions.map(session => `
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;">${new Date(session.date).toLocaleDateString('en-US', { 
                weekday: 'short',
                year: 'numeric', 
                month: 'short', 
                day: 'numeric'
              })}</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${session.duration} hour${session.duration !== 1 ? 's' : ''}</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${session.notes || '-'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  ` : ''

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4F46E5; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .invoice-details { background-color: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
          .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
          table { width: 100%; border-collapse: collapse; }
          td { padding: 8px 0; }
          .label { font-weight: bold; }
          .amount { font-size: 24px; color: #4F46E5; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Tutoring Invoice</h1>
            <p style="margin: 5px 0 0; font-size: 14px;">From The Classroom Mauritius</p>
          </div>
          <div class="content">
            <p>Dear ${studentName},</p>
            <p>Thank you for your continued trust in our tutoring services. Please find below the invoice for ${month} ${year}.</p>

            <div class="invoice-details">
              <h3>Invoice Summary</h3>
              <table>
                <tr>
                  <td class="label">Invoice Number:</td>
                  <td>${invoiceNumber}</td>
                </tr>
                <tr>
                  <td class="label">Period:</td>
                  <td>${month} ${year}</td>
                </tr>
                <tr>
                  <td class="label">Total Hours:</td>
                  <td>${totalHours} hours</td>
                </tr>
                <tr>
                  <td colspan="2"><hr /></td>
                </tr>
                <tr>
                  <td class="label">Total Amount:</td>
                  <td class="amount">Rs ${totalAmount.toFixed(2)}</td>
                </tr>
              </table>
            </div>

            ${sessionsHtml}

            <p>Please make payment at your earliest convenience. If you have any questions about this invoice, feel free to reach out.</p>

            <p>Best regards,<br>The Classroom Mauritius</p>
          </div>
          <div class="footer">
            <p>This is an automated email. Please do not reply directly to this message.</p>
          </div>
        </div>
      </body>
    </html>
  `

  const mailOptions: any = {
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html,
  }

  if (pdfBuffer) {
    mailOptions.attachments = [
      {
        filename: `invoice-${invoiceNumber}.pdf`,
        content: pdfBuffer,
      },
    ]
  }

  const mailer = getTransporter()
  await mailer.sendMail(mailOptions)
}

export async function sendReceiptEmail(
  to: string,
  studentName: string,
  invoiceNumber: string,
  month: string,
  year: number,
  totalHours: number,
  totalAmount: number,
  paidDate: Date,
  sessions?: Array<{ date: Date; duration: number; notes?: string | null }>,
  pdfBuffer?: Buffer
) {
  const subject = `Payment Receipt for Invoice ${invoiceNumber}`

  // Format sessions HTML
  const sessionsHtml = sessions && sessions.length > 0 ? `
    <div class="invoice-details">
      <h3>Session Details</h3>
      <table style="border: 1px solid #ddd;">
        <thead>
          <tr style="background-color: #f0f0f0;">
            <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Date</th>
            <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Duration</th>
            <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Notes</th>
          </tr>
        </thead>
        <tbody>
          ${sessions.map(session => `
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;">${new Date(session.date).toLocaleDateString('en-US', { 
                weekday: 'short',
                year: 'numeric', 
                month: 'short', 
                day: 'numeric'
              })}</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${session.duration} hour${session.duration !== 1 ? 's' : ''}</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${session.notes || '-'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  ` : ''

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #10B981; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .invoice-details { background-color: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
          .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
          .paid-stamp { background-color: #10B981; color: white; padding: 10px 20px; border-radius: 5px; display: inline-block; font-weight: bold; margin: 10px 0; }
          table { width: 100%; border-collapse: collapse; }
          td { padding: 8px 0; }
          .label { font-weight: bold; }
          .amount { font-size: 24px; color: #10B981; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Payment Receipt</h1>
            <p style="margin: 5px 0 0; font-size: 14px;">From The Classroom Mauritius</p>
          </div>
          <div class="content">
            <p>Dear ${studentName},</p>
            <p>Thank you for your payment! This receipt confirms that we have received your payment for tutoring services rendered in ${month} ${year}.</p>

            <div style="text-align: center;">
              <div class="paid-stamp">✓ PAID</div>
            </div>

            <div class="invoice-details">
              <h3>Payment Details</h3>
              <table>
                <tr>
                  <td class="label">Receipt Number:</td>
                  <td>${invoiceNumber}</td>
                </tr>
                <tr>
                  <td class="label">Payment Date:</td>
                  <td>${new Date(paidDate).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric'
                  })}</td>
                </tr>
                <tr>
                  <td class="label">Period:</td>
                  <td>${month} ${year}</td>
                </tr>
                <tr>
                  <td class="label">Total Hours:</td>
                  <td>${totalHours} hours</td>
                </tr>
                <tr>
                  <td colspan="2"><hr /></td>
                </tr>
                <tr>
                  <td class="label">Amount Paid:</td>
                  <td class="amount">Rs ${totalAmount.toFixed(2)}</td>
                </tr>
              </table>
            </div>

            ${sessionsHtml}

            <p>Please keep this receipt for your records. If you have any questions, feel free to reach out.</p>

            <p>Best regards,<br>The Classroom Mauritius</p>
          </div>
          <div class="footer">
            <p>This is an automated email. Please do not reply directly to this message.</p>
          </div>
        </div>
      </body>
    </html>
  `

  const mailOptions: any = {
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html,
  }

  if (pdfBuffer) {
    mailOptions.attachments = [
      {
        filename: `receipt-${invoiceNumber}.pdf`,
        content: pdfBuffer,
      },
    ]
  }

  const mailer = getTransporter()
  await mailer.sendMail(mailOptions)
}
