'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Cpu, 
  Users, 
  DollarSign, 
  TrendingUp,
  Shield,
  Zap,
  Brain,
  Rocket,
  Settings,
  BarChart3,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Database,
  Globe,
  Lock,
  Eye,
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  RefreshCw,
  Play,
  Pause,
  Square,
  Star,
  Target,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  X
} from 'lucide-react'
import { AdminStats } from '@/types'
import Button from '@/components/ui/Button'

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [showSecrets, setShowSecrets] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [aiChatOpen, setAiChatOpen] = useState(false)
  const [aiMessage, setAiMessage] = useState('')
  const [aiResponse, setAiResponse] = useState('')

  // Mock data for demonstration
  const systemCards = [
    {
      title: 'AIVEL 10.0 Core',
      value: 'Online',
      icon: Cpu,
      color: 'text-green-400',
      bgColor: 'bg-green-400/10',
      status: 'operational',
      change: '+2.1%'
    },
    {
      title: 'AI Models',
      value: 'Active',
      icon: Brain,
      color: 'text-blue-400',
      bgColor: 'bg-blue-400/10',
      status: 'optimized',
      change: '+5.3%'
    },
    {
      title: 'User Sessions',
      value: '2,847',
      icon: Users,
      color: 'text-purple-400',
      bgColor: 'bg-purple-400/10',
      status: 'active',
      change: '+12.4%'
    },
    {
      title: 'Revenue Engine',
      value: 'Running',
      icon: DollarSign,
      color: 'text-orange-400',
      bgColor: 'bg-orange-400/10',
      status: 'optimal',
      change: '+18.7%'
    }
  ]

  const recentUsers = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'Active', lastSeen: '2 min ago' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User', status: 'Active', lastSeen: '5 min ago' },
    { id: 3, name: 'Mike Johnson', email: 'mike@example.com', role: 'User', status: 'Inactive', lastSeen: '1 hour ago' },
    { id: 4, name: 'Sarah Wilson', email: 'sarah@example.com', role: 'Moderator', status: 'Active', lastSeen: '10 min ago' }
  ]

  const systemAlerts = [
    { id: 1, type: 'warning', message: 'High CPU usage detected on server-01', time: '5 min ago', icon: AlertTriangle },
    { id: 2, type: 'info', message: 'New user registration: 15 users today', time: '1 hour ago', icon: Users },
    { id: 3, type: 'success', message: 'Backup completed successfully', time: '2 hours ago', icon: CheckCircle },
    { id: 4, type: 'error', message: 'Failed to process payment for user #1234', time: '3 hours ago', icon: X }
  ]

  const aiSuggestions = [
    'Consider optimizing database queries for better performance',
    'Implement caching for frequently accessed data',
    'Add rate limiting to prevent API abuse',
    'Update security protocols for enhanced protection'
  ]

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
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

  const handleAiChat = async () => {
    if (!aiMessage.trim()) return
    
    setAiResponse('Analyzing your request...')
    // Simulate AI response
    setTimeout(() => {
      setAiResponse('Based on the current system metrics, I recommend optimizing the database queries and implementing additional caching layers. The revenue growth is strong at 18.7%, but we can improve user engagement by 15% with the suggested optimizations.')
    }, 2000)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
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
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6"
      >
        <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Admin Dashboard
            </h1>
            <p className="text-xl text-gray-300">
              AIVEL System Control & Monitoring Center
            </p>
        </div>
          <div className="flex items-center space-x-4">
            <Button 
              variant="glass" 
              leftIcon={<RefreshCw className="h-4 w-4" />}
              onClick={() => window.location.reload()}
            >
              Refresh
            </Button>
            <Button 
              variant="gradient" 
              leftIcon={<Brain className="h-4 w-4" />}
              onClick={() => setAiChatOpen(true)}
              glow
            >
              AI Assistant
            </Button>
        </div>
      </motion.div>

        {/* Navigation Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex space-x-1 glass p-1 rounded-xl"
        >
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'users', label: 'Users', icon: Users },
            { id: 'analytics', label: 'Analytics', icon: TrendingUp },
            { id: 'settings', label: 'Settings', icon: Settings },
            { id: 'security', label: 'Security', icon: Shield }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white border border-blue-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </motion.div>

        {/* System Status Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {systemCards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="glass-card-hover group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${card.bgColor}`}>
                  <card.icon className={`h-6 w-6 ${card.color}`} />
                </div>
                <div className="text-right">
                  <div className="text-sm text-green-400 flex items-center">
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    {card.change}
                  </div>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">{card.value}</h3>
              <p className="text-gray-300 font-medium">{card.title}</p>
              <div className="flex items-center space-x-1 text-xs text-green-400 bg-green-400/10 px-2 py-1 rounded-full mt-3 w-fit">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>{card.status}</span>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {activeTab === 'overview' && (
              <>
                {/* AI System Status */}
      <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="glass-card"
      >
        <div className="flex items-center space-x-4 mb-6">
          <motion.div
            animate={{ 
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, -5, 0]
            }}
                      transition={{ duration: 3, repeat: Infinity }}
          >
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                        <Brain className="h-6 w-6 text-white" />
                      </div>
          </motion.div>
          <div>
            <h3 className="text-xl font-semibold text-white">AI System Status</h3>
                      <p className="text-gray-400">Neural networks are active and learning</p>
          </div>
        </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                      <div className="flex items-center space-x-2 mb-2">
                        <CheckCircle className="h-4 w-4 text-green-400" />
                        <span className="text-sm font-medium text-green-400">Neural Networks</span>
                      </div>
                      <div className="text-2xl font-bold text-white">Online</div>
                    </div>
                    <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
                      <div className="flex items-center space-x-2 mb-2">
                        <Activity className="h-4 w-4 text-blue-400" />
                        <span className="text-sm font-medium text-blue-400">Processing</span>
                      </div>
                      <div className="text-2xl font-bold text-white">3 Tasks</div>
                    </div>
                    <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/30">
                      <div className="flex items-center space-x-2 mb-2">
                        <Target className="h-4 w-4 text-purple-400" />
                        <span className="text-sm font-medium text-purple-400">Success Rate</span>
                      </div>
                      <div className="text-2xl font-bold text-white">98.5%</div>
                    </div>
                  </div>
                </motion.div>

                {/* Recent Activity */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="glass-card"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-white">Recent Activity</h3>
                    <Button variant="glass" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      View All
                    </Button>
                  </div>
        <div className="space-y-4">
                    {systemAlerts.map((alert, index) => (
            <motion.div
                        key={alert.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                        className={`flex items-start space-x-3 p-4 rounded-lg border ${
                          alert.type === 'error' ? 'bg-red-500/10 border-red-500/30' :
                          alert.type === 'warning' ? 'bg-yellow-500/10 border-yellow-500/30' :
                          alert.type === 'success' ? 'bg-green-500/10 border-green-500/30' :
                          'bg-blue-500/10 border-blue-500/30'
                        }`}
                      >
                        <alert.icon className={`h-5 w-5 mt-0.5 ${
                          alert.type === 'error' ? 'text-red-400' :
                          alert.type === 'warning' ? 'text-yellow-400' :
                          alert.type === 'success' ? 'text-green-400' :
                          'text-blue-400'
                        }`} />
                        <div className="flex-1">
                          <p className="text-white font-medium">{alert.message}</p>
                          <p className="text-gray-400 text-sm">{alert.time}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </>
            )}

            {activeTab === 'users' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="glass-card"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-white">User Management</h3>
                  <div className="flex items-center space-x-2">
                    <Button variant="glass" size="sm" leftIcon={<Search className="h-4 w-4" />}>
                      Search
                    </Button>
                    <Button variant="gradient" size="sm" leftIcon={<Plus className="h-4 w-4" />}>
                      Add User
                    </Button>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">User</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Role</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Last Seen</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentUsers.map((user, index) => (
                        <motion.tr
                          key={user.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4 + index * 0.1 }}
                          className="border-b border-white/5 hover:bg-white/5 transition-colors"
                        >
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm font-medium">
                                  {user.name.split(' ').map(n => n[0]).join('')}
                                </span>
                              </div>
                              <div>
                                <div className="text-white font-medium">{user.name}</div>
                                <div className="text-gray-400 text-sm">{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              user.role === 'Admin' ? 'bg-red-500/20 text-red-400' :
                              user.role === 'Moderator' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-green-500/20 text-green-400'
                            }`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              user.status === 'Active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                            }`}>
                              {user.status}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-gray-400 text-sm">{user.lastSeen}</td>
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-2">
                              <button className="p-1 text-gray-400 hover:text-white transition-colors">
                                <Edit className="h-4 w-4" />
                              </button>
                              <button className="p-1 text-gray-400 hover:text-red-400 transition-colors">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
            </motion.div>
          )}
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* AI Suggestions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="glass-card"
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">AI Suggestions</h3>
                  <p className="text-sm text-gray-400">Optimization recommendations</p>
                </div>
              </div>
              <div className="space-y-3">
                {aiSuggestions.map((suggestion, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className="p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <p className="text-sm text-gray-300">{suggestion}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="glass-card"
            >
              <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Button variant="glass" size="sm" className="w-full justify-start">
                  <Database className="h-4 w-4 mr-3" />
                  Database Status
                </Button>
                <Button variant="glass" size="sm" className="w-full justify-start">
                  <Shield className="h-4 w-4 mr-3" />
                  Security Scan
                </Button>
                <Button variant="glass" size="sm" className="w-full justify-start">
                  <Download className="h-4 w-4 mr-3" />
                  Export Data
                </Button>
                <Button variant="glass" size="sm" className="w-full justify-start">
                  <Settings className="h-4 w-4 mr-3" />
                  System Config
                </Button>
              </div>
            </motion.div>
          </div>
        </div>

        {/* AI Chat Modal */}
        <AnimatePresence>
          {aiChatOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setAiChatOpen(false)} />
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="relative w-full max-w-2xl glass-card"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                      <Brain className="h-5 w-5 text-white" />
              </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white">AI Assistant</h3>
                      <p className="text-sm text-gray-400">Ask me anything about your system</p>
                  </div>
                  </div>
                  <button
                    onClick={() => setAiChatOpen(false)}
                    className="p-2 text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-white/5">
                    <p className="text-white">{aiResponse || 'Hello! I\'m your AI assistant. How can I help you today?'}</p>
                  </div>
                  
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={aiMessage}
                      onChange={(e) => setAiMessage(e.target.value)}
                      placeholder="Ask about system performance, user analytics, or optimization..."
                      className="flex-1 input-field"
                      onKeyPress={(e) => e.key === 'Enter' && handleAiChat()}
                    />
                    <Button onClick={handleAiChat} variant="gradient" leftIcon={<Zap className="h-4 w-4" />}>
                      Send
                    </Button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}