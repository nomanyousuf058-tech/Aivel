import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { corsMiddleware } from '@/lib/cors';

export async function GET(request: NextRequest) {
  try {
    // Check if database is available
    if (!process.env.DATABASE_URL) {
      console.log('No database URL, returning mock data');
      const mockProjects = [
        {
          id: '1',
          name: 'E-Commerce AI Platform',
          type: 'WEB',
          description: 'AI-powered e-commerce with personalized recommendations',
          status: 'STABLE',
          metrics: {
            uptime: 0.95,
            responseTime: 150,
            errorRate: 0.05,
            revenue: 0,
            healthScore: 0.8
          },
          lastAICheck: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
          revenue: 0
        },
        {
          id: '2',
          name: 'API Gateway Service',
          type: 'API',
          description: 'Microservices API gateway with authentication',
          status: 'STABLE',
          metrics: {
            uptime: 0.99,
            responseTime: 120,
            errorRate: 0.01,
            revenue: 0,
            healthScore: 0.95
          },
          lastAICheck: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
          revenue: 0
        },
        {
          id: '3',
          name: 'Mobile Banking App',
          type: 'MOBILE',
          description: 'Secure mobile banking application with biometric auth',
          status: 'STABLE',
          metrics: {
            uptime: 0.98,
            responseTime: 200,
            errorRate: 0.02,
            revenue: 0,
            healthScore: 0.9
          },
          lastAICheck: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
          revenue: 0
        }
      ];
      
      const response = NextResponse.json({ data: mockProjects });
      return corsMiddleware(response);
    }

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const type = searchParams.get('type');
    const status = searchParams.get('status');

    // Build where clause
    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    if (type) {
      where.type = type;
    }
    
    if (status) {
      where.status = status;
    }

    const projects = await prisma.project.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      include: {
        revenues: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });

    // Format response to match frontend expectations
    const formattedProjects = projects.map(project => ({
      id: project.id,
      name: project.name,
      type: project.type,
      description: project.description || '',
      status: project.status || 'STABLE',
      metrics: project.metrics || {
        uptime: 0.95,
        responseTime: 150,
        errorRate: 0.05,
        revenue: 0,
        healthScore: 0.8
      },
      lastAICheck: project.lastAICheck,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      revenue: project.revenues?.[0]?.amount || 0
    }));

    // Return consistent object response with data property
    const response = NextResponse.json({ data: formattedProjects });
    return corsMiddleware(response);
  } catch (error) {
    console.error('Get projects error:', error);
    // Return consistent object response on error
    const response = NextResponse.json({ data: [] });
    return corsMiddleware(response);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, type, description, url, repository } = body;

    if (!name || !type) {
      return NextResponse.json(
        { error: 'Name and type are required' },
        { status: 400 }
      );
    }

    const project = await prisma.project.create({
      data: {
        name,
        type: type.toUpperCase(),
        description,
        url,
        repository,
        status: 'STABLE',
        metrics: {
          uptime: 0.99,
          responseTime: 120,
          errorRate: 0.01,
          revenue: 0,
          healthScore: 0.95
        },
        lastAICheck: new Date(),
      },
    });

    const response = NextResponse.json(project); // Direct object
    return corsMiddleware(response);
  } catch (error) {
    console.error('Create project error:', error);
    const response = NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
    return corsMiddleware(response);
  }
}

export async function OPTIONS() {
  const response = new NextResponse(null, { status: 200 });
  return corsMiddleware(response);
}