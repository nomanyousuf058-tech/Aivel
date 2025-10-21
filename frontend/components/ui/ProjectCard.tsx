'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Project } from '@/types'
import { 
  ArrowUpRight, 
  AlertTriangle, 
  Clock, 
  CheckCircle,
  Code,
  Globe,
  Smartphone,
  Cpu,
  ExternalLink,
  GitBranch
} from 'lucide-react'

interface ProjectCardProps {
  project: Project
  delay?: number
}

const statusConfig = {
  active: {
    icon: CheckCircle,
    color: 'text-green-400',
    bgColor: 'bg-green-400/10',
    borderColor: 'border-green-400/20',
    labelColor: 'text-green-400'
  },
  archived: {
    icon: Clock,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-400/10',
    borderColor: 'border-yellow-400/20',
    labelColor: 'text-yellow-400'
  },
  draft: {
    icon: AlertTriangle,
    color: 'text-gray-400',
    bgColor: 'bg-gray-400/10',
    borderColor: 'border-gray-400/20',
    labelColor: 'text-gray-400'
  }
}

const typeConfig = {
  web: { 
    label: 'Web App', 
    color: 'from-blue-500 to-blue-600', 
    icon: Globe,
    bgColor: 'bg-blue-500/10'
  },
  mobile: { 
    label: 'Mobile', 
    color: 'from-purple-500 to-purple-600', 
    icon: Smartphone,
    bgColor: 'bg-purple-500/10'
  },
  desktop: { 
    label: 'Desktop', 
    color: 'from-green-500 to-green-600', 
    icon: Cpu,
    bgColor: 'bg-green-500/10'
  },
  api: { 
    label: 'API', 
    color: 'from-orange-500 to-orange-600', 
    icon: Code,
    bgColor: 'bg-orange-500/10'
  },
  other: { 
    label: 'Other', 
    color: 'from-gray-500 to-gray-600', 
    icon: Code,
    bgColor: 'bg-gray-500/10'
  }
}

export default function ProjectCard({ project, delay = 0 }: ProjectCardProps) {
  const StatusIcon = statusConfig[project.status].icon
  const TypeConfig = typeConfig[project.type]
  const TypeIcon = TypeConfig.icon

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const truncateUrl = (url: string) => {
    return url.replace('https://', '').replace('http://', '')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ scale: 1.02, y: -2 }}
      className="glass-card project-card group cursor-pointer relative overflow-hidden"
    >
      <Link href={`/dashboard/projects/${project.id}`} className="flex flex-col h-full">
        {/* Header - Type and Status */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${TypeConfig.color} flex items-center justify-center shadow-lg`}>
              <TypeIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="text-sm font-medium text-gray-300 block">{TypeConfig.label}</span>
              {project.technologies && project.technologies.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {project.technologies.slice(0, 2).map((tech, index) => (
                    <span key={index} className="tech-tag text-xs">
                      {tech}
                    </span>
                  ))}
                  {project.technologies.length > 2 && (
                    <span className="tech-tag text-xs">
                      +{project.technologies.length - 2}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className={`status-badge ${statusConfig[project.status].bgColor} ${statusConfig[project.status].borderColor}`}>
            <div className="flex items-center space-x-1.5">
              <StatusIcon className={`h-3 w-3 ${statusConfig[project.status].color}`} />
              <span className={`font-semibold ${statusConfig[project.status].labelColor}`}>
                {project.status}
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <h3 className="project-title group-hover:text-blue-400 transition-colors duration-300">
            {project.name}
          </h3>
          <p className="project-description line-clamp-3">
            {project.description}
          </p>

          {/* URLs if available */}
          {(project.repositoryUrl || project.liveUrl) && (
            <div className="space-y-2 mb-4">
              {project.repositoryUrl && (
                <div className="url-link">
                  <GitBranch className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{truncateUrl(project.repositoryUrl)}</span>
                </div>
              )}
              {project.liveUrl && (
                <div className="url-link">
                  <ExternalLink className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{truncateUrl(project.liveUrl)}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="card-footer">
          <span className="text-xs text-gray-400 font-medium">
            Created {formatDate(project.createdAt)}
          </span>
          <div className="flex items-center space-x-1 text-blue-400 group-hover:text-blue-300 transition-colors">
            <span className="text-sm font-semibold">View Details</span>
            <ArrowUpRight className="h-4 w-4" />
          </div>
        </div>

        {/* Hover effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 via-purple-500/0 to-pink-500/0 group-hover:from-blue-500/5 group-hover:via-purple-500/5 group-hover:to-pink-500/5 transition-all duration-300 rounded-xl pointer-events-none" />
      </Link>
    </motion.div>
  )
}