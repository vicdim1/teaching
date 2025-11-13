import { prisma } from '@/lib/prisma'
import { formatCurrency } from '@/lib/utils'
import { Users, Calendar, DollarSign, FileText } from 'lucide-react'
import Link from 'next/link'

async function getDashboardStats() {
  const [totalStudents, activeStudents, totalSessions, pendingInvoices] = await Promise.all([
    prisma.student.count(),
    prisma.student.count({ where: { active: true } }),
    prisma.session.count(),
    prisma.invoice.count({ where: { status: 'pending' } }),
  ])

  // Get current month sessions
  const now = new Date()
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

  const currentMonthSessions = await prisma.session.findMany({
    where: {
      date: {
        gte: firstDayOfMonth,
        lte: lastDayOfMonth,
      },
    },
    include: {
      student: true,
    },
  })

  const currentMonthRevenue = currentMonthSessions.reduce(
    (sum, session) => sum + session.duration * session.student.hourlyRate,
    0
  )

  const recentSessions = await prisma.session.findMany({
    take: 5,
    orderBy: { date: 'desc' },
    include: { student: true },
  })

  return {
    totalStudents,
    activeStudents,
    totalSessions,
    pendingInvoices,
    currentMonthRevenue,
    recentSessions,
  }
}

export default async function DashboardPage() {
  const stats = await getDashboardStats()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Welcome back! Here's an overview of your tutoring business.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Active Students
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {stats.activeStudents}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <Link
              href="/students"
              className="text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              View all students
            </Link>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Sessions
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {stats.totalSessions}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <Link
              href="/sessions"
              className="text-sm font-medium text-green-600 hover:text-green-500"
            >
              View all sessions
            </Link>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    This Month Revenue
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {formatCurrency(stats.currentMonthRevenue)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <Link
              href="/invoices"
              className="text-sm font-medium text-purple-600 hover:text-purple-500"
            >
              View invoices
            </Link>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FileText className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Pending Invoices
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {stats.pendingInvoices}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <Link
              href="/invoices"
              className="text-sm font-medium text-orange-600 hover:text-orange-500"
            >
              View pending
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-5 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Sessions</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {stats.recentSessions.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-500">
              No sessions yet. Start by adding students and logging sessions.
            </div>
          ) : (
            stats.recentSessions.map((session) => (
              <div key={session.id} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {session.student.firstName} {session.student.lastName}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(session.date).toLocaleDateString()} • {session.duration}h
                    {session.subject && ` • ${session.subject}`}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {formatCurrency(session.duration * session.student.hourlyRate)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
