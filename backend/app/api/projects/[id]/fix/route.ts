import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { AIService } from '@/lib/ai-service';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { issue } = await request.json();
    const { id } = await context.params;

    const project = await prisma.project.findFirst({
      where: { 
        id,
        userId: user.id 
      }
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    const fixSolution = await AIService.fixProjectIssue(project, issue);

    // Log the AI fix attempt
    await prisma.aILog.create({
      data: {
        type: 'PROJECT_ANALYSIS',
        summary: `AI fix applied to project: ${project.name}`,
        details: { issue, solution: fixSolution },
        projectsAnalyzed: 1,
        issuesFixed: 1
      }
    });

    return NextResponse.json({ solution: fixSolution });
  } catch (error) {
    console.error('Project fix error:', error);
    return NextResponse.json(
      { error: 'Failed to generate fix' },
      { status: 500 }
    );
  }
}