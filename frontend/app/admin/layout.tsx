'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminAuth from '@/components/ui/AdminAuth'
import AdminLayout from '@/components/layouts/AdminLayout'

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check if user is already authenticated (e.g., via Clerk role or session)
    const checkAuth = async () => {
      try {
        // In production, this would verify Clerk role or session
        const isAdmin = localStorage.getItem('admin_authenticated') === 'true'
        if (isAdmin) {
          setIsAuthenticated(true)
        }
      } catch (error) {
        console.error('Auth check failed:', error)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const handleAuthentication = (success: boolean) => {
    if (success) {
      setIsAuthenticated(true)
      localStorage.setItem('admin_authenticated', 'true')
    } else {
      setIsAuthenticated(false)
      localStorage.removeItem('admin_authenticated')
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    localStorage.removeItem('admin_authenticated')
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="glass-card p-8 text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-300">Checking admin access...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <AdminAuth onAuthenticate={handleAuthentication} />
  }

  return (
    <AdminLayout onLogout={handleLogout}>
      {children}
    </AdminLayout>
  )
}