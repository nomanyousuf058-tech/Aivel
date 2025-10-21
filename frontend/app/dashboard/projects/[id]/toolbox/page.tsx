'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
   Wrench, 
  Plus,
  Search,
  Zap,
  BarChart3,
  Code2,
  Settings
} from 'lucide-react'
import Button from '@/components/ui/Button'

export default function Toolbox() {
  const [installedTools, setInstalledTools] = useState([
    { id: 1, name: 'SEO Analyzer', category: 'business', installed: true },
    { id: 2, name: 'Code Optimizer', category: 'technical', installed: true },
    { id: 3, name: 'Performance Monitor', category: 'technical', installed: false },
    { id: 4, name: 'Content Generator', category: 'business', installed: false },
  ])

  const availableTools = [
    { id: 5, name: 'Security Scanner', category: 'technical', price: '$49' },
    { id: 6, name: 'Analytics Dashboard', category: 'business', price: '$29' },
    { id: 7, name: 'AI Code Assistant', category: 'technical', price: '$99' },
    { id: 8, name: 'Social Media Manager', category: 'business', price: '$39' },
  ]

  const installTool = (toolId: number) => {
    setInstalledTools(prev => 
      prev.map(tool => 
        tool.id === toolId ? { ...tool, installed: true } : tool
      )
    )
  }

  const installed = installedTools.filter(t => t.installed)

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center space-x-3">
            <Wrench className="h-8 w-8 text-yellow-400" />
            <span>Project Toolbox</span>
          </h1>
          <p className="text-gray-300 mt-2">
            Use purchased tools in your technical and business dashboards
          </p>
        </div>
        <Button leftIcon={<Plus className="h-5 w-5" />}>Get More Tools</Button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Installed Tools */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Installed Tools</h3>
          <div className="space-y-3">
            {installed.length === 0 ? (
              <div className="text-gray-400 p-4">No tools installed yet.</div>
            ) : (
              installed.map((tool) => (
                <div
                  key={tool.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <Zap className="h-5 w-5 text-yellow-400" />
                    <div>
                      <div className="text-white font-medium">{tool.name}</div>
                      <div className="text-sm text-gray-400 capitalize">{tool.category}</div>
                    </div>
                  </div>
                  <Button size="sm">Use Tool</Button>
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Available Tools */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Available Tools</h3>
          <div className="space-y-3">
            {availableTools.map((tool) => (
              <div
                key={tool.id}
                className="flex items-center justify-between p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  {tool.category === 'technical' ? (
                    <Code2 className="h-5 w-5 text-blue-400" />
                  ) : (
                    <BarChart3 className="h-5 w-5 text-green-400" />
                  )}
                  <div>
                    <div className="text-white font-medium">{tool.name}</div>
                    <div className="text-sm text-gray-400 capitalize">{tool.category}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-yellow-400 font-semibold">{tool.price}</span>
                  <Button size="sm" onClick={() => installTool(tool.id)}>Purchase</Button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Tool Integration Guide */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card"
      >
        <h3 className="text-lg font-semibold text-white mb-4">How to Use Tools</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="p-4 rounded-lg bg-blue-500/10">
            <div className="text-blue-400 font-semibold mb-2">1. Purchase Tool</div>
            <p className="text-gray-300">Buy tools from AIVEL Store</p>
          </div>
          <div className="p-4 rounded-lg bg-green-500/10">
            <div className="text-green-400 font-semibold mb-2">2. Install in Toolbox</div>
            <p className="text-gray-300">Tools appear in your project toolbox</p>
          </div>
          <div className="p-4 rounded-lg bg-purple-500/10">
            <div className="text-purple-400 font-semibold mb-2">3. Use Anywhere</div>
            <p className="text-gray-300">Access tools from Technical or Business dashboards</p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}