'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Home,
  Users,
  Calendar,
  FileText,
  Image,
  LogOut,
  GraduationCap
} from 'lucide-react'
import { useState, useEffect } from 'react'

export default function Navigation() {
  const pathname = usePathname()
  const router = useRouter()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  const links = [
    { href: '/', label: 'Dashboard', icon: Home },
    { href: '/students', label: 'Students', icon: Users },
    { href: '/sessions', label: 'Sessions', icon: Calendar },
    { href: '/invoices', label: 'Invoices', icon: FileText },
    { href: '/work-reviews', label: 'Work Reviews', icon: Image },
  ]

  return (
    <nav className={`sticky top-0 z-50 backdrop-blur-lg bg-white/95 transition-all duration-300 ${
      scrolled ? 'shadow-lg shadow-slate-200/50' : 'shadow-md shadow-slate-100'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center space-x-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-900 to-blue-700 rounded-lg flex items-center justify-center shadow-md">
                <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-bold text-slate-800">
                  The Classroom
                </h1>
                <p className="text-[10px] sm:text-xs text-slate-500 -mt-1 font-medium">Mauritius</p>
              </div>
            </div>
            <div className="ml-6 sm:ml-10 flex space-x-1 sm:space-x-2">
              {links.map((link) => {
                const Icon = link.icon
                const isActive = pathname === link.href
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`inline-flex items-center px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-blue-900 text-white shadow-md'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <Icon className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">{link.label}</span>
                  </Link>
                )
              })}
            </div>
          </div>
          <div className="flex items-center">
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium text-slate-700 hover:bg-red-50 hover:text-red-600 transition-all"
            >
              <LogOut className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
