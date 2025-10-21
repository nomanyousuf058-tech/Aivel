'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  Shield, 
  BarChart3, 
  MessageSquare, 
  Settings,
  LogOut,
  ChevronRight
} from 'lucide-react'

interface AdminLayoutProps {
  children: ReactNode
  onLogout: () => void
}

const adminMenu = [
  {
    name: 'Dashboard',
    href: '/admin',
    icon: BarChart3,
  },
  {
    name: 'AI Chat',
    href: '/admin/chat',
    icon: MessageSquare,
  },
  {
    name: 'System Settings',
    href: '/admin/settings',
    icon: Settings,
  },
]

export default function AdminLayout({ children, onLogout }: AdminLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = () => {
    onLogout()
    router.push('/')
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Sidebar */}
      <motion.div
        initial={{ x: -300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-80 glass border-r border-white/10"
      >
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Admin Console</h2>
              <p className="text-sm text-gray-400">AIVEL System Control</p>
            </div>
          </div>
        </div>
        
        <nav className="p-4 space-y-2">
          {adminMenu.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.name}</span>
                {isActive && (
                  <ChevronRight className="h-4 w-4 ml-auto" />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Logout Button */}
        <div className="absolute bottom-6 left-6 right-6">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:text-white hover:bg-red-500/10 transition-all duration-200 border border-transparent hover:border-red-500/30"
            suppressHydrationWarning
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {children}
        </div>
      </div>
    </div>
  )
}