import { NextResponse } from 'next/server';

export function corsMiddleware(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGIN || 'http://localhost:3001');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-clerk-auth-reason, x-clerk-auth-message');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  return response;
}