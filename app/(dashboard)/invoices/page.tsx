'use client'

import { useEffect, useState } from 'react'
import { Plus, Send, Eye, Trash2, Check, Clock, Mail } from 'lucide-react'
import { formatCurrency, getMonthName } from '@/lib/utils'

type Invoice = {
  id: string
  invoiceNumber: string
  month: number
  year: number
  totalHours: number
  totalAmount: number
  status: string
  sentAt: string | null
  paidAt: string | null
  student: {
    id: string
    firstName: string
    lastName: string
    email: string | null
    parentEmail: string | null
  }
}

type Student = {
  id: string
  firstName: string
  lastName: string
  active: boolean
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [showGenerateForm, setShowGenerateForm] = useState(false)

  const loadInvoices = async () => {
    try {
      const response = await fetch('/api/invoices')
      const data = await response.json()
      setInvoices(data)
    } catch (error) {
      console.error('Error loading invoices:', error)
    }
  }

  const loadStudents = async () => {
    try {
      const response = await fetch('/api/students')
      const data = await response.json()
      setStudents(data.filter((s: any) => s.active))
    } catch (error) {
      console.error('Error loading students:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStudents()
    loadInvoices()
  }, [])

  const handleSendInvoice = async (invoiceId: string) => {
    if (!confirm('Send this invoice by email?')) {
      return
    }

    try {
      const response = await fetch(`/api/invoices/${invoiceId}/send`, {
        method: 'POST',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to send invoice')
      }

      alert('Invoice sent successfully!')
      loadInvoices()
    } catch (error) {
      console.error('Error sending invoice:', error)
      alert(error instanceof Error ? error.message : 'Failed to send invoice')
    }
  }

  const handleMarkPaid = async (invoiceId: string) => {
    if (!confirm('Mark this invoice as paid?')) {
      return
    }

    try {
      await fetch(`/api/invoices/${invoiceId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'paid' }),
      })

      loadInvoices()
    } catch (error) {
      console.error('Error updating invoice:', error)
      alert('Failed to update invoice')
    }
  }

  const handleSendReceipt = async (invoiceId: string) => {
    if (!confirm('Send payment receipt by email?')) {
      return
    }

    try {
      const response = await fetch(`/api/invoices/${invoiceId}/receipt`, {
        method: 'POST',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to send receipt')
      }

      alert('Receipt sent successfully!')
    } catch (error) {
      console.error('Error sending receipt:', error)
      alert(error instanceof Error ? error.message : 'Failed to send receipt')
    }
  }

  const handleDelete = async (invoiceId: string) => {
    if (!confirm('Are you sure you want to delete this invoice? This will unlink the sessions but not delete them.')) {
      return
    }

    try {
      await fetch(`/api/invoices/${invoiceId}`, { method: 'DELETE' })
      loadInvoices()
    } catch (error) {
      console.error('Error deleting invoice:', error)
      alert('Failed to delete invoice')
    }
  }

  const totalPending = invoices
    .filter((inv) => inv.status === 'pending' || inv.status === 'sent')
    .reduce((sum, inv) => sum + inv.totalAmount, 0)

  const totalPaid = invoices
    .filter((inv) => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.totalAmount, 0)

  if (loading) {
    return <div className="text-center py-12">Loading...</div>
  }

  return (
    <div className="min-h-screen relative">
      {/* Background Image - Professional Finance Theme */}
      <div className="fixed inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1554224311-beee460c201f?w=1920&q=80"
          alt="Professional Business"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-amber-900/70 via-slate-900/70 to-blue-900/60"></div>
      </div>

      <div className="relative z-10 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white drop-shadow-lg">Invoices</h1>
          <p className="mt-2 text-amber-50 drop-shadow">
            Generate and manage invoices for your students.
          </p>
        </div>
        <button
          onClick={() => setShowGenerateForm(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-900 to-blue-700 hover:from-blue-800 hover:to-blue-600 transition-all"
        >
          <Plus className="w-4 h-4 mr-2" />
          Generate Invoice
        </button>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="bg-white/95 backdrop-blur-md overflow-hidden shadow-2xl rounded-xl border border-white/30">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-600 to-amber-700 rounded-xl flex items-center justify-center shadow-lg">
                  <Clock className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-slate-600 truncate">
                    Pending Amount
                  </dt>
                  <dd className="text-2xl font-semibold text-amber-700">
                    {formatCurrency(totalPending)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/95 backdrop-blur-md overflow-hidden shadow-2xl rounded-xl border border-white/30">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-xl flex items-center justify-center shadow-lg">
                  <Check className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-slate-600 truncate">
                    Total Paid
                  </dt>
                  <dd className="text-2xl font-semibold text-emerald-700">
                    {formatCurrency(totalPaid)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showGenerateForm && (
        <GenerateInvoiceForm
          students={students}
          onClose={() => setShowGenerateForm(false)}
          onSuccess={() => {
            setShowGenerateForm(false)
            loadInvoices()
          }}
        />
      )}

      <div className="bg-white/95 backdrop-blur-md shadow-2xl overflow-hidden sm:rounded-xl border border-white/30">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-gradient-to-r from-white/60 to-amber-50/60 backdrop-blur-sm">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                Invoice #
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                Student
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                Period
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                Hours
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-100">
            {invoices.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                  No invoices yet. Generate your first invoice to get started.
                </td>
              </tr>
            ) : (
              invoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-mono text-slate-900">
                      {invoice.invoiceNumber}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-slate-900">
                      {invoice.student.firstName} {invoice.student.lastName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-900">
                      {getMonthName(invoice.month)} {invoice.year}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-900">
                      {invoice.totalHours}h
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-amber-700">
                      {formatCurrency(invoice.totalAmount)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        invoice.status === 'paid'
                          ? 'bg-emerald-100 text-emerald-800'
                          : invoice.status === 'sent'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {invoice.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    {invoice.status !== 'sent' && invoice.status !== 'paid' && (
                      <button
                        onClick={() => handleSendInvoice(invoice.id)}
                        className="text-blue-700 hover:text-blue-900"
                        title="Send by email"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    )}
                    {invoice.status !== 'paid' && (
                      <button
                        onClick={() => handleMarkPaid(invoice.id)}
                        className="text-emerald-600 hover:text-emerald-900"
                        title="Mark as paid"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                    {invoice.status === 'paid' && (
                      <button
                        onClick={() => handleSendReceipt(invoice.id)}
                        className="text-blue-700 hover:text-blue-900"
                        title="Send receipt"
                      >
                        <Mail className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(invoice.id)}
                      className="text-rose-600 hover:text-rose-900"
                      title="Delete invoice"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      </div>
    </div>
  )
}

function GenerateInvoiceForm({
  students,
  onClose,
  onSuccess,
}: {
  students: Student[]
  onClose: () => void
  onSuccess: () => void
}) {
  const [formData, setFormData] = useState({
    studentId: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to generate invoice')
      }

      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-slate-900 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border border-slate-200 w-full max-w-md shadow-2xl rounded-xl bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-slate-900 mb-4">
            Generate Invoice
          </h3>

          {error && (
            <div className="mb-4 bg-rose-50 text-rose-700 p-3 rounded-lg text-sm border border-rose-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Student *
              </label>
              <select
                required
                value={formData.studentId}
                onChange={(e) =>
                  setFormData({ ...formData, studentId: e.target.value })
                }
                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent"
              >
                <option value="">Select a student</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.firstName} {student.lastName}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Month *
                </label>
                <select
                  required
                  value={formData.month}
                  onChange={(e) =>
                    setFormData({ ...formData, month: parseInt(e.target.value) })
                  }
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {getMonthName(i + 1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Year *
                </label>
                <select
                  required
                  value={formData.year}
                  onChange={(e) =>
                    setFormData({ ...formData, year: parseInt(e.target.value) })
                  }
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                >
                  {Array.from({ length: 5 }, (_, i) => {
                    const year = new Date().getFullYear() - 2 + i
                    return (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    )
                  })}
                </select>
              </div>
            </div>

            <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-800 border border-blue-200">
              This will collect all uninvoiced sessions for the selected student and period.
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-300 rounded-lg shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-900 to-blue-700 hover:from-blue-800 hover:to-blue-600 disabled:opacity-50 transition-all"
              >
                {loading ? 'Generating...' : 'Generate Invoice'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
