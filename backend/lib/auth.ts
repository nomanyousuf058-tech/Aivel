import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from './db';

export async function getCurrentUser() {
  const user = await currentUser();
  
  if (!user) {
    return null;
  }

  // Find or create user in our database
  let dbUser = await prisma.user.findUnique({
    where: { clerkId: user.id },
  });

  if (!dbUser) {
    dbUser = await prisma.user.create({
      data: {
        clerkId: user.id,
        email: user.emailAddresses[0].emailAddress,
        name: `${user.firstName} ${user.lastName}`,
        avatar: user.imageUrl,
        affiliateId: `AIV${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      },
    });
  }

  return dbUser;
}

export async function requireAuth() {
  const authResult = await auth();
  const userId = (authResult as any)?.userId;
  
  if (!userId) {
    throw new Error('Unauthorized');
  }

  const user = await getCurrentUser();
  if (!user) {
    throw new Error('User not found');
  }

  return user;
}

export async function requireAdmin() {
  const user = await requireAuth();
  
  if (user.role !== 'ADMIN' && user.role !== 'OWNER') {
    throw new Error('Admin access required');
  }

  return user;
}

export async function requireOwner() {
  const user = await requireAuth();
  
  if (user.role !== 'OWNER') {
    throw new Error('Owner access required');
  }

  return user;
}