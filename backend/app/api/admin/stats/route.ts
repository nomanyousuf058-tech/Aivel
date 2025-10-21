import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { corsMiddleware } from '@/lib/cors';

export async function GET(request: NextRequest) {
  try {
    // Check if database is available
    if (!process.env.DATABASE_URL) {
      console.log('No database URL, returning mock stats');
      const mockStats = {
        users: {
          total: 1250,
          active: 1000,
          new: 125
        },
        projects: {
          total: 45,
          active: 38,
          completed: 7
        },
        revenue: {
          total: 125000,
          monthly: 10416.67,
          growth: 15.2
        },
        system: {
          uptime: 99.9,
          performance: 95.2,
          security: 98.7
        }
      };
      
      const response = NextResponse.json(mockStats);
      return corsMiddleware(response);
    }

    // Get basic stats
    const [
      totalUsers,
      totalProjects,
      totalRevenue,
      activeProjects
    ] = await Promise.all([
      prisma.user.count(),
      prisma.project.count(),
      prisma.revenue.aggregate({
        _sum: { amount: true }
      }),
      prisma.project.count({
        where: { status: 'ACTIVE' }
      })
    ]);

    const stats = {
      users: {
        total: totalUsers,
        active: Math.floor(totalUsers * 0.8), // Mock active users
        new: Math.floor(totalUsers * 0.1) // Mock new users this month
      },
      projects: {
        total: totalProjects,
        active: activeProjects,
        completed: totalProjects - activeProjects
      },
      revenue: {
        total: totalRevenue._sum.amount || 0,
        monthly: (totalRevenue._sum.amount || 0) / 12, // Mock monthly
        growth: 15.2 // Mock growth percentage
      },
      system: {
        uptime: 99.9,
        performance: 95.2,
        security: 98.7
      }
    };

    const response = NextResponse.json(stats);
    return corsMiddleware(response);
  } catch (error) {
    console.error('Get admin stats error:', error);
    const response = NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
    return corsMiddleware(response);
  }
}

export async function OPTIONS() {
  const response = new NextResponse(null, { status: 200 });
  return corsMiddleware(response);
}