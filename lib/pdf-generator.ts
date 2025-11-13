import { formatCurrency, getMonthName } from './utils'

export function generateInvoiceHTML(invoice: {
  invoiceNumber: string
  month: number
  year: number
  totalHours: number
  hourlyRate: number
  totalAmount: number
  student: {
    firstName: string
    lastName: string
    email: string | null
    parentName: string | null
    parentEmail: string | null
  }
  sessions: Array<{
    date: Date
    duration: number
    subject: string | null
  }>
}) {
  const monthName = getMonthName(invoice.month)

  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      text-align: center;
      border-bottom: 3px solid #4F46E5;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .header h1 {
      color: #4F46E5;
      margin: 0;
    }
    .invoice-info {
      display: flex;
      justify-content: space-between;
      margin-bottom: 30px;
    }
    .info-section {
      flex: 1;
    }
    .info-section h3 {
      margin-top: 0;
      color: #4F46E5;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    th, td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #ddd;
    }
    th {
      background-color: #4F46E5;
      color: white;
    }
    .total-row {
      font-weight: bold;
      font-size: 1.2em;
      background-color: #f3f4f6;
    }
    .footer {
      margin-top: 50px;
      text-align: center;
      color: #666;
      font-size: 0.9em;
      border-top: 1px solid #ddd;
      padding-top: 20px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>TUTORING INVOICE</h1>
    <p>Invoice #${invoice.invoiceNumber}</p>
  </div>

  <div class="invoice-info">
    <div class="info-section">
      <h3>Bill To:</h3>
      <p>
        <strong>${invoice.student.firstName} ${invoice.student.lastName}</strong><br>
        ${invoice.student.parentName ? `Parent: ${invoice.student.parentName}<br>` : ''}
        ${invoice.student.parentEmail || invoice.student.email || 'No email on file'}
      </p>
    </div>
    <div class="info-section" style="text-align: right;">
      <h3>Invoice Details:</h3>
      <p>
        <strong>Period:</strong> ${monthName} ${invoice.year}<br>
        <strong>Date:</strong> ${new Date().toLocaleDateString()}<br>
        <strong>Status:</strong> Pending
      </p>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Date</th>
        <th>Subject</th>
        <th>Duration (hours)</th>
        <th>Rate</th>
        <th>Amount</th>
      </tr>
    </thead>
    <tbody>
      ${invoice.sessions
        .map(
          (session) => `
        <tr>
          <td>${new Date(session.date).toLocaleDateString()}</td>
          <td>${session.subject || '-'}</td>
          <td>${session.duration}</td>
          <td>${formatCurrency(invoice.hourlyRate)}</td>
          <td>${formatCurrency(session.duration * invoice.hourlyRate)}</td>
        </tr>
      `
        )
        .join('')}
      <tr class="total-row">
        <td colspan="2">TOTAL</td>
        <td>${invoice.totalHours} hours</td>
        <td></td>
        <td>${formatCurrency(invoice.totalAmount)}</td>
      </tr>
    </tbody>
  </table>

  <div class="footer">
    <p>Thank you for your business!</p>
    <p>Payment is due upon receipt. Please make arrangements to settle this invoice at your earliest convenience.</p>
  </div>
</body>
</html>
  `
}
