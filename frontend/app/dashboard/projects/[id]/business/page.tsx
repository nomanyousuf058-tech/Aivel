"use client"

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Target,
  BarChart3,
  PieChart,
  Activity,
  Zap,
  Brain,
  Lightbulb,
  CheckCircle,
  Clock,
  AlertCircle,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react'
import AppShell from '@/components/layouts/AppShell'

interface GrowthImplementation {
  id: string
  title: string
  description: string
  category: 'marketing' | 'sales' | 'product' | 'operations'
  priority: 'high' | 'medium' | 'low'
  status: 'pending' | 'running' | 'completed' | 'paused'
  expectedImpact: number
  effort: 'low' | 'medium' | 'high'
  timeline: string
  result?: string
  startedAt?: Date
  completedAt?: Date
}

interface Metric {
  name: string
  value: string
  change: string
  changeType: 'positive' | 'negative' | 'neutral'
  trend: number[]
}

export default function BusinessDashboard({ params }: { params: Promise<{ id: string }> }) {
  const [projectId, setProjectId] = useState<string>('')
  const [implementations, setImplementations] = useState<GrowthImplementation[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    params.then(p => setProjectId(p.id))
    
    // Load mock implementations
    setImplementations([
      {
        id: '1',
        title: 'AI-Powered Lead Scoring',
        description: 'Implement machine learning to automatically score and prioritize leads based on engagement patterns',
        category: 'sales',
        priority: 'high',
        status: 'pending',
        expectedImpact: 25,
        effort: 'medium',
        timeline: '2-3 weeks'
      },
      {
        id: '2',
        title: 'Automated Email Sequences',
        description: 'Create personalized email campaigns that adapt based on user behavior and preferences',
        category: 'marketing',
        priority: 'high',
        status: 'running',
        expectedImpact: 30,
        effort: 'low',
        timeline: '1 week',
        startedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        id: '3',
        title: 'Dynamic Pricing Optimization',
        description: 'Use AI to adjust pricing in real-time based on demand, competition, and customer segments',
        category: 'product',
        priority: 'medium',
        status: 'completed',
        expectedImpact: 15,
        effort: 'high',
        timeline: '4-6 weeks',
        result: 'Implemented successfully, 15% revenue increase observed',
        completedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      }
    ])
  }, [params])

  const metrics: Metric[] = [
    {
      name: 'Monthly Revenue',
      value: '$45,230',
      change: '+12.5%',
      changeType: 'positive',
      trend: [32000, 35000, 38000, 42000, 45230]
    },
    {
      name: 'Customer Acquisition',
      value: '1,247',
      change: '+23.1%',
      changeType: 'positive',
      trend: [800, 950, 1100, 1200, 1247]
    },
    {
      name: 'Conversion Rate',
      value: '3.2%',
      change: '+0.8%',
      changeType: 'positive',
      trend: [2.1, 2.4, 2.7, 2.9, 3.2]
    },
    {
      name: 'Customer Lifetime Value',
      value: '$1,250',
      change: '+18.3%',
      changeType: 'positive',
      trend: [900, 1000, 1100, 1200, 1250]
    }
  ]

  const generateGrowthImplementations = async () => {
    setIsGenerating(true)
    
    try {
      const response = await fetch('/api/ai/brain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          role: 'MARKETING', 
          objective: `Generate 3 new growth implementation ideas for project ${projectId} based on current metrics and market trends` 
        })
      })

      const result = await response.json()
      
      // Parse AI response and create new implementations
      const newImplementations: GrowthImplementation[] = [
        {
          id: Date.now().toString(),
          title: 'AI Content Personalization',
          description: 'Dynamically personalize content based on user behavior and preferences',
          category: 'marketing',
          priority: 'high',
          status: 'pending',
          expectedImpact: 20,
          effort: 'medium',
          timeline: '2-3 weeks'
        },
        {
          id: (Date.now() + 1).toString(),
          title: 'Predictive Customer Support',
          description: 'Use AI to predict and prevent customer issues before they occur',
          category: 'operations',
          priority: 'medium',
          status: 'pending',
          expectedImpact: 18,
          effort: 'high',
          timeline: '4-5 weeks'
        }
      ]
      
      setImplementations(prev => [...newImplementations, ...prev])
    } catch (error) {
      console.error('Failed to generate implementations:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const runImplementation = async (implementation: GrowthImplementation) => {
    setImplementations(prev => prev.map(impl => 
      impl.id === implementation.id 
        ? { ...impl, status: 'running', startedAt: new Date() }
        : impl
    ))

    try {
      const response = await fetch('/api/ai/brain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          role: 'OPERATIONS', 
          objective: `Execute growth implementation: ${implementation.title} - ${implementation.description}` 
        })
      })

      const result = await response.json()
      
      setImplementations(prev => prev.map(impl => 
        impl.id === implementation.id 
          ? { 
              ...impl, 
              status: 'completed', 
              result: result.result || 'Implementation completed successfully',
              completedAt: new Date() 
            }
          : impl
      ))
    } catch (error) {
      setImplementations(prev => prev.map(impl => 
        impl.id === implementation.id 
          ? { ...impl, status: 'pending' }
          : impl
      ))
    }
  }

  const getStatusIcon = (status: GrowthImplementation['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'running': return <Activity className="w-4 h-4 text-blue-500 animate-pulse" />
      case 'paused': return <Pause className="w-4 h-4 text-yellow-500" />
      default: return <Clock className="w-4 h-4 text-gray-400" />
    }
  }

  const getPriorityColor = (priority: GrowthImplementation['priority']) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
    }
  }

  const getCategoryColor = (category: GrowthImplementation['category']) => {
    switch (category) {
      case 'marketing': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
      case 'sales': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      case 'product': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
      case 'operations': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
    }
  }

  const filteredImplementations = selectedCategory === 'all' 
    ? implementations 
    : implementations.filter(impl => impl.category === selectedCategory)

  return (
    <AppShell>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Business Dashboard - Project {projectId}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              AI-powered growth implementations and business metrics
            </p>
          </div>
          
          <button
            onClick={generateGrowthImplementations}
            disabled={isGenerating}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Lightbulb className="w-4 h-4" />
                <span>Generate Ideas</span>
              </>
            )}
          </button>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((metric, index) => (
            <motion.div
              key={metric.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{metric.name}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{metric.value}</p>
                  <p className={`text-sm mt-1 ${
                    metric.changeType === 'positive' 
                      ? 'text-green-600 dark:text-green-400' 
                      : metric.changeType === 'negative'
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}>
                    {metric.change} from last month
                  </p>
                </div>
                <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Growth Implementations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
        >
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Growth Implementations</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  AI-generated strategies to accelerate business growth
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Categories</option>
                  <option value="marketing">Marketing</option>
                  <option value="sales">Sales</option>
                  <option value="product">Product</option>
                  <option value="operations">Operations</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredImplementations.length === 0 ? (
              <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                <Lightbulb className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No implementations yet. Generate some growth ideas!</p>
              </div>
            ) : (
              filteredImplementations.map((implementation) => (
                <div key={implementation.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                          {implementation.title}
                        </h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded ${getPriorityColor(implementation.priority)}`}>
                          {implementation.priority}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded ${getCategoryColor(implementation.category)}`}>
                          {implementation.category}
                        </span>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(implementation.status)}
                          <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                            {implementation.status}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 dark:text-gray-400 mb-3">{implementation.description}</p>
                      
                      <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center space-x-1">
                          <Target className="w-4 h-4" />
                          <span>{implementation.expectedImpact}% impact</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{implementation.timeline}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Zap className="w-4 h-4" />
                          <span>{implementation.effort} effort</span>
                        </div>
                      </div>
                      
                      {implementation.result && (
                        <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-md">
                          <p className="text-sm text-green-800 dark:text-green-400">
                            <strong>Result:</strong> {implementation.result}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      {implementation.status === 'pending' && (
                        <button
                          onClick={() => runImplementation(implementation)}
                          className="flex items-center space-x-1 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                        >
                          <Play className="w-3 h-3" />
                          <span>Run</span>
                        </button>
                      )}
                      {implementation.status === 'running' && (
                        <button
                          className="flex items-center space-x-1 px-3 py-1 text-sm bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors"
                        >
                          <Pause className="w-3 h-3" />
                          <span>Pause</span>
                        </button>
                      )}
                      {implementation.status === 'completed' && (
                        <button
                          className="flex items-center space-x-1 px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                        >
                          <CheckCircle className="w-3 h-3" />
                          <span>Completed</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </AppShell>
  )
}