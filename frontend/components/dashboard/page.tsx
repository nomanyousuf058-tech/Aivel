'use client';

import { useState } from 'react';
import UserDashboard from '@/components/dashboard/UserDashboard';
import TechnicalDashboard from '@/components/dashboard/TechnicalDashboard';
import BusinessDashboard from '@/components/dashboard/BusinessDashboard';

type DashboardView = 'projects' | 'technical' | 'business';

export default function Dashboard() {
  const [currentView, setCurrentView] = useState<DashboardView>('projects');

  const views = [
    { id: 'projects' as DashboardView, label: 'Projects', emoji: '🚀' },
    { id: 'technical' as DashboardView, label: 'Technical', emoji: '⚙️' },
    { id: 'business' as DashboardView, label: 'Business', emoji: '📊' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* View Selector */}
      <div className="bg-gray-800/50 border-b border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1 py-4">
            {views.map((view) => (
              <button
                key={view.id}
                onClick={() => setCurrentView(view.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                  currentView === view.id
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                <span>{view.emoji}</span>
                <span className="font-medium">{view.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      {currentView === 'projects' && <UserDashboard />}
      {currentView === 'technical' && <TechnicalDashboard />}
      {currentView === 'business' && <BusinessDashboard />}
    </div>
  );
}