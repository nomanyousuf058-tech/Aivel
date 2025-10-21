'use client';

import { motion } from 'framer-motion';
import GlassCard from '@/components/ui/GlassCard';

export default function TechnicalDashboard() {
  const systemMetrics = [
    { label: 'API Response Time', value: '142ms', status: 'good' },
    { label: 'Error Rate', value: '0.2%', status: 'good' },
    { label: 'CPU Usage', value: '45%', status: 'warning' },
    { label: 'Memory Usage', value: '68%', status: 'warning' },
    { label: 'Database Connections', value: '24/50', status: 'good' },
    { label: 'Uptime', value: '99.95%', status: 'excellent' },
  ];

  const recentIssues = [
    { id: 1, type: 'API Timeout', severity: 'medium', timestamp: '2 hours ago', fixed: false },
    { id: 2, type: 'Memory Leak', severity: 'high', timestamp: '1 day ago', fixed: true },
    { id: 3, type: 'Database Slow', severity: 'low', timestamp: '3 days ago', fixed: true },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-400';
      case 'warning': return 'text-yellow-400';
      case 'excellent': return 'text-cyan-400';
      default: return 'text-gray-400';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-400 bg-red-400/10';
      case 'medium': return 'text-yellow-400 bg-yellow-400/10';
      case 'low': return 'text-blue-400 bg-blue-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-white mb-2">Technical Dashboard</h1>
        <p className="text-gray-400">System health, diagnostics, and AI assistance</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Metrics */}
        <div className="lg:col-span-2 space-y-6">
          {/* System Metrics */}
          <GlassCard>
            <h2 className="text-xl font-semibold text-white mb-4">System Metrics</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {systemMetrics.map((metric, index) => (
                <motion.div
                  key={metric.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center p-4 bg-gray-700/30 rounded-lg"
                >
                  <div className="text-sm text-gray-400 mb-1">{metric.label}</div>
                  <div className={`text-2xl font-bold ${getStatusColor(metric.status)}`}>
                    {metric.value}
                  </div>
                </motion.div>
              ))}
            </div>
          </GlassCard>

          {/* Quick Actions */}
          <GlassCard>
            <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-400 py-3 px-4 rounded-lg transition-all duration-200 hover:scale-105">
                🛠️ Run System Diagnostics
              </button>
              <button className="bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-400 py-3 px-4 rounded-lg transition-all duration-200 hover:scale-105">
                🔄 Deploy Updates
              </button>
              <button className="bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-purple-400 py-3 px-4 rounded-lg transition-all duration-200 hover:scale-105">
                📊 Performance Report
              </button>
              <button className="bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 text-cyan-400 py-3 px-4 rounded-lg transition-all duration-200 hover:scale-105">
                🚀 Optimize System
              </button>
            </div>
          </GlassCard>
        </div>

        {/* Right Column - Issues & AI Help */}
        <div className="space-y-6">
          {/* Recent Issues */}
          <GlassCard>
            <h2 className="text-xl font-semibold text-white mb-4">Recent Issues</h2>
            <div className="space-y-3">
              {recentIssues.map((issue, index) => (
                <motion.div
                  key={issue.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg"
                >
                  <div>
                    <div className="font-medium text-white">{issue.type}</div>
                    <div className="text-sm text-gray-400">{issue.timestamp}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(issue.severity)}`}>
                      {issue.severity}
                    </span>
                    {issue.fixed ? (
                      <span className="text-green-400 text-sm">✅ Fixed</span>
                    ) : (
                      <button className="text-red-400 hover:text-red-300 text-sm">
                        Fix Now
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </GlassCard>

          {/* AI Help Section */}
          <GlassCard>
            <h2 className="text-xl font-semibold text-white mb-4">AI Assistance</h2>
            <div className="space-y-4">
              <div className="bg-gray-700/30 rounded-lg p-4">
                <div className="text-blue-400 font-medium mb-2">System Analysis</div>
                <p className="text-gray-300 text-sm">
                  Your system is running optimally. Minor CPU optimization recommended during peak hours.
                </p>
              </div>
              
              <button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 py-3 px-4 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105">
                💬 Chat with AI Assistant
              </button>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}