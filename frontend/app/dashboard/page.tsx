'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Plus, 
  Search, 
  Filter, 
  Upload, 
  Brain, 
  BarChart3, 
  TrendingUp, 
  Users, 
  Zap,
  Star,
  Clock,
  Activity,
  Target,
  Sparkles,
  ArrowUpRight,
  Globe,
  Shield
} from 'lucide-react'
import { Project } from '@/types'
import BrainOverview from '@/components/dashboard/BrainOverview'
import TaskQueue from '@/components/dashboard/TaskQueue'
import ProjectCard from '@/components/ui/ProjectCard'
import AppShell from '@/components/layouts/AppShell'
import { projectsApi } from '@/lib/api'
import ProjectImportWizard from '@/components/ui/ProjectImportWizard'
import FolderUpload from '@/components/ui/FolderUpload'
import Button from '@/components/ui/Button'
import Skeleton from '@/components/ui/Skeleton'

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [wizardOpen, setWizardOpen] = useState(false)
  const [folderUploadOpen, setFolderUploadOpen] = useState(false)

  // Mock data for demonstration
  const stats = [
    { label: 'Total Projects', value: '24', icon: Globe, change: '+12%', color: 'text-blue-400' },
    { label: 'Active AI Tasks', value: '8', icon: Brain, change: '+3', color: 'text-purple-400' },
    { label: 'Revenue Generated', value: '$12.4K', icon: TrendingUp, change: '+18%', color: 'text-green-400' },
    { label: 'Success Rate', value: '98.5%', icon: Target, change: '+2.1%', color: 'text-orange-400' }
  ]

  const recentActivity = [
    { action: 'AI completed code review', project: 'E-commerce Platform', time: '2 min ago', icon: Shield },
    { action: 'New project created', project: 'Mobile App', time: '1 hour ago', icon: Plus },
    { action: 'Revenue milestone reached', project: 'SaaS Dashboard', time: '3 hours ago', icon: TrendingUp },
    { action: 'AI optimization applied', project: 'API Gateway', time: '5 hours ago', icon: Zap }
  ]

  const fetchProjects = async () => {
    try {
      setLoading(true)
      const response = await projectsApi.getAll()
      
      console.log('API Response:', response)
      
      let projectsData: Project[] = []
      
      if (response && response.data) {
        projectsData = response.data
      } else if (Array.isArray(response)) {
        projectsData = response
      } else {
        console.warn('Unexpected API response structure:', response)
        const mockProjects = (await import('@/mocks/projects.json')).default
        projectsData = (mockProjects.projects || []) as Project[]
      }
      
      setProjects(projectsData)
    } catch (error) {
      console.error('Failed to fetch projects:', error)
      try {
        const mockProjects = (await import('@/mocks/projects.json')).default
        setProjects((mockProjects.projects || []) as Project[])
      } catch (mockError) {
        console.error('Failed to load mock projects:', mockError)
        setProjects([])
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  const handleProjectCreated = (newProject: Project) => {
    setProjects(prev => [newProject, ...prev])
  }

  const handleFolderUpload = (files: any[]) => {
    const newProject: Project = {
      id: Date.now().toString(),
      name: `Uploaded Project ${Date.now()}`,
      description: `Project created from ${files.length} uploaded files`,
      type: 'web', // Required: 'web' | 'mobile' | 'desktop' | 'api' | 'other'
      status: 'active', // Required: 'active' | 'archived' | 'draft'
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      technologies: ['Uploaded Files'],
      repositoryUrl: '',
      liveUrl: ''
    }
    setProjects(prev => [newProject, ...prev])
  }

  const filteredProjects = (projects || []).filter(project =>
    project?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project?.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <>
      <AppShell>
        <div className="p-8 space-y-8">
          {/* Welcome Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6"
          >
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                Welcome back! 👋
              </h1>
              <p className="text-xl text-gray-300">
                Here's what's happening with your projects today
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button 
                onClick={() => setWizardOpen(true)}
                variant="gradient"
                size="lg"
                leftIcon={<Plus className="h-5 w-5" />}
                glow
              >
                New Project
              </Button>
              <Button 
                onClick={() => setFolderUploadOpen(true)}
                variant="glass"
                size="lg"
                leftIcon={<Upload className="h-5 w-5" />}
              >
                Upload Folder
              </Button>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="glass-card-hover group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color.replace('text-', 'from-').replace('-400', '-500/20')} to-${stat.color.replace('text-', '').replace('-400', '-600/20')}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">{stat.value}</div>
                    <div className="text-sm text-green-400 flex items-center">
                      <ArrowUpRight className="h-3 w-3 mr-1" />
                      {stat.change}
                    </div>
                  </div>
                </div>
                <div className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Projects Section */}
            <div className="lg:col-span-2 space-y-6">
              {/* Search and Filter */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex flex-col sm:flex-row gap-4"
              >
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Search projects, tasks, or anything..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 input-field"
                    suppressHydrationWarning
                  />
                </div>
                <Button 
                  variant="glass" 
                  leftIcon={<Filter className="h-5 w-5" />}
                >
                  Filter
                </Button>
              </motion.div>

              {/* Projects Grid */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white">Your Projects</h2>
                  <div className="flex items-center space-x-2 text-sm text-gray-400">
                    <Activity className="h-4 w-4" />
                    <span>{filteredProjects.length} projects</span>
                  </div>
                </div>

                {loading ? (
                  <div className="projects-grid">
                    {Array.from({ length: 4 }).map((_, index) => (
                      <div key={index} className="glass-card project-card space-y-4">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center space-x-3">
                            <Skeleton className="w-12 h-12 rounded-xl" />
                            <div className="space-y-2">
                              <Skeleton className="h-4 w-20" />
                              <Skeleton className="h-3 w-16" />
                            </div>
                          </div>
                          <Skeleton className="h-6 w-16 rounded-full" />
                        </div>
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                        <div className="card-footer">
                          <Skeleton className="h-3 w-24" />
                          <Skeleton className="h-4 w-20" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredProjects.length > 0 ? (
                  <div className="projects-grid">
                    {filteredProjects.map((project, index) => (
                      <ProjectCard
                        key={project.id}
                        project={project}
                        delay={index * 0.1}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 glass-card">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center">
                      <Globe className="h-8 w-8 text-blue-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                      {projects.length === 0 ? 'No projects yet' : 'No projects found'}
                    </h3>
                    <p className="text-gray-400 mb-6">
                      {projects.length === 0 
                        ? 'Create your first project to get started with AIVEL' 
                        : 'Try adjusting your search terms or filters'
                      }
                    </p>
                    {projects.length === 0 && (
                      <Button 
                        onClick={() => setWizardOpen(true)}
                        variant="gradient"
                        leftIcon={<Plus className="h-5 w-5" />}
                      >
                        Create First Project
                      </Button>
                    )}
                  </div>
                )}
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* AI Brain Overview */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="glass-card"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                    <Brain className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">AI Brain</h3>
                    <p className="text-sm text-gray-400">Active & Learning</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Processing Tasks</span>
                    <span className="text-sm font-medium text-white">3</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Success Rate</span>
                    <span className="text-sm font-medium text-green-400">98.5%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Learning Mode</span>
                    <span className="text-sm font-medium text-blue-400">Active</span>
                  </div>
                </div>
                <Button variant="glass" size="sm" className="w-full mt-4">
                  <Brain className="h-4 w-4 mr-2" />
                  Open AI Brain
                </Button>
              </motion.div>

              {/* Recent Activity */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="glass-card"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                    <Activity className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
                    <p className="text-sm text-gray-400">Last 24 hours</p>
                  </div>
                </div>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                      className="flex items-start space-x-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                    >
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <activity.icon className="h-4 w-4 text-blue-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          {activity.action}
                        </p>
                        <p className="text-xs text-gray-400 truncate">
                          {activity.project}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {activity.time}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="glass-card"
              >
                <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Button variant="glass" size="sm" className="w-full justify-start">
                    <Zap className="h-4 w-4 mr-3" />
                    Run AI Analysis
                  </Button>
                  <Button variant="glass" size="sm" className="w-full justify-start">
                    <BarChart3 className="h-4 w-4 mr-3" />
                    View Analytics
                  </Button>
                  <Button variant="glass" size="sm" className="w-full justify-start">
                    <Shield className="h-4 w-4 mr-3" />
                    Security Scan
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </AppShell>

      {/* Project Import Wizard */}
      <ProjectImportWizard
        isOpen={wizardOpen}
        onClose={() => setWizardOpen(false)}
        onProjectCreated={handleProjectCreated}
      />

      {/* Folder Upload */}
      <FolderUpload
        isOpen={folderUploadOpen}
        onClose={() => setFolderUploadOpen(false)}
        onUploadComplete={handleFolderUpload}
      />
    </>
  )
}