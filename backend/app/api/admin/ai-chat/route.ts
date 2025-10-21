import { NextRequest, NextResponse } from 'next/server';
import { requireOwner } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { AIService } from '@/lib/ai-service';

export async function POST(request: NextRequest) {
  try {
    const user = await requireOwner();
    const { message } = await request.json();

    // Get system context for AI
    const [
      systemFund,
      totalUsers,
      totalProjects,
      recentAILogs
    ] = await Promise.all([
      prisma.systemFund.findFirst(),
      prisma.user.count(),
      prisma.project.count(),
      prisma.aILog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5
      })
    ]);

    const context = {
      version: process.env.AIVEL_VERSION,
      growthFund: systemFund?.growthFund,
      totalRevenue: systemFund?.totalRevenue,
      userCount: totalUsers,
      projectCount: totalProjects,
      recentActivity: recentAILogs
    };

    const response = await AIService.chatWithAIVEL(message, context);

    // Log the chat interaction
    await prisma.aILog.create({
      data: {
        type: 'SYSTEM_UPDATE',
        summary: `Owner chat: ${message.substring(0, 100)}...`,
        details: { message, response },
        projectsAnalyzed: 0,
        issuesFixed: 0
      }
    });

    return NextResponse.json({ response });
  } catch (error) {
    console.error('AI chat error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    );
  }
}