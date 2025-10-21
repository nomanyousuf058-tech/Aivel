"use client"

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  LayoutDashboard, 
  FolderOpen, 
  Brain, 
  Settings, 
  Menu, 
  X,
  Sun,
  Moon,
  User,
  LogOut,
  ChevronDown,
  Search,
  Bell,
  Plus,
  Sparkles,
  Zap,
  BarChart3,
  Code,
  Globe,
  Shield,
  UserPlus,
  HelpCircle
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { useUser, UserButton } from '@clerk/nextjs'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Button from '@/components/ui/Button'

interface AppShellProps {
  children: React.ReactNode
}

const navigation = [
  { 
    name: 'Dashboard', 
    href: '/dashboard', 
    icon: LayoutDashboard,
    description: 'Overview & Analytics',
    color: 'text-blue-400'
  },
  { 
    name: 'Projects', 
    href: '/dashboard/projects', 
    icon: FolderOpen,
    description: 'Manage Projects',
    color: 'text-green-400'
  },
  { 
    name: 'AI Brain', 
    href: '/dashboard/brain', 
    icon: Brain,
    description: 'AI Assistant',
    color: 'text-purple-400'
  },
  { 
    name: 'Analytics', 
    href: '/dashboard/analytics', 
    icon: BarChart3,
    description: 'Performance Data',
    color: 'text-orange-400'
  },
  { 
    name: 'Settings', 
    href: '/dashboard/settings', 
    icon: Settings,
    description: 'Preferences',
    color: 'text-gray-400'
  },
]

const quickActions = [
  { name: 'New Project', icon: Plus, href: '/dashboard/projects/new' },
  { name: 'AI Assistant', icon: Brain, href: '/dashboard/brain' },
  { name: 'Analytics', icon: BarChart3, href: '/dashboard/analytics' },
]

export default function AppShell({ children }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchFocused, setSearchFocused] = useState(false)
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()
  const { user } = useUser()

  // Wait until after client-side hydration to show theme-dependent content
  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={{ x: sidebarOpen ? 0 : -320 }}
        className="fixed inset-y-0 left-0 z-50 w-80 glass lg:translate-x-0 lg:static lg:inset-0"
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-20 items-center justify-between px-6 border-b border-white/10">
            <motion.div 
              className="flex items-center space-x-3"
              whileHover={{ scale: 1.05 }}
            >
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-pink-500 to-orange-500 rounded-full flex items-center justify-center">
                  <Sparkles className="w-2 h-2 text-white" />
                </div>
              </div>
              <div>
                <span className="text-2xl font-bold gradient-text">Aivel</span>
                <p className="text-xs text-gray-400">AI Platform</p>
              </div>
            </motion.div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              suppressHydrationWarning
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search */}
          <div className="px-6 py-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search anything..."
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                className={`w-full pl-10 pr-4 py-3 input-field transition-all duration-300 ${
                  searchFocused ? 'ring-2 ring-blue-500/50 border-blue-500/50' : ''
                }`}
                suppressHydrationWarning
              />
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-2 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <motion.div
                  key={item.name}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link
                    href={item.href}
                    className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 group ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white border border-blue-500/30 shadow-lg shadow-blue-500/20'
                        : 'text-gray-300 hover:bg-white/5 hover:text-white border border-transparent hover:border-white/10'
                    }`}
                  >
                    <item.icon className={`w-5 h-5 mr-3 ${isActive ? item.color : 'text-gray-400 group-hover:text-white'}`} />
                    <div className="flex-1">
                      <div className="font-medium">{item.name}</div>
                      <div className="text-xs text-gray-400 group-hover:text-gray-300">
                        {item.description}
                      </div>
                    </div>
                    {isActive && (
                      <motion.div
                        className="w-2 h-2 bg-blue-400 rounded-full"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.2 }}
                      />
                    )}
                  </Link>
                </motion.div>
              )
            })}
          </nav>

          {/* Quick Actions */}
          <div className="px-4 py-4 border-t border-white/10">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Quick Actions
            </h3>
            <div className="space-y-2">
              {quickActions.map((action) => (
                <motion.div
                  key={action.name}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link
                    href={action.href}
                    className="flex items-center px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-300"
                  >
                    <action.icon className="w-4 h-4 mr-3 text-gray-400" />
                    {action.name}
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>

          {/* User section */}
          <div className="p-4 border-t border-white/10">
            <div className="flex items-center space-x-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                {user ? (
                  <UserButton 
                    appearance={{
                      elements: {
                        avatarBox: "w-10 h-10"
                      }
                    }}
                  />
                ) : (
                  <User className="w-5 h-5 text-white" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user?.fullName || 'AI Developer'}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {user?.primaryEmailAddress?.emailAddress || 'admin@aivel.ai'}
                </p>
              </div>
              <button 
                className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                suppressHydrationWarning
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main content */}
      <div className="lg:pl-80">
        {/* Top bar */}
        <div className="sticky top-0 z-10 glass border-b border-white/10 backdrop-blur-xl">
          <div className="flex h-16 items-center justify-between px-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                suppressHydrationWarning
              >
                <Menu className="w-5 h-5" />
              </button>
              
              {/* Breadcrumb */}
              <div className="hidden md:flex items-center space-x-2 text-sm text-gray-400">
                <span>Dashboard</span>
                <ChevronDown className="w-4 h-4 rotate-[-90deg]" />
                <span className="text-white">Projects</span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* Quick actions */}
              <div className="hidden md:flex items-center space-x-2">
                <Button variant="glass" size="sm" leftIcon={<Plus className="h-4 w-4" />}>
                  New
                </Button>
                <Button variant="glass" size="sm" leftIcon={<Zap className="h-4 w-4" />}>
                  AI
                </Button>
              </div>
              
              {/* Notifications */}
              <button 
                className="relative p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                suppressHydrationWarning
              >
                <Bell className="w-5 h-5" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-xs text-white font-bold">3</span>
                </div>
              </button>

              {/* Theme toggle */}
              <button
                onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
                className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                suppressHydrationWarning
              >
                {!mounted ? (
                  <div className="w-5 h-5" />
                ) : resolvedTheme === 'dark' ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>

              {/* Help */}
              <button 
                className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                suppressHydrationWarning
              >
                <HelpCircle className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  )
}