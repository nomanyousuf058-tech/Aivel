"use client"

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Settings, 
  Key, 
  Database, 
  Brain, 
  Save, 
  Check, 
  AlertCircle,
  Eye,
  EyeOff,
  TestTube
} from 'lucide-react'
import AppShell from '@/components/layouts/AppShell'

interface ApiKey {
  name: string
  key: string
  placeholder: string
  description: string
  required: boolean
  status: 'valid' | 'invalid' | 'unknown'
}

export default function SettingsPage() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([
    {
      name: 'OPENAI_API_KEY',
      key: '',
      placeholder: 'sk-...',
      description: 'OpenAI API key for GPT-5 and core AI functionality',
      required: true,
      status: 'unknown'
    },
    {
      name: 'DEEPSEEK_API_KEY',
      key: '',
      placeholder: 'sk-...',
      description: 'DeepSeek API key for code generation and development tasks',
      required: true,
      status: 'unknown'
    },
    {
      name: 'NOTION_API_KEY',
      key: '',
      placeholder: 'secret_...',
      description: 'Notion API key for task and operations management',
      required: false,
      status: 'unknown'
    },
    {
      name: 'JASPER_API_KEY',
      key: '',
      placeholder: 'jasper_...',
      description: 'Jasper AI API key for marketing content generation',
      required: false,
      status: 'unknown'
    },
    {
      name: 'ZAPIER_KEY',
      key: '',
      placeholder: 'zapier_...',
      description: 'Zapier API key for automation workflows',
      required: false,
      status: 'unknown'
    }
  ])

  const [dbConfig, setDbConfig] = useState({
    url: '',
    status: 'unknown' as 'valid' | 'invalid' | 'unknown'
  })

  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({})
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState<Record<string, boolean>>({})

  useEffect(() => {
    // Load existing keys from localStorage or API
    const savedKeys = localStorage.getItem('aivel_api_keys')
    if (savedKeys) {
      try {
        const parsed = JSON.parse(savedKeys)
        setApiKeys(prev => prev.map(key => ({
          ...key,
          key: parsed[key.name] || ''
        })))
      } catch (error) {
        console.error('Failed to load saved API keys:', error)
      }
    }
  }, [])

  const updateApiKey = (name: string, value: string) => {
    setApiKeys(prev => prev.map(key => 
      key.name === name ? { ...key, key: value } : key
    ))
  }

  const toggleKeyVisibility = (name: string) => {
    setShowKeys(prev => ({ ...prev, [name]: !prev[name] }))
  }

  const testApiKey = async (name: string) => {
    setTesting(prev => ({ ...prev, [name]: true }))
    
    try {
      const response = await fetch(`/api/ai/providers/${name.toLowerCase().replace('_api_key', '')}/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: apiKeys.find(k => k.name === name)?.key })
      })

      const result = await response.json()
      
      setApiKeys(prev => prev.map(key => 
        key.name === name 
          ? { ...key, status: result.valid ? 'valid' : 'invalid' }
          : key
      ))
    } catch (error) {
      setApiKeys(prev => prev.map(key => 
        key.name === name ? { ...key, status: 'invalid' } : key
      ))
    } finally {
      setTesting(prev => ({ ...prev, [name]: false }))
    }
  }

  const testDatabase = async () => {
    try {
      const response = await fetch('/api/db/health')
      const result = await response.json()
      setDbConfig(prev => ({ ...prev, status: result.ok ? 'valid' : 'invalid' }))
    } catch (error) {
      setDbConfig(prev => ({ ...prev, status: 'invalid' }))
    }
  }

  const saveSettings = async () => {
    setSaving(true)
    
    try {
      // Save API keys to localStorage
      const keysToSave = apiKeys.reduce((acc, key) => {
        acc[key.name] = key.key
        return acc
      }, {} as Record<string, string>)
      
      localStorage.setItem('aivel_api_keys', JSON.stringify(keysToSave))
      
      // In a real app, you'd send these to your backend
      // await fetch('/api/settings/keys', { method: 'POST', body: JSON.stringify(keysToSave) })
      
      // Show success feedback
      setTimeout(() => setSaving(false), 1000)
    } catch (error) {
      console.error('Failed to save settings:', error)
      setSaving(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'valid': return <Check className="w-4 h-4 text-green-500" />
      case 'invalid': return <AlertCircle className="w-4 h-4 text-red-500" />
      default: return <div className="w-4 h-4 rounded-full bg-gray-300 dark:bg-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'valid': return 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
      case 'invalid': return 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
      default: return 'border-gray-200 dark:border-gray-700'
    }
  }

  return (
    <AppShell>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Configure API keys, database, and system preferences
            </p>
          </div>
          
          <button
            onClick={saveSettings}
            disabled={saving}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Settings</span>
              </>
            )}
          </button>
        </div>

        {/* API Keys */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
        >
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <Key className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">API Keys</h2>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Configure your AI service API keys for full functionality
            </p>
          </div>
          
          <div className="p-6 space-y-6">
            {apiKeys.map((apiKey, index) => (
              <motion.div
                key={apiKey.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-lg border ${getStatusColor(apiKey.status)}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">{apiKey.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {apiKey.description}
                    </p>
                    {apiKey.required && (
                      <span className="inline-block mt-1 px-2 py-1 text-xs font-medium text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30 rounded">
                        Required
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(apiKey.status)}
                    <button
                      onClick={() => testApiKey(apiKey.name)}
                      disabled={!apiKey.key || testing[apiKey.name]}
                      className="flex items-center space-x-1 px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors"
                    >
                      {testing[apiKey.name] ? (
                        <div className="w-3 h-3 border border-gray-500 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <TestTube className="w-3 h-3" />
                      )}
                      <span>Test</span>
                    </button>
                  </div>
                </div>
                
                <div className="relative">
                  <input
                    type={showKeys[apiKey.name] ? 'text' : 'password'}
                    value={apiKey.key}
                    onChange={(e) => updateApiKey(apiKey.name, e.target.value)}
                    placeholder={apiKey.placeholder}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => toggleKeyVisibility(apiKey.name)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showKeys[apiKey.name] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Database Configuration */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
        >
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <Database className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Database</h2>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Neon PostgreSQL connection status and configuration
            </p>
          </div>
          
          <div className="p-6">
            <div className={`p-4 rounded-lg border ${getStatusColor(dbConfig.status)}`}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Connection Status</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Database connectivity and health check
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(dbConfig.status)}
                  <button
                    onClick={testDatabase}
                    className="flex items-center space-x-1 px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    <TestTube className="w-3 h-3" />
                    <span>Test</span>
                  </button>
                </div>
              </div>
              
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {dbConfig.status === 'valid' && 'Database connection is healthy and ready'}
                {dbConfig.status === 'invalid' && 'Database connection failed - check your DATABASE_URL'}
                {dbConfig.status === 'unknown' && 'Click Test to check database connectivity'}
              </div>
            </div>
          </div>
        </motion.div>

        {/* System Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
        >
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <Brain className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">System Status</h2>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Overall system health and AI brain status
            </p>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">AI Brain</h3>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Online</span>
                </div>
              </div>
              
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">Memory System</h3>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Active</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AppShell>
  )
}
