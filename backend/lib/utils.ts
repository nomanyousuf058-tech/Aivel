import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

export function calculateRevenueSplit(amount: number) {
  const growthFund = amount * 0.3; // 30% for AIVEL growth
  const ownerShare = amount * 0.7; // 70% for owner
  
  return { growthFund, ownerShare };
}

export function generateAffiliateId(): string {
  return `AIV${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function getProjectHealthStatus(metrics: any): 'STABLE' | 'MINOR' | 'CRITICAL' {
  if (metrics.errorRate > 0.1 || metrics.uptime < 0.95) return 'CRITICAL';
  if (metrics.errorRate > 0.05 || metrics.uptime < 0.98) return 'MINOR';
  return 'STABLE';
}