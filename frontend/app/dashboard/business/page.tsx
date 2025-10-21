'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  DollarSign, 
  Users, 
  TrendingUp, 
  Package,
  ArrowUpRight,
  BarChart3,
  Wallet,
  Shield
} from 'lucide-react'
import { AdminStats } from '@/types'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import Button from '@/components/ui/Button'
import Skeleton from '@/components/ui/Skeleton'

export default function BusinessDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        const mockStats = (await import('@/mocks/adminStats.json')).default
        setStats(mockStats)
      } catch (error) {
        console.error('Failed to fetch stats:', error)
        // Fallback to mock data
        const mockStats = (await import('@/mocks/adminStats.json')).default
        setStats(mockStats)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const revenueCards = [
    {
      title: 'Total Revenue',
      value: `$${stats?.totalRevenue.toLocaleString() || '0'}`,
      icon: DollarSign,
      color: 'text-green-400',
      bgColor: 'bg-green-400/10',
      description: 'All-time platform revenue'
    },
    {
      title: 'Platform Reserve',
      value: `$${stats?.growthFund.toLocaleString() || '0'}`,
      icon: Shield,
      color: 'text-blue-400',
      bgColor: 'bg-blue-400/10',
      description: 'Funds allocated for growth and development'
    },
    {
      title: 'Owner Balance',
      value: `$${stats?.ownerEarnings.toLocaleString() || '0'}`,
      icon: Wallet,
      color: 'text-purple-400',
      bgColor: 'bg-purple-400/10',
      description: 'Available for withdrawal'
    },
    {
      title: 'Total Users',
      value: stats?.totalUsers.toLocaleString() || '0',
      icon: Users,
      color: 'text-orange-400',
      bgColor: 'bg-orange-400/10',
      description: 'Registered platform users'
    }
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-white">Business Overview</h1>
          <p className="text-gray-300 mt-2">
            Monitor your revenue, growth, and platform performance
          </p>
        </motion.div>

        {/* Revenue Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="glass-card p-4 space-y-4">
                  <Skeleton className="h-6 w-1/2" />
                  <Skeleton className="h-8 w-2/3" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ))
            : revenueCards.map((card, index) => (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="glass-card group cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl ${card.bgColor}`}>
                      <card.icon className={`h-6 w-6 ${card.color}`} />
                    </div>
                    <ArrowUpRight className="h-5 w-5 text-gray-400 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">{card.value}</h3>
                  <p className="text-gray-300 font-medium mb-1">{card.title}</p>
                  <p className="text-sm text-gray-400">{card.description}</p>
                </motion.div>
              ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Products */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card"
          >
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center space-x-2">
              <Package className="h-5 w-5 text-blue-400" />
              <span>Top Performing Products</span>
            </h3>
            <div className="space-y-4">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="p-4 rounded-lg bg-white/5">
                    <Skeleton className="h-5 w-1/3 mb-2" />
                    <Skeleton className="h-4 w-1/4" />
                  </div>
                ))
              ) : stats?.topProducts?.length ? (
                stats.topProducts.map((product, index) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium text-white">{product.name}</div>
                        <div className="text-sm text-gray-400">{product.sales} sales</div>
                      </div>
                    </div>
                    <TrendingUp className="h-5 w-5 text-green-400" />
                  </div>
                ))
              ) : (
                <div className="text-gray-400 p-4">No product data available.</div>
              )}
            </div>
          </motion.div>

          {/* Weekly Report */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card"
          >
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-green-400" />
              <span>AI Business Report</span>
            </h3>
            <div className="p-4 rounded-lg bg-white/5 min-h-[120px]">
              {loading ? (
                <Skeleton className="h-20 w-full" />
              ) : (
                <p className="text-gray-300 leading-relaxed">
                  {stats?.weeklyReport || 'No report available.'}
                </p>
              )}
            </div>
            {!loading && (
              <div className="mt-4 p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
                <p className="text-sm text-blue-400">
                  💡 <strong>AI Insight:</strong> Consider expanding into mobile app templates based on current market trends.
                </p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card"
        >
          <h3 className="text-xl font-semibold text-white mb-6">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button className="text-left" variant="secondary" leftIcon={<DollarSign className="h-5 w-5" />}>Withdraw Funds</Button>
            <Button className="text-left" variant="secondary" leftIcon={<BarChart3 className="h-5 w-5" />}>Generate Report</Button>
            <Button className="text-left" variant="secondary" leftIcon={<TrendingUp className="h-5 w-5" />}>Growth Insights</Button>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  )
}