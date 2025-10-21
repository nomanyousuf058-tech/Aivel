import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { corsMiddleware } from '@/lib/cors';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        revenues: {
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        aiLogs: {
          orderBy: { createdAt: 'desc' },
          take: 5
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

    const response = NextResponse.json({ data: project });
    return corsMiddleware(response);
  } catch (error) {
    console.error('Get project error:', error);
    const response = NextResponse.json(
      { error: 'Failed to fetch project' },
      { status: 500 }
    );
    return corsMiddleware(response);
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const { id } = await context.params;

    const project = await prisma.project.findUnique({
      where: { id }
    });

    if (!project) {
      const response = NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
      return corsMiddleware(response);
    }

    const updatedProject = await prisma.project.update({
      where: { id },
      data: {
        name: body.name,
        type: body.type,
        description: body.description,
        url: body.url,
        repository: body.repository,
        metrics: body.metrics,
        status: body.status,
      }
    });

    const response = NextResponse.json({ data: updatedProject });
    return corsMiddleware(response);
  } catch (error) {
    console.error('Update project error:', error);
    const response = NextResponse.json(
      { error: 'Failed to update project' },
      { status: 500 }
    );
    return corsMiddleware(response);
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const project = await prisma.project.findUnique({
      where: { id }
    });

    if (!project) {
      const response = NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
      return corsMiddleware(response);
    }

    await prisma.project.delete({
      where: { id }
    });

    const response = NextResponse.json({ 
      success: true,
      message: 'Project deleted successfully'
    });
    return corsMiddleware(response);
  } catch (error) {
    console.error('Delete project error:', error);
    const response = NextResponse.json(
      { error: 'Failed to delete project' },
      { status: 500 }
    );
    return corsMiddleware(response);
  }
}

export async function OPTIONS() {
  const response = new NextResponse(null, { status: 200 });
  return corsMiddleware(response);
}