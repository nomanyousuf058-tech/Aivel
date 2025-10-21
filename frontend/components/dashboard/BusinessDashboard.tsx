'use client';

import { motion } from 'framer-motion';
import GlassCard from '@/components/ui/GlassCard';

export default function BusinessDashboard() {
  const revenueData = [
    { month: 'Jan', revenue: 4200, growth: 15 },
    { month: 'Feb', revenue: 5800, growth: 38 },
    { month: 'Mar', revenue: 7200, growth: 24 },
    { month: 'Apr', revenue: 8900, growth: 23 },
    { month: 'May', revenue: 10500, growth: 18 },
    { month: 'Jun', revenue: 12400, growth: 18 },
  ];

  const incomeSources = [
    { source: 'AI Tools', amount: 6800, percentage: 55 },
    { source: 'Affiliate', amount: 3200, percentage: 26 },
    { source: 'Courses', amount: 1800, percentage: 15 },
    { source: 'Services', amount: 600, percentage: 4 },
  ];

  const aiSuggestions = [
    {
      title: 'Content Expansion',
      description: 'Create more affiliate content in AI tools niche',
      impact: 'High',
      effort: 'Medium'
    },
    {
      title: 'Tool Bundle',
      description: 'Bundle popular AI tools for increased sales',
      impact: 'Medium',
      effort: 'Low'
    },
    {
      title: 'Email Campaign',
      description: 'Launch targeted campaign to existing users',
      impact: 'High',
      effort: 'High'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-white mb-2">Business Dashboard</h1>
        <p className="text-gray-400">Revenue analytics and AI growth suggestions</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Revenue */}
        <div className="lg:col-span-2 space-y-6">
          {/* Revenue Overview */}
          <GlassCard>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Revenue Overview</h2>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-400">$12,400</div>
                <div className="text-sm text-gray-400">June 2024 Revenue</div>
              </div>
            </div>
            
            {/* Simple Bar Chart */}
            <div className="flex items-end justify-between h-32 mt-6">
              {revenueData.map((month, index) => (
                <motion.div
                  key={month.month}
                  initial={{ opacity: 0, scaleY: 0 }}
                  animate={{ opacity: 1, scaleY: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex flex-col items-center flex-1 mx-1"
                >
                  <div
                    className="w-full bg-gradient-to-t from-blue-500 to-purple-600 rounded-t-lg transition-all duration-300 hover:opacity-80"
                    style={{ height: `${(month.revenue / 15000) * 100}%` }}
                  />
                  <div className="text-xs text-gray-400 mt-2">{month.month}</div>
                  <div className="text-xs text-green-400">+{month.growth}%</div>
                </motion.div>
              ))}
            </div>
          </GlassCard>

          {/* Income Sources */}
          <GlassCard>
            <h2 className="text-xl font-semibold text-white mb-6">Income Sources</h2>
            <div className="space-y-4">
              {incomeSources.map((source, index) => (
                <motion.div
                  key={source.source}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 rounded-full bg-blue-400" />
                    <span className="text-white font-medium">{source.source}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-semibold">${source.amount.toLocaleString()}</div>
                    <div className="text-sm text-gray-400">{source.percentage}% of total</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Right Column - AI Suggestions */}
        <div className="space-y-6">
          {/* AIVEL Growth Fund */}
          <GlassCard>
            <h2 className="text-xl font-semibold text-white mb-4">AIVEL Growth Fund</h2>
            <div className="space-y-4">
              <div className="bg-gray-700/30 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="text-blue-400 font-medium">30% Growth Fund</div>
                    <div className="text-2xl font-bold text-cyan-400">$3,720</div>
                  </div>
                  <div className="text-right">
                    <div className="text-green-400 font-medium">70% Your Revenue</div>
                    <div className="text-2xl font-bold text-green-400">$8,680</div>
                  </div>
                </div>
                <p className="text-gray-300 text-sm mt-3">
                  Fueling evolution towards <strong>AIVEL 10.0</strong> - The self-upgrading AI ecosystem
                </p>
              </div>
            </div>
          </GlassCard>

          {/* AI Growth Suggestions */}
          <GlassCard>
            <h2 className="text-xl font-semibold text-white mb-4">AI Growth Suggestions</h2>
            <div className="space-y-4">
              {aiSuggestions.map((suggestion, index) => (
                <motion.div
                  key={suggestion.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2 }}
                  className="bg-gray-700/30 rounded-lg p-4 border-l-4 border-blue-500"
                >
                  <h3 className="font-semibold text-white mb-1">{suggestion.title}</h3>
                  <p className="text-gray-300 text-sm mb-2">{suggestion.description}</p>
                  <div className="flex justify-between text-xs">
                    <span className="text-green-400">Impact: {suggestion.impact}</span>
                    <span className="text-yellow-400">Effort: {suggestion.effort}</span>
                  </div>
                </motion.div>
              ))}
            </div>
            
            <button className="w-full mt-4 bg-gradient-to-r from-green-500 to-cyan-600 hover:from-green-600 hover:to-cyan-700 py-3 px-4 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105">
              🚀 Implement All Suggestions
            </button>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}