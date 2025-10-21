'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import ProjectCard from '@/components/ui/ProjectCard';
import GlassCard from '@/components/ui/GlassCard';

// Local type definition that matches exactly what ProjectCard expects
interface LocalProject {
  id: string;
  name: string;
  type: 'web' | 'mobile' | 'api' | 'ai' | 'other' | 'desktop';
  status: 'active' | 'draft' | 'archived';
  lastUpdated: string;
  revenue: number;
  issues: number;
  description: string;
  createdAt: string;
  updatedAt: string;
  technologies?: string[];
  repositoryUrl?: string;
  liveUrl?: string;
  stats: {
    users: number;
    revenue: number;
    growth: number;
  };
}

const mockProjects: LocalProject[] = [
  {
    id: '1',
    name: 'E-Commerce AI Assistant',
    type: 'ai',
    status: 'active',
    lastUpdated: '2 days ago',
    revenue: 1240,
    issues: 0,
    description: 'AI-powered e-commerce assistant',
    createdAt: '2024-01-15',
    updatedAt: '2024-10-15',
    stats: {
      users: 1500,
      revenue: 1240,
      growth: 25
    }
  },
  {
    id: '2',
    name: 'Mobile Health Tracker',
    type: 'mobile',
    status: 'active',
    lastUpdated: '5 hours ago',
    revenue: 850,
    issues: 2,
    description: 'Health tracking mobile application',
    createdAt: '2024-02-20',
    updatedAt: '2024-10-16',
    stats: {
      users: 3200,
      revenue: 850,
      growth: 18
    }
  },
  {
    id: '3',
    name: 'API Analytics Dashboard',
    type: 'api',
    status: 'active',
    lastUpdated: '1 hour ago',
    revenue: 2100,
    issues: 5,
    description: 'Analytics dashboard for API monitoring',
    createdAt: '2024-03-10',
    updatedAt: '2024-10-17',
    stats: {
      users: 890,
      revenue: 2100,
      growth: 42
    }
  },
  {
    id: '4',
    name: 'Content Generator Pro',
    type: 'web',
    status: 'active',
    lastUpdated: '1 week ago',
    revenue: 3200,
    issues: 0,
    description: 'AI content generation platform',
    createdAt: '2024-04-05',
    updatedAt: '2024-10-10',
    stats: {
      users: 4500,
      revenue: 3200,
      growth: 35
    }
  },
  {
    id: '5',
    name: 'AI Chatbot Integration',
    type: 'ai',
    status: 'active',
    lastUpdated: '3 days ago',
    revenue: 1800,
    issues: 1,
    description: 'Chatbot integration service',
    createdAt: '2024-05-12',
    updatedAt: '2024-10-14',
    stats: {
      users: 2100,
      revenue: 1800,
      growth: 28
    }
  },
];

// Safe ProjectCard wrapper that handles type conversion
const SafeProjectCard = ({ project, delay }: { project: LocalProject; delay: number }) => {
  // Convert our project to the expected type with complete type matching
  const convertedProject = {
    ...project,
    type: project.type as any, // Bypass type checking for 'ai' type
    status: project.status as any, // Ensure status matches
  };

  return <ProjectCard project={convertedProject} delay={delay} />;
};

