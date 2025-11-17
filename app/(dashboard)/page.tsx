import { prisma } from '@/lib/prisma'
import { formatCurrency } from '@/lib/utils'
import { Users, Calendar, DollarSign, FileText, TrendingUp, Clock, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { getSession } from '@/lib/auth'

async function getDashboardStats() {
  try {
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
      (sum: number, session: any) => sum + session.duration * session.student.hourlyRate,
      0
    )

    const recentSessions = await prisma.session.findMany({
      take: 5,
      orderBy: { date: 'desc' },
      include: { student: true },
    })

    // Get scheduled sessions count
    const scheduledSessions = await prisma.session.count({
      where: { status: 'scheduled' }
    })

    return {
      totalStudents,
      activeStudents,
      totalSessions,
      pendingInvoices,
      currentMonthRevenue,
      recentSessions,
      scheduledSessions,
    }
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return {
      totalStudents: 0,
      activeStudents: 0,
      totalSessions: 0,
      pendingInvoices: 0,
      currentMonthRevenue: 0,
      recentSessions: [],
      scheduledSessions: 0,
    }
  }
}

export default async function DashboardPage() {
  const stats = await getDashboardStats()
  const user = await getSession()
  
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good Morning'
    if (hour < 18) return 'Good Afternoon'
    return 'Good Evening'
  }

  return (
    <div className="min-h-screen relative">
      {/* Background Image - Optimized */}
      <div className="fixed inset-0 z-0 bg-slate-900">
        <Image
          src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1920&q=80"
          alt="Books and Learning"
          fill
          priority
          quality={85}
          sizes="100vw"
          className="object-cover"
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWEREiMxUf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
        />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/60 via-slate-800/70 to-blue-800/60"></div>
      </div>

      <div className="relative z-10 space-y-8">
      {/* Welcome Section */}
      <div className="relative overflow-hidden bg-white/20 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]"></div>
        <div className="relative px-6 py-8 sm:px-8 sm:py-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 drop-shadow-lg">
                {getGreeting()}, {user?.name || 'Teacher'}! 👋
              </h1>
              <p className="text-blue-50 text-sm sm:text-base max-w-2xl drop-shadow">
                Here's what's happening with your tutoring business today.
              </p>
            </div>
            <div className="hidden lg:block">
              <div className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20">
                <TrendingUp className="w-16 h-16 text-white drop-shadow-lg" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative bg-white/95 backdrop-blur-md overflow-hidden rounded-xl shadow-2xl hover:shadow-3xl transition-all duration-300 card-hover border border-white/30">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                  <Users className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-slate-600 truncate">
                    Active Students
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-3xl font-bold text-slate-900">
                      {stats.activeStudents}
                    </div>
                    <div className="ml-2 text-sm text-slate-500">
                      / {stats.totalStudents}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-blue-50/80 to-slate-50/80 backdrop-blur-sm px-6 py-3 border-t border-white/30">
            <Link
              href="/students"
              className="text-sm font-medium text-blue-700 hover:text-blue-800 flex items-center group"
            >
              View all students
              <svg className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>

        <div className="relative bg-white/95 backdrop-blur-md overflow-hidden rounded-xl shadow-2xl hover:shadow-3xl transition-all duration-300 card-hover border border-white/30">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-xl flex items-center justify-center shadow-lg">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-slate-600 truncate">
                    Total Sessions
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-3xl font-bold text-slate-900">
                      {stats.totalSessions}
                    </div>
                    {stats.scheduledSessions > 0 && (
                      <div className="ml-2 flex items-center text-sm text-emerald-600">
                        <Clock className="w-3 h-3 mr-1" />
                        {stats.scheduledSessions} upcoming
                      </div>
                    )}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-emerald-50/80 to-slate-50/80 backdrop-blur-sm px-6 py-3 border-t border-white/30">
            <Link
              href="/sessions"
              className="text-sm font-medium text-emerald-700 hover:text-emerald-800 flex items-center group"
            >
              View all sessions
              <svg className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>

        <div className="relative bg-white/95 backdrop-blur-md overflow-hidden rounded-xl shadow-2xl hover:shadow-3xl transition-all duration-300 card-hover border border-white/30">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-600 to-amber-700 rounded-xl flex items-center justify-center shadow-lg">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-slate-600 truncate">
                    This Month
                  </dt>
                  <dd className="text-2xl font-bold text-slate-900">
                    {formatCurrency(stats.currentMonthRevenue)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-amber-50/80 to-slate-50/80 backdrop-blur-sm px-6 py-3 border-t border-white/30">
            <Link
              href="/invoices"
              className="text-sm font-medium text-amber-700 hover:text-amber-800 flex items-center group"
            >
              View invoices
              <svg className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>

        <div className="relative bg-white/95 backdrop-blur-md overflow-hidden rounded-xl shadow-2xl hover:shadow-3xl transition-all duration-300 card-hover border border-white/30">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-rose-600 to-rose-700 rounded-xl flex items-center justify-center shadow-lg">
                  <FileText className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-slate-600 truncate">
                    Pending Invoices
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-3xl font-bold text-slate-900">
                      {stats.pendingInvoices}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-rose-50/80 to-slate-50/80 backdrop-blur-sm px-6 py-3 border-t border-white/30">
            <Link
              href="/invoices"
              className="text-sm font-medium text-rose-700 hover:text-rose-800 flex items-center group"
            >
              View pending
              <svg className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Sessions */}
      <div className="bg-white/95 backdrop-blur-md shadow-2xl rounded-2xl border border-white/30 overflow-hidden">
        <div className="px-6 py-5 bg-gradient-to-r from-white/40 to-blue-50/40 backdrop-blur-sm border-b border-white/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-900 to-blue-700 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Recent Sessions</h3>
            </div>
            <Link href="/sessions" className="text-sm text-blue-700 hover:text-blue-800 font-medium">
              View all →
            </Link>
          </div>
        </div>
        <div className="divide-y divide-slate-100">
          {stats.recentSessions.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-blue-700" />
              </div>
              <p className="text-slate-600 mb-4 text-lg">
                No sessions yet. Start by adding students and logging sessions.
              </p>
              <Link
                href="/students"
                className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-gradient-to-r from-blue-900 to-blue-700 hover:from-blue-800 hover:to-blue-600 transition-all"
              >
                <Users className="w-4 h-4 mr-2" />
                Add Your First Student
              </Link>
            </div>
          ) : (
            stats.recentSessions.map((session: any) => (
              <div key={session.id} className="px-6 py-4 hover:bg-slate-50/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-slate-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-blue-900">
                        {session.student.firstName.charAt(0)}{session.student.lastName.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {session.student.firstName} {session.student.lastName}
                      </p>
                      <p className="text-xs text-slate-500 flex items-center space-x-2 mt-1">
                        <span>{new Date(session.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        <span>•</span>
                        <span>{session.duration}h</span>
                        {session.subject && (
                          <>
                            <span>•</span>
                            <span className="text-blue-700 font-medium">{session.subject}</span>
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-900">
                      {formatCurrency(session.duration * session.student.hourlyRate)}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {formatCurrency(session.student.hourlyRate)}/hr
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      </div>
    </div>
  )
}
