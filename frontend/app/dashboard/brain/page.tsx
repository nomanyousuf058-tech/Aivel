"use client"

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Brain, 
  Play, 
  Pause, 
  RotateCcw, 
  Activity,
  Zap,
  TrendingUp,
  Users,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import AppShell from '@/components/layouts/AppShell'

interface BrainTask {
  id: string
  role: 'CEO' | 'DEVELOPER' | 'MARKETING' | 'OPERATIONS'
  objective: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  result?: string
  startedAt?: Date
  completedAt?: Date
}

export default function BrainPage() {
  const [tasks, setTasks] = useState<BrainTask[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [selectedRole, setSelectedRole] = useState<'CEO' | 'DEVELOPER' | 'MARKETING' | 'OPERATIONS'>('CEO')
  const [objective, setObjective] = useState('')
  const [brainStatus, setBrainStatus] = useState<'online' | 'offline' | 'thinking'>('online')

  useEffect(() => {
    // Check brain status
    fetch('/api/ai/brain')
      .then(r => r.json())
      .then(d => setBrainStatus(d?.ok ? 'online' : 'offline'))
      .catch(() => setBrainStatus('offline'))
  }, [])

  const runTask = async () => {
    if (!objective.trim()) return

    const newTask: BrainTask = {
      id: Date.now().toString(),
      role: selectedRole,
      objective: objective.trim(),
      status: 'running',
      startedAt: new Date()
    }

    setTasks(prev => [newTask, ...prev])
    setBrainStatus('thinking')
    setIsRunning(true)

    try {
      const response = await fetch('/api/ai/brain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: selectedRole, objective: objective.trim() })
      })

      const result = await response.json()
      
      setTasks(prev => prev.map(task => 
        task.id === newTask.id 
          ? { ...task, status: 'completed', result: result.result, completedAt: new Date() }
          : task
      ))
    } catch (error) {
      setTasks(prev => prev.map(task => 
        task.id === newTask.id 
          ? { ...task, status: 'failed', completedAt: new Date() }
          : task
      ))
    } finally {
      setIsRunning(false)
      setBrainStatus('online')
      setObjective('')
    }
  }

  const getStatusIcon = (status: BrainTask['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'failed': return <AlertCircle className="w-4 h-4 text-red-500" />
      case 'running': return <Activity className="w-4 h-4 text-blue-500 animate-pulse" />
      default: return <Clock className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: BrainTask['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
      case 'failed': return 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
      case 'running': return 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'
      default: return 'bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700'
    }
  }

  return (
    <AppShell>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">AI Brain</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Autonomous AI company brain for strategic decisions and task execution
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${
              brainStatus === 'online' 
                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                : brainStatus === 'thinking'
                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                brainStatus === 'online' ? 'bg-green-500' : 
                brainStatus === 'thinking' ? 'bg-blue-500 animate-pulse' : 'bg-red-500'
              }`} />
              <span className="capitalize">{brainStatus}</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Tasks Completed</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {tasks.filter(t => t.status === 'completed').length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Tasks</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {tasks.filter(t => t.status === 'running').length}
                </p>
              </div>
              <Activity className="w-8 h-8 text-blue-500" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Success Rate</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {tasks.length > 0 ? Math.round((tasks.filter(t => t.status === 'completed').length / tasks.length) * 100) : 0}%
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Tasks</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{tasks.length}</p>
              </div>
              <Brain className="w-8 h-8 text-purple-500" />
            </div>
          </motion.div>
        </div>

        {/* Task Runner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700"
        >
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Run AI Task</h2>
          
          <div className="space-y-4">
            <div className="flex space-x-4">
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as any)}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="CEO">CEO - Strategic Decisions</option>
                <option value="DEVELOPER">Developer - Code & Technical</option>
                <option value="MARKETING">Marketing - Growth & Content</option>
                <option value="OPERATIONS">Operations - Process & Efficiency</option>
              </select>
            </div>

            <div>
              <textarea
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
                placeholder="Describe what you want the AI to do..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={3}
              />
            </div>

            <div className="flex justify-end">
              <button
                onClick={runTask}
                disabled={!objective.trim() || isRunning}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isRunning ? (
                  <>
                    <Activity className="w-4 h-4 animate-pulse" />
                    <span>Running...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    <span>Run Task</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Task History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
        >
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Task History</h2>
          </div>
          
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {tasks.length === 0 ? (
              <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                No tasks yet. Run your first AI task above.
              </div>
            ) : (
              tasks.map((task) => (
                <div key={task.id} className={`p-6 ${getStatusColor(task.status)}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        {getStatusIcon(task.status)}
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {task.role}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {task.startedAt?.toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 mb-2">{task.objective}</p>
                      {task.result && (
                        <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                          <p className="text-sm text-gray-600 dark:text-gray-400">Result:</p>
                          <p className="text-sm text-gray-800 dark:text-gray-200 mt-1">{task.result}</p>
                        </div>
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
