import nodemailer from 'nodemailer'

async function getTransporter() {
  // Check if email configuration is available
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    throw new Error('Email configuration is not set up. Please configure EMAIL_HOST, EMAIL_USER, and EMAIL_PASSWORD in your .env file.')
  }

  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    },
    tls: {
      rejectUnauthorized: false
    }
  })
}

export async function sendPasswordResetEmail(
  recipientEmail: string,
  recipientName: string,
  resetUrl: string
) {
  const transporter = await getTransporter()

  const mailOptions = {
    from: `"The Classroom Mauritius" <${process.env.EMAIL_USER}>`,
    to: recipientEmail,
    subject: 'Reset Your Password - The Classroom Mauritius',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 8px 8px 0 0;
          }
          .content {
            background: white;
            padding: 30px;
            border: 1px solid #e0e0e0;
            border-top: none;
          }
          .button {
            display: inline-block;
            padding: 12px 30px;
            background: #667eea;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
            font-weight: bold;
          }
          .button:hover {
            background: #5568d3;
          }
          .warning {
            background: #fff3cd;
            border: 1px solid #ffc107;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            color: #666;
            font-size: 12px;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e0e0e0;
          }
          .link {
            color: #667eea;
            word-break: break-all;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 style="margin: 0;">🔐 Password Reset Request</h1>
          <p style="margin: 10px 0 0 0;">The Classroom Mauritius</p>
        </div>
        <div class="content">
          <p>Hello ${recipientName},</p>
          
          <p>We received a request to reset your password for your The Classroom Mauritius account.</p>
          
          <p>Click the button below to reset your password:</p>
          
          <div style="text-align: center;">
            <a href="${resetUrl}" class="button">Reset Password</a>
          </div>
          
          <p>Or copy and paste this link into your browser:</p>
          <p class="link">${resetUrl}</p>
          
          <div class="warning">
            <strong>⚠️ Important:</strong>
            <ul style="margin: 10px 0 0 0; padding-left: 20px;">
              <li>This link will expire in 1 hour</li>
              <li>If you didn't request this reset, please ignore this email</li>
              <li>Your password will not change until you create a new one</li>
            </ul>
          </div>
          
          <p>If you have any questions or concerns, please contact support.</p>
          
          <p>Best regards,<br>
          <strong>The Classroom Mauritius Team</strong></p>
        </div>
        <div class="footer">
          <p>This is an automated email. Please do not reply to this message.</p>
          <p>&copy; ${new Date().getFullYear()} The Classroom Mauritius. All rights reserved.</p>
        </div>
      </body>
      </html>
    `
  }

  await transporter.sendMail(mailOptions)
}