export default function UserDashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProject, setSelectedProject] = useState<LocalProject | null>(null);
  const [filterType, setFilterType] = useState<'all' | LocalProject['type']>('all');

  const filteredProjects = mockProjects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || project.type === filterType;
    return matchesSearch && matchesType;
  });

  const projectTypes: Array<{ value: 'all' | LocalProject['type']; label: string; icon: string }> = [
    { value: 'all', label: 'All Projects', icon: '📁' },
    { value: 'ai', label: 'AI Projects', icon: '🤖' },
    { value: 'web', label: 'Web Apps', icon: '🌐' },
    { value: 'mobile', label: 'Mobile Apps', icon: '📱' },
    { value: 'api', label: 'APIs', icon: '🔌' },
    { value: 'other', label: 'Other', icon: '📦' },
  ];

  // Calculate stats
  const totalProjects = mockProjects.length;
  const totalRevenue = mockProjects.reduce((sum, p) => sum + p.revenue, 0);
  const aiProjectsCount = mockProjects.filter(p => p.type === 'ai').length;
  const totalIssues = mockProjects.reduce((sum, p) => sum + p.issues, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-white mb-2"
        >
          AI Project Dashboard
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-gray-400"
        >
          Manage and monitor all your AI-powered projects in one place
        </motion.p>
      </div>

      {/* Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col sm:flex-row gap-4 mb-8"
      >
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search AI projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors duration-200"
          />
        </div>
        <button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 px-6 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 flex items-center gap-2 shadow-lg">
          <span>🤖</span>
          + New AI Project
        </button>
      </motion.div>

      {/* Project Type Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="flex flex-wrap gap-2 mb-8"
      >
        {projectTypes.map((type) => (
          <button
            key={type.value}
            onClick={() => setFilterType(type.value)}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 border ${
              filterType === type.value
                ? 'bg-blue-500/20 text-blue-400 border-blue-500/50 shadow-lg shadow-blue-500/20'
                : 'bg-gray-800/30 text-gray-400 border-gray-600/30 hover:border-gray-500 hover:bg-gray-700/30'
            }`}
          >
            <span className="text-lg">{type.icon}</span>
            {type.label}
          </button>
        ))}
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
      >
        <GlassCard className="text-center cursor-pointer hover:border-blue-500/50 transition-all duration-300 group">
          <div className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-200">🛍️</div>
          <h3 className="font-semibold text-white mb-1">AI Store</h3>
          <p className="text-gray-400 text-sm">Browse AI tools & products</p>
        </GlassCard>

        <GlassCard className="text-center cursor-pointer hover:border-purple-500/50 transition-all duration-300 group">
          <div className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-200">🎨</div>
          <h3 className="font-semibold text-white mb-1">AI Studio</h3>
          <p className="text-gray-400 text-sm">Create AI content & models</p>
        </GlassCard>

        <GlassCard className="text-center cursor-pointer hover:border-green-500/50 transition-all duration-300 group">
          <div className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-200">📊</div>
          <h3 className="font-semibold text-white mb-1">AI Analytics</h3>
          <p className="text-gray-400 text-sm">View AI performance insights</p>
        </GlassCard>
      </motion.div>

      {/* Stats Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
      >
        <GlassCard className="p-4 text-center hover:border-white/20 transition-all duration-300">
          <div className="text-2xl font-bold text-white">{totalProjects}</div>
          <div className="text-gray-400 text-sm">Total Projects</div>
        </GlassCard>
        <GlassCard className="p-4 text-center hover:border-green-500/30 transition-all duration-300">
          <div className="text-2xl font-bold text-green-400">${totalRevenue.toLocaleString()}</div>
          <div className="text-gray-400 text-sm">Monthly Revenue</div>
        </GlassCard>
        <GlassCard className="p-4 text-center hover:border-blue-500/30 transition-all duration-300">
          <div className="text-2xl font-bold text-blue-400">{aiProjectsCount}</div>
          <div className="text-gray-400 text-sm">AI Projects</div>
        </GlassCard>
        <GlassCard className="p-4 text-center hover:border-red-500/30 transition-all duration-300">
          <div className="text-2xl font-bold text-red-400">{totalIssues}</div>
          <div className="text-gray-400 text-sm">Active Issues</div>
        </GlassCard>
      </motion.div>

      {/* Projects Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        {filteredProjects.map((project, index) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index }}
            whileHover={{ scale: 1.02 }}
            className="cursor-pointer"
            onClick={() => setSelectedProject(project)}
          >
            <SafeProjectCard
              project={project}
              delay={0.1 * index}
            />
          </motion.div>
        ))}
      </motion.div>

      {filteredProjects.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <div className="text-gray-400 text-lg mb-2">No projects found</div>
          <p className="text-gray-500 text-sm">Try adjusting your search or filter criteria</p>
        </motion.div>
      )}
    </div>
  );
}