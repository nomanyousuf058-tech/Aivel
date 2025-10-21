// types/index.ts
export interface AdminStats {
  totalUsers: number;
  totalRevenue: number;
  totalProjects: number;
  aiActivity: number;
  topProducts: {
    id: string;
    name: string;
    sales: number;
  }[];
  growthFund: number;
  ownerEarnings: number;
  weeklyReport: string;
}

export interface ContentItem {
  id: string;
  title: string;
  summary: string;
  type: 'blog' | 'social' | 'email' | 'ad' | 'news' | 'article';
  status: 'draft' | 'published' | 'scheduled';
  createdAt: string;
  updatedAt: string;
  views?: number;
  engagement?: number;
  affiliateLinks: {
    title: string;
    url: string;
  }[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  type: 'web' | 'mobile' | 'desktop' | 'api' | 'other';
  status: 'active' | 'archived' | 'draft';
  createdAt: string;
  updatedAt: string;
  technologies?: string[];
  repositoryUrl?: string;
  liveUrl?: string;
}

export interface ProjectDetail {
  id: string;
  name: string;
  description: string;
  type: 'web' | 'mobile' | 'desktop' | 'api' | 'other';
  status: 'active' | 'archived' | 'draft';
  createdAt: string;
  updatedAt: string;
  technologies?: string[];
  repositoryUrl?: string;
  liveUrl?: string;
  metrics?: {
    uptime?: number;
    responseTime?: number;
    errorRate?: number;
    healthScore?: number;
  };
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'tool' | 'template' | 'service' | 'ai';
  image?: string;
  features: string[];
  rating: number;
  sales: number;
  status: 'available' | 'sold_out' | 'coming_soon';
  affiliateLink?: string;
}

export interface InvestmentProposal {
  id: string;
  title: string;
  description: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  proposer: string;
  category: 'technology' | 'marketing' | 'infrastructure' | 'research' | 'other';
  expectedROI?: number;
  timeline?: string;
  documents?: string[];
}

export interface SystemFund {
  total: number;
  allocated: number;
  available: number;
  growth: number;
  lastUpdated: string;
  allocations: {
    category: string;
    amount: number;
    percentage: number;
  }[];
}