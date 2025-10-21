import { NextRequest, NextResponse } from 'next/server';
import { corsMiddleware } from '@/lib/cors';

export async function GET(request: NextRequest) {
  try {
    // Mock products data
    const products = [
      {
        id: '1',
        name: 'AI Content Generator Pro',
        description: 'Advanced AI-powered content creation tool with multiple templates and customization options.',
        price: 99.99,
        category: 'tools',
        status: 'active',
        rating: 4.8,
        downloads: 1250,
        createdAt: '2024-01-15T00:00:00Z',
        updatedAt: '2024-01-15T00:00:00Z',
        image: '/images/products/ai-content-generator.jpg',
        features: ['Multiple Templates', 'Custom Prompts', 'Export Options', 'API Access']
      },
      {
        id: '2',
        name: 'React Dashboard Template',
        description: 'Modern, responsive dashboard template built with React and Tailwind CSS.',
        price: 49.99,
        category: 'templates',
        status: 'active',
        rating: 4.6,
        downloads: 890,
        createdAt: '2024-01-10T00:00:00Z',
        updatedAt: '2024-01-10T00:00:00Z',
        image: '/images/products/react-dashboard.jpg',
        features: ['Responsive Design', 'Dark Mode', 'Component Library', 'Documentation']
      },
      {
        id: '3',
        name: 'API Integration Service',
        description: 'Professional API integration and development service for your projects.',
        price: 299.99,
        category: 'services',
        status: 'active',
        rating: 4.9,
        downloads: 45,
        createdAt: '2024-01-05T00:00:00Z',
        updatedAt: '2024-01-05T00:00:00Z',
        image: '/images/products/api-integration.jpg',
        features: ['Custom Development', '24/7 Support', 'Documentation', 'Maintenance']
      }
    ];

    const response = NextResponse.json({ data: products });
    return corsMiddleware(response);
  } catch (error) {
    console.error('Get products error:', error);
    const response = NextResponse.json({ data: [] });
    return corsMiddleware(response);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, price, category, features } = body;

    if (!name || !description || !price || !category) {
      return NextResponse.json(
        { error: 'Name, description, price, and category are required' },
        { status: 400 }
      );
    }

    // Mock creation
    const newProduct = {
      id: Date.now().toString(),
      name,
      description,
      price: parseFloat(price),
      category,
      features: features || [],
      status: 'active',
      rating: 0,
      downloads: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      image: '/images/products/default.jpg'
    };

    const response = NextResponse.json(newProduct);
    return corsMiddleware(response);
  } catch (error) {
    console.error('Create product error:', error);
    const response = NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
    return corsMiddleware(response);
  }
}

export async function OPTIONS() {
  const response = new NextResponse(null, { status: 200 });
  return corsMiddleware(response);
}