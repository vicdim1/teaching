'use client'

import { useEffect, useState } from 'react'
import { Plus, Edit, Trash2, Calendar as CalendarIcon, Check, X, Clock } from 'lucide-react'
import { formatCurrency, formatDateTime } from '@/lib/utils'

type Session = {
  id: string
  date: string
  duration: number
  subject: string | null
  notes: string | null
  status: string
  student: {
    id: string
    firstName: string
    lastName: string
    hourlyRate: number
  }
}

type Student = {
  id: string
  firstName: string
  lastName: string
  hourlyRate: number
}

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingSession, setEditingSession] = useState<Session | null>(null)
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1)
  const [filterYear, setFilterYear] = useState(new Date().getFullYear())
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list')
  const [statusFilter, setStatusFilter] = useState<'all' | 'scheduled' | 'completed' | 'cancelled'>('all')

  const loadSessions = async () => {
    try {
      const response = await fetch(
        `/api/sessions?month=${filterMonth}&year=${filterYear}`
      )
      const data = await response.json()
      setSessions(data)
    } catch (error) {
      console.error('Error loading sessions:', error)
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
  }, [])

  useEffect(() => {
    if (students.length > 0) {
      loadSessions()
    }
  }, [filterMonth, filterYear, students])

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this session?')) {
      return
    }

    try {
      await fetch(`/api/sessions/${id}`, { method: 'DELETE' })
      loadSessions()
    } catch (error) {
      console.error('Error deleting session:', error)
      alert('Failed to delete session')
    }
  }

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/sessions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error('Failed to update session status')
      }

      loadSessions()
    } catch (error) {
      console.error('Error updating session status:', error)
      alert('Failed to update session status')
    }
  }

  const filteredSessions = sessions.filter(session => {
    if (statusFilter === 'all') return true
    return session.status === statusFilter
  })

  const scheduledSessions = sessions.filter(s => s.status === 'scheduled')
  const completedSessions = sessions.filter(s => s.status === 'completed')

  const totalHours = completedSessions.reduce((sum, session) => sum + session.duration, 0)
  const totalRevenue = completedSessions.reduce(
    (sum, session) => sum + session.duration * session.student.hourlyRate,
    0
  )

  if (loading) {
    return <div className="text-center py-12">Loading...</div>
  }

  return (
    <div className="min-h-screen relative">
      {/* Background Image - Calendar/Time Theme */}
      <div className="fixed inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=1920&q=80"
          alt="Calendar and Planning"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/70 via-blue-900/60 to-slate-900/70"></div>
      </div>

      <div className="relative z-10 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white drop-shadow-lg">Sessions</h1>
          <p className="mt-2 text-emerald-50 drop-shadow">
            Schedule and manage your sessions.
          </p>
        </div>
        <button
          onClick={() => {
            setEditingSession(null)
            setShowForm(true)
          }}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-900 to-blue-700 hover:from-blue-800 hover:to-blue-600 transition-all"
        >
          <Plus className="w-4 h-4 mr-2" />
          Log Session
        </button>
      </div>

      <div className="bg-white/95 backdrop-blur-md shadow-2xl rounded-xl border border-white/30 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <CalendarIcon className="w-5 h-5 text-slate-500" />
            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(parseInt(e.target.value))}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent"
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(2000, i, 1).toLocaleDateString('en-US', {
                    month: 'long',
                  })}
                </option>
              ))}
            </select>
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(parseInt(e.target.value))}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent"
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
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent"
            >
              <option value="all">All Sessions</option>
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 rounded-lg font-medium transition-all ${viewMode === 'list' ? 'bg-blue-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              List
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-2 rounded-lg font-medium transition-all ${viewMode === 'calendar' ? 'bg-blue-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              Calendar
            </button>
          </div>
        </div>
        
        <div className="flex items-center space-x-6 pt-4 border-t border-slate-200">
          <div className="text-center">
            <div className="text-sm text-slate-600">Scheduled</div>
            <div className="text-xl font-semibold text-blue-700">
              {scheduledSessions.length}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-slate-600">Completed Hours</div>
            <div className="text-xl font-semibold text-emerald-700">
              {totalHours.toFixed(2)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-slate-600">Total Revenue</div>
            <div className="text-xl font-semibold text-amber-700">
              {formatCurrency(totalRevenue)}
            </div>
          </div>
        </div>
      </div>

      {showForm && (
        <SessionForm
          session={editingSession}
          students={students}
          onClose={() => {
            setShowForm(false)
            setEditingSession(null)
          }}
          onSave={() => {
            setShowForm(false)
            setEditingSession(null)
            loadSessions()
          }}
        />
      )}

      {viewMode === 'calendar' ? (
        <CalendarView sessions={filteredSessions} onSessionClick={(session) => {
          setEditingSession(session)
          setShowForm(true)
        }} />
      ) : (
        <div className="bg-white/95 backdrop-blur-md shadow-2xl overflow-hidden sm:rounded-xl border border-white/30">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-gradient-to-r from-white/60 to-emerald-50/60 backdrop-blur-sm">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Subject
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {filteredSessions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    No sessions found for this period.
                  </td>
                </tr>
              ) : (
                filteredSessions.map((session) => (
                  <tr key={session.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-900">
                        {formatDateTime(session.date)}
                      </div>
                    </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-slate-900">
                      {session.student.firstName} {session.student.lastName}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-900">
                      {session.subject || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-900">
                      {session.duration}h
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      session.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                      session.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                      'bg-rose-100 text-rose-800'
                    }`}>
                      {session.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-amber-700">
                      {formatCurrency(session.duration * session.student.hourlyRate)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    {session.status === 'scheduled' && (
                      <button
                        onClick={() => handleStatusChange(session.id, 'completed')}
                        className="text-emerald-600 hover:text-emerald-900"
                        title="Mark as completed"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                    {session.status === 'scheduled' && (
                      <button
                        onClick={() => handleStatusChange(session.id, 'cancelled')}
                        className="text-rose-600 hover:text-rose-900"
                        title="Cancel session"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setEditingSession(session)
                        setShowForm(true)
                      }}
                      className="text-slate-600 hover:text-slate-900"
                      title="Edit session"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(session.id)}
                      className="text-slate-500 hover:text-slate-700"
                      title="Delete session"
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
      )}
      </div>
    </div>
  )
}

function SessionForm({
  session,
  students,
  onClose,
  onSave,
}: {
  session: Session | null
  students: Student[]
  onClose: () => void
  onSave: () => void
}) {
  const [formData, setFormData] = useState({
    studentId: session?.student.id || '',
    date: session?.date ? new Date(session.date).toISOString().slice(0, 16) : '',
    duration: session?.duration || 1,
    subject: session?.subject || '',
    notes: session?.notes || '',
    status: session?.status || 'scheduled',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const url = session ? `/api/sessions/${session.id}` : '/api/sessions'
      const method = session ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Failed to save session')
      }

      onSave()
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
            {session ? 'Edit Session' : 'Log New Session'}
          </h3>

          {error && (
            <div className="mb-4 bg-rose-50 text-rose-700 p-3 rounded-lg text-sm border border-rose-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Student *
              </label>
              <select
                required
                value={formData.studentId}
                onChange={(e) =>
                  setFormData({ ...formData, studentId: e.target.value })
                }
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a student</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.firstName} {student.lastName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Date & Time *
              </label>
              <input
                type="datetime-local"
                required
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Duration (hours) *
              </label>
              <input
                type="number"
                required
                step="0.25"
                min="0.25"
                value={formData.duration}
                onChange={(e) =>
                  setFormData({ ...formData, duration: parseFloat(e.target.value) })
                }
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Subject
              </label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) =>
                  setFormData({ ...formData, subject: e.target.value })
                }
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Notes
              </label>
              <textarea
                rows={3}
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Status *
              </label>
              <select
                required
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
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
                {loading ? 'Saving...' : session ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

function CalendarView({ sessions, onSessionClick }: { sessions: Session[], onSessionClick: (session: Session) => void }) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)
  const startDate = new Date(firstDayOfMonth)
  startDate.setDate(startDate.getDate() - startDate.getDay())
  
  const endDate = new Date(lastDayOfMonth)
  endDate.setDate(endDate.getDate() + (6 - endDate.getDay()))

  const days = []
  const currentDateIter = new Date(startDate)
  
  while (currentDateIter <= endDate) {
    days.push(new Date(currentDateIter))
    currentDateIter.setDate(currentDateIter.getDate() + 1)
  }

  const getSessionsForDay = (date: Date) => {
    return sessions.filter(session => {
      const sessionDate = new Date(session.date)
      return sessionDate.toDateString() === date.toDateString()
    })
  }

  const previousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  return (
    <div className="bg-white/95 backdrop-blur-md shadow-2xl rounded-xl border border-white/30 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-slate-900">
          {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h2>
        <div className="flex space-x-2">
          <button
            onClick={previousMonth}
            className="px-3 py-1 border border-slate-300 rounded-lg hover:bg-slate-50 transition-all"
          >
            ← Prev
          </button>
          <button
            onClick={nextMonth}
            className="px-3 py-1 border border-slate-300 rounded-lg hover:bg-slate-50 transition-all"
          >
            Next →
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px bg-slate-200 rounded-lg overflow-hidden">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="bg-gradient-to-r from-slate-50 to-blue-50 p-2 text-center text-sm font-medium text-slate-700">
            {day}
          </div>
        ))}
        
        {days.map((day, index) => {
          const daySessions = getSessionsForDay(day)
          const isCurrentMonth = day.getMonth() === month
          const isToday = day.toDateString() === new Date().toDateString()
          
          return (
            <div
              key={index}
              className={`bg-white min-h-[100px] p-2 ${!isCurrentMonth ? 'bg-slate-50' : ''} ${isToday ? 'ring-2 ring-blue-700' : ''}`}
            >
              <div className={`text-sm font-medium mb-1 ${!isCurrentMonth ? 'text-slate-400' : isToday ? 'text-blue-700' : 'text-slate-900'}`}>
                {day.getDate()}
              </div>
              <div className="space-y-1">
                {daySessions.map((session) => (
                  <button
                    key={session.id}
                    onClick={() => onSessionClick(session)}
                    className={`w-full text-left text-xs p-1 rounded truncate ${
                      session.status === 'completed' ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' :
                      session.status === 'scheduled' ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' :
                      'bg-rose-100 text-rose-800 hover:bg-rose-200'
                    }`}
                    title={`${session.student.firstName} ${session.student.lastName} - ${session.duration}h`}
                  >
                    <div className="flex items-center">
                      {session.status === 'completed' && <Check className="w-3 h-3 mr-1" />}
                      {session.status === 'scheduled' && <Clock className="w-3 h-3 mr-1" />}
                      {session.status === 'cancelled' && <X className="w-3 h-3 mr-1" />}
                      <span className="truncate">{session.student.firstName}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
