"use client";
import React from 'react'
import { motion } from 'framer-motion'
import { Brain, Activity, Zap, CheckCircle, AlertCircle } from 'lucide-react'

export default function BrainOverview() {
  const [status, setStatus] = React.useState<string>('checking...')
  const [isOnline, setIsOnline] = React.useState(false)
  
  React.useEffect(() => {
    fetch('/api/ai/brain')
      .then(r => r.json())
      .then(d => {
        const online = d?.ok || d?.name
        setStatus(online ? 'online' : 'offline')
        setIsOnline(online)
      })
      .catch(() => {
        setStatus('offline')
        setIsOnline(false)
      })
  }, [])

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card group"
    >
      <div className="flex items-center space-x-3 mb-4">
        <motion.div
          animate={{ 
            scale: isOnline ? [1, 1.1, 1] : 1,
            rotate: isOnline ? [0, 5, -5, 0] : 0
          }}
          transition={{ 
            duration: 2, 
            repeat: isOnline ? Infinity : 0,
            ease: "easeInOut"
          }}
          className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center"
        >
          <Brain className="h-5 w-5 text-white" />
        </motion.div>
        <div>
          <h3 className="text-lg font-semibold text-white">AI Brain</h3>
          <p className="text-sm text-gray-400">Neural Network Status</p>
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">Status</span>
          <div className="flex items-center space-x-2">
            {isOnline ? (
              <CheckCircle className="h-4 w-4 text-green-400" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-400" />
            )}
            <span className={`text-sm font-medium ${
              isOnline ? 'text-green-400' : 'text-red-400'
            }`}>
              {status}
            </span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">Processing</span>
          <span className="text-sm font-medium text-white">3 Tasks</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">Success Rate</span>
          <span className="text-sm font-medium text-green-400">98.5%</span>
        </div>
      </div>
      
      <motion.div 
        className="mt-4 p-3 rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex items-center space-x-2 text-purple-400">
          <Zap className="h-4 w-4" />
          <span className="text-sm font-medium">AI Learning Mode: Active</span>
        </div>
      </motion.div>
    </motion.div>
  )
}



