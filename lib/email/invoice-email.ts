import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransporter({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
})

export async function sendInvoiceEmail(
  to: string,
  studentName: string,
  invoiceNumber: string,
  month: string,
  year: number,
  totalHours: number,
  totalAmount: number,
  pdfBuffer?: Buffer
) {
  const subject = `Invoice ${invoiceNumber} for ${month} ${year}`

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
          </div>
          <div class="content">
            <p>Dear ${studentName},</p>
            <p>Thank you for your continued trust in my tutoring services. Please find below the invoice for ${month} ${year}.</p>

            <div class="invoice-details">
              <h3>Invoice Details</h3>
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
                  <td class="amount">$${totalAmount.toFixed(2)}</td>
                </tr>
              </table>
            </div>

            <p>Please make payment at your earliest convenience. If you have any questions about this invoice, feel free to reach out.</p>

            <p>Best regards,<br>Your Tutor</p>
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

  await transporter.sendMail(mailOptions)
}
