// Distributed rate limiting system with Redis-like functionality
import { AuditLogger } from './audit-logger';
export class RateLimiter {
  private static prisma: any;

  // Check if an action is allowed
  static async checkRateLimit(key: string, type: string, limit: number, windowMs: number): Promise<{
    allowed: boolean;
    remaining: number;
    resetTime: Date;
    retryAfter?: number;
  }> {
    if (!this.prisma) {
      this.prisma = (await import('./db')).prisma;
    }

    const now = new Date();
    const windowStart = new Date(now.getTime() - windowMs);
    const windowEnd = new Date(now.getTime() + windowMs);
    const expiresAt = new Date(now.getTime() + windowMs * 2); // Cleanup buffer

    try {
      // Get or create rate limit record
      const rateLimit = await this.prisma.rateLimit.upsert({
        where: {
          key_type_windowStart: {
            key,
            type,
            windowStart
          }
        },
        update: {
          count: { increment: 1 },
          windowEnd,
          expiresAt
        },
        create: {
          key,
          type,
          count: 1,
          windowStart,
          windowEnd,
          expiresAt
        }
      });

      const remaining = Math.max(0, limit - rateLimit.count);
      const allowed = rateLimit.count <= limit;

      // Log rate limit hits
      if (!allowed) {
        await AuditLogger.logSecurityEvent('RATE_LIMIT_EXCEEDED', {
          key,
          type,
          count: rateLimit.count,
          limit,
          windowMs
        }, 'WARNING');
      }

      return {
        allowed,
        remaining,
        resetTime: rateLimit.windowEnd,
        retryAfter: !allowed ? Math.ceil((rateLimit.windowEnd.getTime() - now.getTime()) / 1000) : undefined
      };
    } catch (error) {
      // If database is unavailable, be permissive but log the error
      console.error('Rate limit check failed:', error);
      return {
        allowed: true,
        remaining: limit - 1,
        resetTime: new Date(now.getTime() + windowMs)
      };
    }
  }

  // Clean up expired rate limit records
  static async cleanupExpired(): Promise<{ deleted: number }> {
    if (!this.prisma) {
      this.prisma = (await import('./db')).prisma;
    }

    const result = await this.prisma.rateLimit.deleteMany({
      where: {
        expiresAt: { lt: new Date() }
      }
    });

    console.log(`🧹 Cleaned up ${result.count} expired rate limit records`);
    return { deleted: result.count };
  }

  // Get rate limit status for a key
  static async getStatus(key: string, type: string): Promise<any> {
    if (!this.prisma) {
      this.prisma = (await import('./db')).prisma;
    }

    const now = new Date();
    const activeLimits = await this.prisma.rateLimit.findMany({
      where: {
        key,
        type,
        windowEnd: { gt: now }
      },
      orderBy: { windowStart: 'desc' }
    });

    return {
      key,
      type,
      activeWindows: activeLimits.length,
      currentUsage: activeLimits.reduce((sum, limit) => sum + limit.count, 0),
      details: activeLimits
    };
  }

  // Apply rate limiting to API requests
  static async limitAPIRequest(userId: string, endpoint: string): Promise<boolean> {
    const limit = 1000; // 1000 requests
    const windowMs = 60 * 60 * 1000; // 1 hour
    
    const result = await this.checkRateLimit(
      `api:${userId}:${endpoint}`,
      'API_REQUEST',
      limit,
      windowMs
    );

    if (!result.allowed) {
      await this.triggerRateLimitAlert(userId, endpoint, result);
    }

    return result.allowed;
  }

  // Apply rate limiting to agent tasks
  static async limitAgentTasks(agentId: string, taskType: string): Promise<boolean> {
    const limits: { [key: string]: { limit: number; windowMs: number } } = {
      'CODE_ANALYSIS': { limit: 100, windowMs: 3600000 }, // 100/hour
      'CONTENT_GENERATION': { limit: 50, windowMs: 3600000 }, // 50/hour
      'SECURITY_SCAN': { limit: 10, windowMs: 3600000 }, // 10/hour
      'default': { limit: 30, windowMs: 3600000 } // 30/hour for others
    };

    const limitConfig = limits[taskType] || limits.default;
    
    const result = await this.checkRateLimit(
      `agent:${agentId}:${taskType}`,
      'AGENT_TASK',
      limitConfig.limit,
      limitConfig.windowMs
    );

    return result.allowed;
  }

  // Trigger rate limit alert
  private static async triggerRateLimitAlert(userId: string, resource: string, limitResult: any): Promise<void> {
    const { prisma } = await import('./db');
    
    await prisma.systemAlert.create({
      data: {
        type: 'RATE_LIMIT_EXCEEDED',
        title: `Rate limit exceeded for ${resource}`,
        message: `User/Agent ${userId} exceeded rate limits for ${resource}`,
        severity: 'MEDIUM',
        data: limitResult,
        source: 'RateLimiter'
      }
    });

    console.warn(`🚫 Rate limit exceeded: ${userId} - ${resource}`);
  }

  // Get system-wide rate limit statistics
  static async getSystemRateLimitStats(): Promise<any> {
    if (!this.prisma) {
      this.prisma = (await import('./db')).prisma;
    }

    const now = new Date();
    const hourAgo = new Date(now.getTime() - 3600000);

    const [
      totalRateLimits,
      activeRateLimits,
      recentViolations
    ] = await Promise.all([
      this.prisma.rateLimit.count({
        where: { createdAt: { gte: hourAgo } }
      }),
      this.prisma.rateLimit.count({
        where: { windowEnd: { gt: now } }
      }),
      this.prisma.systemAlert.count({
        where: { 
          type: 'RATE_LIMIT_EXCEEDED',
          createdAt: { gte: hourAgo }
        }
      })
    ]);

    return {
      timeframe: '1h',
      totalRateLimits,
      activeRateLimits,
      recentViolations,
      violationRate: totalRateLimits > 0 ? (recentViolations / totalRateLimits) * 100 : 0
    };
  }
}