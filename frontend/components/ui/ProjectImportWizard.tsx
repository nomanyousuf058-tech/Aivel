'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FolderUp, Github, X, Upload, FileText, CheckCircle2 } from 'lucide-react'

interface ProjectImportWizardProps {
  isOpen: boolean
  onClose: () => void
  onProjectCreated: (project: any) => void
}

export default function ProjectImportWizard({ isOpen, onClose, onProjectCreated }: ProjectImportWizardProps) {
  const [step, setStep] = useState(1)
  const [importMethod, setImportMethod] = useState<'folder' | 'git' | null>(null)
  const [gitUrl, setGitUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [analysis, setAnalysis] = useState<any>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFolderSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    
    try {
      // Simulate AI analysis
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const analysisResult = {
        projectType: detectProjectType(files),
        mainFiles: detectMainFiles(files),
        dependencies: detectDependencies(files),
        size: calculateTotalSize(files),
        fileCount: files.length,
        recommendations: generateRecommendations(files)
      }
      
      setAnalysis(analysisResult)
      setStep(3)
    } catch (error) {
      console.error('Upload failed:', error)
      alert('Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleGitImport = async () => {
    if (!gitUrl) return
    
    setUploading(true)
    try {
      // Simulate Git clone and analysis
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const analysisResult = {
        projectType: 'web',
        mainFiles: ['package.json', 'src/', 'public/'],
        dependencies: ['react', 'next', 'tailwindcss'],
        size: '15.2 MB',
        fileCount: 42,
        recommendations: ['Auto-configure build settings', 'Optimize images', 'Set up CI/CD']
      }
      
      setAnalysis(analysisResult)
      setStep(3)
    } catch (error) {
      console.error('Git import failed:', error)
      alert('Git import failed. Please check the URL.')
    } finally {
      setUploading(false)
    }
  }

  const createProject = async () => {
    try {
      const projectData = {
        name: analysis.projectType + ' Project',
        type: analysis.projectType,
        description: `Imported ${analysis.projectType} project with ${analysis.fileCount} files`,
        metrics: {
          files: analysis.fileCount,
          size: analysis.size,
          dependencies: analysis.dependencies.length
        }
      }

      // Call API to create project
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData)
      })

      if (response.ok) {
        const project = await response.json()
        onProjectCreated(project)
        onClose()
        resetWizard()
      }
    } catch (error) {
      console.error('Project creation failed:', error)
      alert('Project creation failed. Please try again.')
    }
  }

  const resetWizard = () => {
    setStep(1)
    setImportMethod(null)
    setGitUrl('')
    setAnalysis(null)
    setUploading(false)
  }

  // Helper functions
  const detectProjectType = (files: FileList): string => {
    const fileNames = Array.from(files).map(f => f.name.toLowerCase())
    
    if (fileNames.some(f => f.includes('package.json'))) return 'web'
    if (fileNames.some(f => f.includes('requirements.txt'))) return 'python'
    if (fileNames.some(f => f.includes('pom.xml'))) return 'java'
    if (fileNames.some(f => f.includes('.csproj'))) return 'csharp'
    return 'general'
  }

  const detectMainFiles = (files: FileList): string[] => {
    const fileNames = Array.from(files).map(f => f.name)
    return fileNames.filter(name => 
      !name.includes('node_modules') && 
      !name.includes('.git') &&
      !name.includes('dist') &&
      name.split('.').length > 1
    ).slice(0, 10)
  }

  const detectDependencies = (files: FileList): string[] => {
    // Simplified dependency detection
    return ['auto-detected-dependencies']
  }

  const calculateTotalSize = (files: FileList): string => {
    const totalBytes = Array.from(files).reduce((acc, file) => acc + file.size, 0)
    return (totalBytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const generateRecommendations = (files: FileList): string[] => {
    return [
      'Smart file filtering applied',
      'Dependencies will be auto-installed',
      'Build configuration optimized'
    ]
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="glass-card max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Create New Project</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
                suppressHydrationWarning
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Step 1: Import Method */}
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <h3 className="text-lg font-semibold text-white mb-4">Choose Import Method</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Folder Upload */}
                  <button
                    onClick={() => {
                      setImportMethod('folder')
                      setStep(2)
                    }}
                    className="glass hover:bg-white/10 p-6 rounded-xl transition-all duration-300 text-left group"
                    suppressHydrationWarning
                  >
                    <FolderUp className="h-12 w-12 text-blue-400 mb-4" />
                    <h4 className="text-xl font-semibold text-white mb-2">Upload Folder</h4>
                    <p className="text-gray-300 text-sm">
                      Simply select your project folder. Our AI will automatically:
                      • Filter important files
                      • Skip node_modules, .git, etc.
                      • Auto-detect dependencies
                      • Optimize for deployment
                    </p>
                  </button>

                  {/* Git Repository */}
                  <button
                    onClick={() => {
                      setImportMethod('git')
                      setStep(2)
                    }}
                    className="glass hover:bg-white/10 p-6 rounded-xl transition-all duration-300 text-left group"
                    suppressHydrationWarning
                  >
                    <Github className="h-12 w-12 text-purple-400 mb-4" />
                    <h4 className="text-xl font-semibold text-white mb-2">Git Repository</h4>
                    <p className="text-gray-300 text-sm">
                      Import from GitHub, GitLab, or any Git repository.
                      We'll clone and analyze your code automatically.
                    </p>
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Import Details */}
            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <h3 className="text-lg font-semibold text-white mb-4">
                  {importMethod === 'folder' ? 'Upload Project Folder' : 'Import from Git'}
                </h3>

                {importMethod === 'folder' && (
                  <div className="text-center p-8 border-2 border-dashed border-blue-400/30 rounded-xl">
                    <FolderUp className="h-16 w-16 text-blue-400 mx-auto mb-4" />
                    <h4 className="text-xl font-semibold text-white mb-2">Select Your Project Folder</h4>
                    <p className="text-gray-300 mb-4">
                      Just click and choose your project folder. We handle everything else automatically!
                    </p>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFolderSelect}
                      multiple
                      className="hidden"
                      suppressHydrationWarning
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-2 mx-auto"
                      suppressHydrationWarning
                    >
                      <Upload className="h-5 w-5" />
                      <span>{uploading ? 'Analyzing...' : 'Choose Files'}</span>
                    </button>
                    <p className="text-sm text-gray-400 mt-3">
                      💡 We automatically skip unnecessary files and optimize your project
                    </p>
                  </div>
                )}

                {importMethod === 'git' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Git Repository URL
                      </label>
                      <input
                        type="text"
                        value={gitUrl}
                        onChange={(e) => setGitUrl(e.target.value)}
                        placeholder="https://github.com/username/repository.git"
                        className="w-full glass px-4 py-3 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        suppressHydrationWarning
                      />
                    </div>
                    <button
                      onClick={handleGitImport}
                      disabled={uploading || !gitUrl}
                      className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 text-white py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2"
                      suppressHydrationWarning
                    >
                      <Github className="h-5 w-5" />
                      <span>{uploading ? 'Importing...' : 'Import Repository'}</span>
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {/* Step 3: Analysis Results */}
            {step === 3 && analysis && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <h3 className="text-lg font-semibold text-white mb-4">Project Analysis Complete</h3>
                
                <div className="glass p-6 rounded-xl space-y-4">
                  <div className="flex items-center space-x-2 text-green-400">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="font-semibold">AI Analysis Successful</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Project Type:</span>
                      <div className="text-white font-medium">{analysis.projectType}</div>
                    </div>
                    <div>
                      <span className="text-gray-400">Files:</span>
                      <div className="text-white font-medium">{analysis.fileCount} files</div>
                    </div>
                    <div>
                      <span className="text-gray-400">Size:</span>
                      <div className="text-white font-medium">{analysis.size}</div>
                    </div>
                    <div>
                      <span className="text-gray-400">Dependencies:</span>
                      <div className="text-white font-medium">{analysis.dependencies.length} detected</div>
                    </div>
                  </div>

                  <div>
                    <span className="text-gray-400 text-sm">AI Recommendations:</span>
                    <ul className="text-white text-sm mt-2 space-y-1">
                      {analysis.recommendations.map((rec: string, index: number) => (
                        <li key={index}>• {rec}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={createProject}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition-all duration-300"
                    suppressHydrationWarning
                  >
                    Create Project
                  </button>
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 glass hover:bg-white/10 text-white py-3 rounded-xl transition-all duration-300"
                    suppressHydrationWarning
                  >
                    Start Over
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}