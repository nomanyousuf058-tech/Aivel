'use client'

import { motion } from 'framer-motion'
import { ContentItem } from '@/types'
import { 
  FileText, 
  Newspaper, 
  BookOpen, 
  ExternalLink,
  Calendar,
  Sparkles
} from 'lucide-react'

interface ContentCardProps {
  content: ContentItem
  delay?: number
}

const typeConfig = {
  blog: { icon: FileText, color: 'bg-blue-500', label: 'Blog' },
  news: { icon: Newspaper, color: 'bg-green-500', label: 'News' },
  article: { icon: BookOpen, color: 'bg-purple-500', label: 'Article' }
}

export default function ContentCard({ content, delay = 0 }: ContentCardProps) {
  const TypeIcon = typeConfig[content.type].icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ scale: 1.02 }}
      className="glass-card group cursor-pointer relative overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className={`p-2 rounded-lg ${typeConfig[content.type].color}`}>
            <TypeIcon className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm text-gray-400 font-medium">
            {typeConfig[content.type].label}
          </span>
        </div>
        <Sparkles className="h-4 w-4 text-yellow-400" />
      </div>

      {/* Content */}
      <h3 className="text-lg font-semibold text-white mb-3 group-hover:text-blue-400 transition-colors line-clamp-2">
        {content.title}
      </h3>
      <p className="text-gray-300 text-sm mb-4 line-clamp-3">
        {content.summary}
      </p>

      {/* Affiliate Links */}
      {content.affiliateLinks.length > 0 && (
        <div className="mb-4">
          <div className="text-xs text-gray-400 font-medium mb-2">Affiliate Links:</div>
          <div className="space-y-1">
            {content.affiliateLinks.map((link, index) => (
              <a
                key={index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                onClick={(e) => e.stopPropagation()}
                suppressHydrationWarning
              >
                <ExternalLink className="h-3 w-3" />
                <span className="truncate">{link.title}</span>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-white/10">
        <div className="flex items-center space-x-1 text-gray-400">
          <Calendar className="h-3 w-3" />
          <span className="text-xs">
            {new Date(content.createdAt).toLocaleDateString()}
          </span>
        </div>
        <div className="flex items-center space-x-1 text-blue-400">
          <span className="text-sm font-medium">Edit</span>
          <ExternalLink className="h-3 w-3" />
        </div>
      </div>

      {/* Hover effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/5 group-hover:to-purple-500/5 transition-all duration-300 rounded-xl" />
    </motion.div>
  )
}