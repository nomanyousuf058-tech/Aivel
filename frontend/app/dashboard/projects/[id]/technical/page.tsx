"use client"

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FileText, 
  Search, 
  GitBranch, 
  Terminal, 
  Settings, 
  Play,
  Pause,
  RotateCcw,
  Download,
  Upload,
  FolderOpen,
  Code,
  Bug,
  CheckCircle,
  AlertCircle,
  Clock,
  Brain,
  Zap
} from 'lucide-react'
import AppShell from '@/components/layouts/AppShell'

interface FileNode {
  id: string
  name: string
  type: 'file' | 'folder'
  children?: FileNode[]
  content?: string
  language?: string
}

interface Task {
  id: string
  type: 'fix' | 'feature' | 'refactor' | 'test'
  description: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  result?: string
  startedAt?: Date
  completedAt?: Date
}

export default function TechnicalDashboard({ params }: { params: Promise<{ id: string }> }) {
  const [projectId, setProjectId] = useState<string>('')
  const [activeTab, setActiveTab] = useState<'files' | 'search' | 'git' | 'terminal' | 'api'>('files')
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null)
  const [fileContent, setFileContent] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [tasks, setTasks] = useState<Task[]>([])
  const [isRunning, setIsRunning] = useState(false)

  useEffect(() => {
    params.then(p => setProjectId(p.id))
  }, [params])

  // Mock file tree
  const fileTree: FileNode[] = [
    {
      id: '1',
      name: 'src',
      type: 'folder',
      children: [
        {
          id: '2',
          name: 'components',
          type: 'folder',
          children: [
            { id: '3', name: 'Button.tsx', type: 'file', language: 'typescript' },
            { id: '4', name: 'Modal.tsx', type: 'file', language: 'typescript' }
          ]
        },
        {
          id: '5',
          name: 'pages',
          type: 'folder',
          children: [
            { id: '6', name: 'index.tsx', type: 'file', language: 'typescript' },
            { id: '7', name: 'about.tsx', type: 'file', language: 'typescript' }
          ]
        },
        { id: '8', name: 'App.tsx', type: 'file', language: 'typescript' }
      ]
    },
    { id: '9', name: 'package.json', type: 'file', language: 'json' },
    { id: '10', name: 'README.md', type: 'file', language: 'markdown' }
  ]

  const runAIFix = async () => {
    if (!selectedFile) return

    const newTask: Task = {
      id: Date.now().toString(),
      type: 'fix',
      description: `AI Fix for ${selectedFile.name}`,
      status: 'running',
      startedAt: new Date()
    }

    setTasks(prev => [newTask, ...prev])
    setIsRunning(true)

    try {
      const response = await fetch('/api/ai/brain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          role: 'DEVELOPER', 
          objective: `Analyze and fix issues in ${selectedFile.name}: ${fileContent}` 
        })
      })

      const result = await response.json()
      
      setTasks(prev => prev.map(task => 
        task.id === newTask.id 
          ? { ...task, status: 'completed', result: result.result, completedAt: new Date() }
          : task
      ))

      // Update file content with AI suggestions
      if (result.result) {
        setFileContent(result.result)
      }
    } catch (error) {
      setTasks(prev => prev.map(task => 
        task.id === newTask.id 
          ? { ...task, status: 'failed', completedAt: new Date() }
          : task
      ))
    } finally {
      setIsRunning(false)
    }
  }

  const getStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'failed': return <AlertCircle className="w-4 h-4 text-red-500" />
      case 'running': return <Clock className="w-4 h-4 text-blue-500 animate-pulse" />
      default: return <Clock className="w-4 h-4 text-gray-400" />
    }
  }

  const getTaskTypeColor = (type: Task['type']) => {
    switch (type) {
      case 'fix': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
      case 'feature': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
      case 'refactor': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'test': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
    }
  }

  const renderFileTree = (nodes: FileNode[], level = 0) => {
    return nodes.map(node => (
      <div key={node.id} className="select-none">
        <div
          className={`flex items-center py-1 px-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer rounded ${
            selectedFile?.id === node.id ? 'bg-blue-50 dark:bg-blue-900/30' : ''
          }`}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
          onClick={() => {
            if (node.type === 'file') {
              setSelectedFile(node)
              setFileContent(`// ${node.name}\n// Mock content for demonstration\n\nconst example = "Hello World";\n\nfunction main() {\n  console.log(example);\n}\n\nmain();`)
            }
          }}
        >
          {node.type === 'folder' ? (
            <FolderOpen className="w-4 h-4 text-blue-500 mr-2" />
          ) : (
            <FileText className="w-4 h-4 text-gray-500 mr-2" />
          )}
          <span className="text-sm text-gray-700 dark:text-gray-300">{node.name}</span>
        </div>
        {node.children && renderFileTree(node.children, level + 1)}
      </div>
    ))
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'files':
        return (
          <div className="h-full overflow-y-auto">
            {renderFileTree(fileTree)}
          </div>
        )
      
      case 'search':
        return (
          <div className="p-4 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search in files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {searchQuery ? `Search results for "${searchQuery}"` : 'Enter a search term to find files and content'}
            </div>
          </div>
        )
      
      case 'git':
        return (
          <div className="p-4 space-y-4">
            <div className="flex items-center space-x-2">
              <GitBranch className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Git Status</span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-gray-600 dark:text-gray-400">Working tree clean</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <span className="text-gray-600 dark:text-gray-400">On branch main</span>
              </div>
            </div>
          </div>
        )
      
      case 'terminal':
        return (
          <div className="p-4 h-full">
            <div className="bg-black text-green-400 font-mono text-sm p-4 rounded-lg h-full overflow-y-auto">
              <div className="mb-2">$ npm run dev</div>
              <div className="mb-2">Starting development server...</div>
              <div className="mb-2">✓ Ready on http://localhost:3000</div>
              <div className="mb-2">$ _</div>
            </div>
          </div>
        )
      
      case 'api':
        return (
          <div className="p-4 space-y-4">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              API endpoints and documentation
            </div>
            <div className="space-y-2">
              <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded text-sm font-mono">
                GET /api/projects/{projectId}
              </div>
              <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded text-sm font-mono">
                POST /api/ai/brain
              </div>
            </div>
          </div>
        )
      
      default:
        return null
    }
  }

  return (
    <AppShell>
      <div className="h-screen flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              Technical Dashboard - Project {projectId}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Cursor-like development workspace with AI-powered fixes
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={runAIFix}
              disabled={!selectedFile || isRunning}
              className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isRunning ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>AI Fixing...</span>
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4" />
                  <span>AI Fix</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="flex-1 flex">
          {/* Sidebar */}
          <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
            {/* Tab Navigation */}
            <div className="flex border-b border-gray-200 dark:border-gray-700">
              {[
                { id: 'files', label: 'Files', icon: FileText },
                { id: 'search', label: 'Search', icon: Search },
                { id: 'git', label: 'Git', icon: GitBranch },
                { id: 'terminal', label: 'Terminal', icon: Terminal },
                { id: 'api', label: 'API', icon: Settings }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 flex items-center justify-center p-2 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-b-2 border-blue-500'
                      : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-hidden">
              {renderTabContent()}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col">
            {selectedFile ? (
              <>
                {/* Editor Header */}
                <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {selectedFile.name}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {selectedFile.language}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                      <Download className="w-4 h-4" />
                    </button>
                    <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                      <Upload className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Code Editor */}
                <div className="flex-1 p-4">
                  <textarea
                    value={fileContent}
                    onChange={(e) => setFileContent(e.target.value)}
                    className="w-full h-full font-mono text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg p-4 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="File content will appear here..."
                  />
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
                <div className="text-center">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Select a file to view and edit</p>
                </div>
              </div>
            )}
          </div>

          {/* Task Panel */}
          <div className="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI Tasks</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                AI-powered fixes and improvements
              </p>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {tasks.length === 0 ? (
                <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                  <Brain className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No AI tasks yet</p>
                  <p className="text-xs">Select a file and click "AI Fix"</p>
                </div>
              ) : (
                tasks.map((task) => (
                  <div key={task.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(task.status)}
                        <span className={`px-2 py-1 text-xs font-medium rounded ${getTaskTypeColor(task.type)}`}>
                          {task.type}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {task.startedAt?.toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{task.description}</p>
                    {task.result && (
                      <div className="mt-2 p-2 bg-white dark:bg-gray-800 rounded text-xs text-gray-600 dark:text-gray-400">
                        {task.result}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}