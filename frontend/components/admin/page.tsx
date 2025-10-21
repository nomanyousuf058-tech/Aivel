'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Cpu, 
  Users, 
  DollarSign, 
  TrendingUp,
  Shield,
  Zap,
  Brain,
  Rocket
} from 'lucide-react'
import { AdminStats } from '@/types'

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [showSecrets, setShowSecrets] = useState(false)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000))
        const mockStats = (await import('@/mocks/adminStats.json')).default
        setStats(mockStats)
      } catch (error) {
        console.error('Failed to fetch admin stats:', error)
        const mockStats = (await import('@/mocks/adminStats.json')).default
        setStats(mockStats)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  // AI Wake-up Animation Sequence
  const [animationStage, setAnimationStage] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => {
      if (animationStage < 3) {
        setAnimationStage(animationStage + 1)
      } else {
        setShowSecrets(true)
      }
    }, 1000)

    return () => clearTimeout(timer)
  }, [animationStage])

  const systemCards = [
    {
      title: 'AIVEL 10.0 Core',
      value: 'Online',
      icon: Cpu,
      color: 'text-green-400',
      bgColor: 'bg-green-400/10',
      status: 'operational'
    },
    {
      title: 'AI Models',
      value: 'Active',
      icon: Brain,
      color: 'text-blue-400',
      bgColor: 'bg-blue-400/10',
      status: 'optimized'
    },
    {
      title: 'User Sessions',
      value: stats?.totalUsers.toLocaleString() || '0',
      icon: Users,
      color: 'text-purple-400',
      bgColor: 'bg-purple-400/10',
      status: 'active'
    },
    {
      title: 'Revenue Engine',
      value: 'Running',
      icon: DollarSign,
      color: 'text-orange-400',
      bgColor: 'bg-orange-400/10',
      status: 'optimal'
    }
  ]

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-700 rounded w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="glass-card space-y-4">
              <div className="h-6 bg-gray-700 rounded w-3/4"></div>
              <div className="h-8 bg-gray-700 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header with AI Wake-up */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-gray-300">AIVEL System Control & Monitoring</p>
        </div>
        <div className="flex items-center space-x-2 text-blue-400">
          <Shield className="h-6 w-6" />
          <span className="font-semibold">Secure Session</span>
        </div>
      </motion.div>

      {/* AI Wake-up Sequence */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="glass-card border border-blue-500/30"
      >
        <div className="flex items-center space-x-4 mb-6">
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Zap className="h-8 w-8 text-yellow-400" />
          </motion.div>
          <div>
            <h3 className="text-xl font-semibold text-white">AI System Status</h3>
            <p className="text-gray-300">Initializing core intelligence...</p>
          </div>
        </div>

        <div className="space-y-4">
          {animationStage >= 1 && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-3 p-3 rounded-lg bg-blue-500/10"
            >
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-400 font-medium">✓ Neural networks online</span>
            </motion.div>
          )}

          {animationStage >= 2 && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center space-x-3 p-3 rounded-lg bg-blue-500/10"
            >
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-400 font-medium">✓ Revenue systems engaged</span>
            </motion.div>
          )}

          {animationStage >= 3 && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="flex items-center space-x-3 p-3 rounded-lg bg-blue-500/10"
            >
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-400 font-medium">✓ Growth algorithms active</span>
            </motion.div>
          )}

          {showSecrets && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="p-4 rounded-lg bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30"
            >
              <div className="flex items-center space-x-2 mb-3">
                <Rocket className="h-5 w-5 text-blue-400" />
                <h4 className="text-lg font-semibold text-white">AIVEL 10.0 - Internal Vision</h4>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
                    <span className="text-gray-300">Platform Version:</span>
                    <span className="text-blue-400 font-mono">AIVEL 10.0</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
                    <span className="text-gray-300">Revenue Split:</span>
                    <span className="text-green-400 font-mono">30/70</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
                    <span className="text-gray-300">Platform Reserve (30%):</span>
                    <span className="text-yellow-400 font-mono">${stats?.growthFund.toLocaleString()}</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
                    <span className="text-gray-300">Owner Earnings (70%):</span>
                    <span className="text-purple-400 font-mono">${stats?.ownerEarnings.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
                    <span className="text-gray-300">Self-Upgrade Ready:</span>
                    <span className="text-green-400 font-mono">Q2 2024</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
                    <span className="text-gray-300">Evolution Phase:</span>
                    <span className="text-blue-400 font-mono">Stage 3</span>
                  </div>
                </div>
              </div>

              {/* Weekly AI Report */}
              <div className="mt-4 p-4 rounded-lg bg-black/30 border border-green-500/30">
                <h5 className="font-semibold text-green-400 mb-2">AI Strategic Report:</h5>
                <p className="text-gray-300 text-sm leading-relaxed">
                  {stats?.weeklyReport || 'System performing at optimal levels. Revenue streams diversified and growing. Platform evolution on track for Q2 2024 milestones.'}
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* System Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {systemCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 + index * 0.1 }}
            className="glass-card group cursor-pointer"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${card.bgColor}`}>
                <card.icon className={`h-6 w-6 ${card.color}`} />
              </div>
              <div className="flex items-center space-x-1 text-xs text-green-400 bg-green-400/10 px-2 py-1 rounded-full">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>{card.status}</span>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">{card.value}</h3>
            <p className="text-gray-300 font-medium">{card.title}</p>
          </motion.div>
        ))}
      </div>

      {/* Revenue Distribution */}
      {showSecrets && stats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          <div className="glass-card">
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-400" />
              <span>Revenue Distribution</span>
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                <span className="text-gray-300">Total Revenue</span>
                <span className="text-2xl font-bold text-white">${stats.totalRevenue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
                <span className="text-gray-300">Platform Reserve (30%)</span>
                <span className="text-xl font-semibold text-blue-400">${stats.growthFund.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center p-4 rounded-lg bg-purple-500/10 border border-purple-500/30">
                <span className="text-gray-300">Owner Balance (70%)</span>
                <span className="text-xl font-semibold text-purple-400">${stats.ownerEarnings.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="glass-card">
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center space-x-2">
              <Shield className="h-5 w-5 text-yellow-400" />
              <span>System Security</span>
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                <span className="text-gray-300">Admin Access</span>
                <span className="text-green-400 font-medium">Secure</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                <span className="text-gray-300">Data Encryption</span>
                <span className="text-green-400 font-medium">AES-256</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                <span className="text-gray-300">API Security</span>
                <span className="text-green-400 font-medium">Enabled</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                <span className="text-gray-300">Audit Logging</span>
                <span className="text-green-400 font-medium">Active</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}