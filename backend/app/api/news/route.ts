import { NextRequest, NextResponse } from 'next/server';
import { NewsService } from '@/lib/news-service';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || 'technology';
    const refresh = searchParams.get('refresh') === 'true';

    let newsItems;

    if (refresh) {
      // Fetch fresh news from API
      newsItems = await NewsService.fetchTechNews(category);
      await NewsService.saveNewsToDB(newsItems);
    } else {
      // Get cached news from database
      newsItems = await prisma.newsFeed.findMany({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
          }
        },
        orderBy: { publishedAt: 'desc' },
        take: 20
      });

      if (newsItems.length === 0) {
        newsItems = await NewsService.fetchTechNews(category);
        await NewsService.saveNewsToDB(newsItems);
      }
    }

    return NextResponse.json({ news: newsItems });
  } catch (error) {
    console.error('Get news error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch news' },
      { status: 500 }
    );
  }
}