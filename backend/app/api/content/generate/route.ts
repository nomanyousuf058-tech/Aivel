import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { AIService } from '@/lib/ai-service';

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { topic, type, affiliateFocus } = await request.json();

    const generatedContent = await AIService.generateContent(topic, type, affiliateFocus);

    const content = await prisma.content.create({
      data: {
        title: generatedContent.title,
        body: generatedContent.body,
        type: type,
        status: 'DRAFT',
        seoTags: generatedContent.seoTags,
        affiliateLinks: generatedContent.affiliateSuggestions,
        aiGenerated: true,
        userId: user.id,
        wordCount: generatedContent.body.length
      }
    });

    // Log AI content generation
    await prisma.aILog.create({
      data: {
        type: 'CONTENT_GENERATION',
        summary: `AI generated ${type.toLowerCase()}: ${topic}`,
        details: { topic, type, wordCount: generatedContent.body.length },
        projectsAnalyzed: 0,
        issuesFixed: 0,
        revenueGenerated: 0
      }
    });

    return NextResponse.json({ content });
  } catch (error) {
    console.error('Generate content error:', error);
    return NextResponse.json(
      { error: 'Failed to generate content' },
      { status: 500 }
    );
  }
}