import { NextRequest, NextResponse } from 'next/server';
import { corsMiddleware } from '@/lib/cors';

export async function GET(request: NextRequest) {
  try {
    // Mock content data for now
    const content = [
      {
        id: '1',
        title: 'The Future of AI in Content Creation',
        type: 'blog',
        status: 'published',
        createdAt: '2024-01-25T00:00:00Z',
        updatedAt: '2024-01-25T00:00:00Z',
        content: 'Exploring how AI is revolutionizing content creation workflows...',
        tags: ['AI', 'Content', 'Technology'],
        views: 1250,
        likes: 89
      },
      {
        id: '2',
        title: 'AIVEL Platform Update - January 2024',
        type: 'news',
        status: 'published',
        createdAt: '2024-01-20T00:00:00Z',
        updatedAt: '2024-01-20T00:00:00Z',
        content: 'Latest features and improvements to the AIVEL ecosystem...',
        tags: ['Update', 'Platform', 'Features'],
        views: 890,
        likes: 45
      },
      {
        id: '3',
        title: 'Maximizing Revenue with Digital Products',
        type: 'article',
        status: 'published',
        createdAt: '2024-01-18T00:00:00Z',
        updatedAt: '2024-01-18T00:00:00Z',
        content: 'Strategies for creators to build and monetize digital products...',
        tags: ['Business', 'Revenue', 'Digital Products'],
        views: 2100,
        likes: 156
      }
    ];

    const response = NextResponse.json({ data: content });
    return corsMiddleware(response);
  } catch (error) {
    console.error('Get content error:', error);
    const response = NextResponse.json({ data: [] });
    return corsMiddleware(response);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, type, content, tags } = body;

    if (!title || !type || !content) {
      return NextResponse.json(
        { error: 'Title, type, and content are required' },
        { status: 400 }
      );
    }

    // Mock creation
    const newContent = {
      id: Date.now().toString(),
      title,
      type,
      content,
      tags: tags || [],
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      views: 0,
      likes: 0
    };

    const response = NextResponse.json(newContent);
    return corsMiddleware(response);
  } catch (error) {
    console.error('Create content error:', error);
    const response = NextResponse.json(
      { error: 'Failed to create content' },
      { status: 500 }
    );
    return corsMiddleware(response);
  }
}

export async function OPTIONS() {
  const response = new NextResponse(null, { status: 200 });
  return corsMiddleware(response);
}