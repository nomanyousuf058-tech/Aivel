import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { AIService } from '@/lib/ai-service';
import { corsMiddleware } from '@/lib/cors';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await context.params;

    const project = await prisma.project.findUnique({
      where: { id: projectId }
    });

    if (!project) {
      const response = NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
      return corsMiddleware(response);
    }

    // Call AI service for analysis
    const analysis = await AIService.analyzeProject(project);

    // Update project with analysis results
    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: {
        status: analysis.status,
        lastAICheck: new Date(),
        metrics: {
          ...project.metrics,
          healthScore: analysis.confidence || 0.8
        }
      }
    });

    // Log the analysis
    await prisma.aILog.create({
      data: {
        type: 'PROJECT_ANALYSIS',
        summary: `AI analysis completed for ${project.name} - Status: ${analysis.status}`,
        details: analysis,
        projectId: projectId,
        projectsAnalyzed: 1,
        issuesFixed: analysis.issues?.length || 0,
        agent: 'AIAnalyzer',
        confidence: analysis.confidence || 0.8
      }
    });

    const response = NextResponse.json({ 
      success: true,
      data: {
        project: updatedProject,
        analysis: analysis
      }
    });
    return corsMiddleware(response);
  } catch (error) {
    console.error('Error analyzing project:', error);
    const response = NextResponse.json(
      { error: 'Failed to analyze project' },
      { status: 500 }
    );
    return corsMiddleware(response);
  }
}

export async function OPTIONS() {
  const response = new NextResponse(null, { status: 200 });
  return corsMiddleware(response);
}