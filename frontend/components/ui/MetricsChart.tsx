'use client'

import { motion } from 'framer-motion'
import { ProjectDetail } from '@/types'

interface MetricsChartProps {
  metrics: ProjectDetail['metrics']
}

export default function MetricsChart({ metrics }: MetricsChartProps) {
  // Use the actual properties from the ProjectDetail type
  const metricsData = [
    { 
      label: 'Uptime', 
      value: metrics?.uptime || 0, 
      max: 100, 
      color: 'bg-blue-500',
      displayValue: `${metrics?.uptime || 0}%`
    },
    { 
      label: 'Health Score', 
      value: metrics?.healthScore || 0, 
      max: 100, 
      color: 'bg-green-500',
      displayValue: `${metrics?.healthScore || 0}%`
    },
    { 
      label: 'Error Rate', 
      value: Math.min((metrics?.errorRate || 0) * 100, 100), 
      max: 100, 
      color: 'bg-red-500',
      displayValue: `${(metrics?.errorRate || 0) * 100}%`
    },
    { 
      label: 'Response Time', 
      value: Math.min((metrics?.responseTime || 0) / 10, 100), 
      max: 100, 
      color: 'bg-purple-500',
      displayValue: `${metrics?.responseTime || 0}ms`
    }
  ]

  return (
    <div className="space-y-4">
      {metricsData.map((metric, index) => (
        <motion.div
          key={metric.label}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center space-x-3 w-32">
            <span className="text-sm font-medium text-gray-300 w-20">
              {metric.label}
            </span>
            <span className="text-sm text-white font-semibold">
              {metric.displayValue}
            </span>
          </div>
          <div className="flex-1 bg-gray-700 rounded-full h-3 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(metric.value / metric.max) * 100}%` }}
              transition={{ duration: 1, delay: index * 0.1 }}
              className={`h-full rounded-full ${metric.color} ${
                metric.value > 80 ? 'animate-pulse' : ''
              }`}
            />
          </div>
        </motion.div>
      ))}
    </div>
  )
}