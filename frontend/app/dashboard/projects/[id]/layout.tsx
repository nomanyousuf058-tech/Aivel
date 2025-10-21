// app/dashboard/projects/[id]/layout.tsx
'use client'

import { ReactNode, useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  Code2, 
  DollarSign,
  Wrench,
  ChevronRight
} from 'lucide-react'

interface ProjectLayoutProps {
  children: ReactNode
}

const projectSections = [
  {
    name: 'Technical Dashboard',
    href: '/dashboard/projects/[id]/technical',
    icon: Code2,
  },
  {
    name: 'Business Dashboard',
    href: '/dashboard/projects/[id]/business',
    icon: DollarSign,
  },
  {
    name: 'Toolbox',
    href: '/dashboard/projects/[id]/toolbox',
    icon: Wrench,
  },
]

export default function ProjectLayout({ children }: ProjectLayoutProps) {
  const params = useParams()
  const pathname = usePathname()
  const [projectName, setProjectName] = useState<string>('Project')

  useEffect(() => {
    const load = async () => {
      try {
        const mock = (await import('@/mocks/projects.json')).default
        const found = (mock.projects || []).find((p: any) => String(p.id) === String(params.id))
        setProjectName(found?.name || `Project ${params.id}`)
      } catch {
        setProjectName(`Project ${params.id}`)
      }
    }
    load()
  }, [params.id])

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Project Sidebar */}
      <motion.div
        initial={{ x: -300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-80 glass border-r border-white/10"
      >
        <div className="p-6 border-b border-white/10">
          <h2 className="text-xl font-bold text-white truncate" title={projectName}>{projectName}</h2>
          <p className="text-sm text-gray-400 mt-1">Manage all aspects of your project</p>
        </div>
        
        <nav className="p-4 space-y-2">
          {projectSections.map((item) => {
            const IconComponent = item.icon
            const href = item.href.replace('[id]', params.id as string)
            const isActive = pathname === href
            
            return (
              <Link
                key={item.name}
                href={href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <IconComponent className="h-5 w-5" />
                <span className="font-medium">{item.name}</span>
                {isActive && (
                  <ChevronRight className="h-4 w-4 ml-auto" />
                )}
              </Link>
            )
          })}
        </nav>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {children}
        </div>
      </div>
    </div>
  )
}