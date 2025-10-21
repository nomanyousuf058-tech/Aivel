import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { corsMiddleware } from '@/lib/cors';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await context.params;

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        aiLogs: {
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    });

    if (!project) {
      const response = NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
      return corsMiddleware(response);
    }

    const metrics = project.metrics as any;
    
    // Generate comprehensive technical data
    const technicalData = {
      id: project.id,
      name: project.name,
      status: project.status,
      type: project.type,
      performance: {
        uptime: metrics?.uptime || 0.95,
        responseTime: metrics?.responseTime || 150,
        errorRate: metrics?.errorRate || 0.02,
        requestsPerMinute: metrics?.rpm || 1200,
        healthScore: metrics?.healthScore || 0.8
      },
      infrastructure: {
        server: 'Cloud Hosting',
        database: metrics?.database || 'PostgreSQL',
        framework: metrics?.framework || 'Next.js',
        monitoring: metrics?.monitoring ? 'Enabled' : 'Disabled',
        lastDeployed: project.updatedAt
      },
      security: {
        ssl: true,
        firewall: true,
        rateLimiting: metrics?.rateLimiting || true,
        lastSecurityScan: project.lastAICheck
      },
      recentIssues: project.aiLogs
        ?.filter(log => (log.details as any)?.issues?.length > 0)
        .slice(0, 5) || [],
      recommendations: [
        'Implement caching for better performance',
        'Set up automated backups',
        'Monitor error rates daily'
      ],
      analytics: {
        totalUsers: metrics?.users || 0,
        activeUsers: metrics?.activeUsers || 0,
        growthRate: metrics?.growthRate || 0.05
      },
      // Add file structure for technical dashboard
      fileStructure: [
        { name: 'package.json', path: '/', type: 'file', language: 'json' },
        { name: 'src', path: '/', type: 'folder' },
        { name: 'app.js', path: '/src', type: 'file', language: 'javascript' },
        { name: 'components', path: '/src', type: 'folder' },
        { name: 'Header.js', path: '/src/components', type: 'file', language: 'javascript' },
        { name: 'styles', path: '/', type: 'folder' },
        { name: 'index.css', path: '/styles', type: 'file', language: 'css' },
      ],
      dependencies: {
        framework: 'Next.js 14',
        database: 'PostgreSQL',
        authentication: 'Clerk',
        deployment: 'Vercel'
      }
    };

    const response = NextResponse.json({ data: technicalData });
    return corsMiddleware(response);
  } catch (error) {
    console.error('Get technical details error:', error);
    const response = NextResponse.json(
      { error: 'Failed to fetch technical details' },
      { status: 500 }
    );
    return corsMiddleware(response);
  }
}

export async function OPTIONS() {
  const response = new NextResponse(null, { status: 200 });
  return corsMiddleware(response);
}