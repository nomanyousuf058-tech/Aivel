// Comprehensive safety checking system for all operations
import { RateLimiter } from './rate-limiter';
import { AuditLogger } from './audit-logger';
export class SafetyChecker {
  private static prisma: any;

  // Perform a safety check
  static async performCheck(data: {
    checkType: string;
    targetType: string;
    targetId: string;
    rules: any;
    context?: any;
    triggeredBy?: string;
  }): Promise<{
    passed: boolean;
    status: string;
    score: number;
    violations: string[];
    details: any;
  }> {
    if (!this.prisma) {
      this.prisma = (await import('./db')).prisma;
    }

    try {
      // Execute safety rules
      const ruleResults = await this.executeSafetyRules(data.rules, data.context);
      
      // Calculate safety score
      const score = this.calculateSafetyScore(ruleResults);
      const passed = score >= 0.7; // 70% threshold
      const status = passed ? 'PASSED' : score >= 0.5 ? 'WARNING' : 'FAILED';
      
      // Record safety check
      const safetyCheck = await this.prisma.safetyCheck.create({
        data: {
          checkType: data.checkType,
          targetType: data.targetType,
          targetId: data.targetId,
          status: status as any,
          rules: data.rules,
          violations: ruleResults.violations,
          score: score,
          context: data.context,
          triggeredBy: data.triggeredBy
        }
      });

      // Trigger alerts for failed checks
      if (!passed) {
        await this.triggerSafetyAlert(safetyCheck, ruleResults);
      }

      // Log safety check
      await AuditLogger.logSecurityEvent(
        'SAFETY_CHECK',
        {
          checkType: data.checkType,
          target: `${data.targetType}:${data.targetId}`,
          status: status,
          score: score,
          violations: ruleResults.violations
        },
        passed ? 'INFO' : 'WARNING'
      );

      return {
        passed,
        status,
        score,
        violations: ruleResults.violations,
        details: ruleResults
      };
    } catch (error: any) {
      console.error('Safety check failed:', error);
      
      // If safety check fails, be conservative and block the action
      return {
        passed: false,
        status: 'BLOCKED',
        score: 0,
        violations: ['Safety check system error'],
        details: { error: error.message }
      };
    }
  }

  // Execute safety rules
  private static async executeSafetyRules(rules: any, context: any): Promise<{
    passed: boolean;
    violations: string[];
    ruleResults: any;
  }> {
    const ruleResults: any = {};
    const violations: string[] = [];

    for (const [ruleName, ruleConfig] of Object.entries(rules)) {
      try {
        const ruleResult = await this.executeSingleRule(ruleName as string, ruleConfig as any, context);
        ruleResults[ruleName] = ruleResult;

        if (!ruleResult.passed) {
          violations.push(`${ruleName}: ${ruleResult.reason}`);
        }
      } catch (error: any) {
        ruleResults[ruleName] = {
          passed: false,
          reason: `Rule execution error: ${error.message}`
        };
        violations.push(`${ruleName}: Rule execution failed`);
      }
    }

    return {
      passed: violations.length === 0,
      violations,
      ruleResults
    };
  }

  // Execute a single safety rule
  private static async executeSingleRule(ruleName: string, ruleConfig: any, context: any): Promise<{
    passed: boolean;
    reason?: string;
    details?: any;
  }> {
    switch (ruleName) {
      case 'budget_check':
        return await this.checkBudget(ruleConfig, context);
      
      case 'rate_limit_check':
        return await this.checkRateLimit(ruleConfig, context);
      
      case 'permission_check':
        return await this.checkPermissions(ruleConfig, context);
      
      case 'content_safety_check':
        return await this.checkContentSafety(ruleConfig, context);
      
      case 'system_health_check':
        return await this.checkSystemHealth(ruleConfig, context);
      
      default:
        return {
          passed: false,
          reason: `Unknown safety rule: ${ruleName}`
        };
    }
  }

  // Check budget constraints
  private static async checkBudget(ruleConfig: any, context: any): Promise<any> {
    const { prisma } = await import('./db');
    
    const budget = await prisma.monthlyBudget.findFirst({
      where: { 
        category: ruleConfig.category,
        month: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          lt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)
        }
      }
    });

    if (!budget) {
      return {
        passed: true,
        reason: 'No budget configured for this category'
      };
    }

    const projectedSpend = budget.spent + (context.estimatedCost || 0);
    const withinBudget = projectedSpend <= budget.allocated;

    return {
      passed: withinBudget || budget.limitType === 'SOFT',
      reason: withinBudget ? 'Within budget' : `Would exceed budget by ${projectedSpend - budget.allocated}`,
      details: {
        allocated: budget.allocated,
        spent: budget.spent,
        projected: projectedSpend,
        limitType: budget.limitType
      }
    };
  }

  // Check rate limits
  private static async checkRateLimit(ruleConfig: any, context: any): Promise<any> {
    const limitResult = await RateLimiter.checkRateLimit(
      context.key,
      context.type,
      ruleConfig.limit,
      ruleConfig.windowMs
    );

    return {
      passed: limitResult.allowed,
      reason: limitResult.allowed ? 'Within rate limits' : 'Rate limit exceeded',
      details: limitResult
    };
  }

  // Check permissions
  private static async checkPermissions(ruleConfig: any, context: any): Promise<any> {
    // Simple permission check - in production, integrate with your auth system
    const hasPermission = context.userRoles?.some((role: string) => 
      ruleConfig.allowedRoles.includes(role)
    );

    return {
      passed: hasPermission,
      reason: hasPermission ? 'Has required permissions' : 'Insufficient permissions',
      details: {
        userRoles: context.userRoles,
        requiredRoles: ruleConfig.allowedRoles
      }
    };
  }

  // Check content safety (basic implementation)
  private static async checkContentSafety(ruleConfig: any, context: any): Promise<any> {
    const blockedPatterns = ruleConfig.blockedPatterns || [
      'malicious', 'dangerous', 'inappropriate'
    ];

    const content = JSON.stringify(context.content).toLowerCase();
    const violations = blockedPatterns.filter(pattern => 
      content.includes(pattern.toLowerCase())
    );

    return {
      passed: violations.length === 0,
      reason: violations.length === 0 ? 'Content appears safe' : `Found blocked patterns: ${violations.join(', ')}`,
      details: { violations }
    };
  }

  // Check system health
  private static async checkSystemHealth(ruleConfig: any, context: any): Promise<any> {
    const { prisma } = await import('./db');
    
    // Check recent error rate
    const hourAgo = new Date(Date.now() - 3600000);
    const totalTasks = await prisma.agentTask.count({
      where: { createdAt: { gte: hourAgo } }
    });

    const failedTasks = await prisma.agentTask.count({
      where: { 
        createdAt: { gte: hourAgo },
        status: 'FAILED'
      }
    });

    const errorRate = totalTasks > 0 ? failedTasks / totalTasks : 0;
    const systemHealthy = errorRate <= ruleConfig.maxErrorRate;

    return {
      passed: systemHealthy,
      reason: systemHealthy ? 'System health OK' : `High error rate: ${(errorRate * 100).toFixed(1)}%`,
      details: {
        totalTasks,
        failedTasks,
        errorRate,
        threshold: ruleConfig.maxErrorRate
      }
    };
  }

  // Calculate overall safety score
  private static calculateSafetyScore(ruleResults: any): number {
    const rules = Object.values(ruleResults) as any[];
    const passedRules = rules.filter(rule => rule.passed).length;
    const totalRules = rules.length;

    return totalRules > 0 ? passedRules / totalRules : 1.0;
  }

  // Trigger safety alert
  private static async triggerSafetyAlert(safetyCheck: any, ruleResults: any): Promise<void> {
    const { prisma } = await import('./db');
    
    await prisma.systemAlert.create({
      data: {
        type: 'SAFETY_VIOLATION',
        title: `Safety violation detected for ${safetyCheck.targetType}`,
        message: `Safety check failed with score ${safetyCheck.score.toFixed(2)}. Violations: ${safetyCheck.violations.join(', ')}`,
        severity: safetyCheck.score < 0.3 ? 'HIGH' : 'MEDIUM',
        data: {
          safetyCheckId: safetyCheck.id,
          ruleResults,
          target: `${safetyCheck.targetType}:${safetyCheck.targetId}`
        },
        source: 'SafetyChecker'
      }
    });
  }

  // Get safety check statistics
  static async getSafetyStats(timeframe: string = '7d'): Promise<any> {
    if (!this.prisma) {
      this.prisma = (await import('./db')).prisma;
    }

    const startDate = this.calculateStartDate(timeframe);
    
    const [
      totalChecks,
      checksByStatus,
      checksByType,
      recentViolations
    ] = await Promise.all([
      this.prisma.safetyCheck.count({
        where: { createdAt: { gte: startDate } }
      }),
      this.prisma.safetyCheck.groupBy({
        by: ['status'],
        where: { createdAt: { gte: startDate } },
        _count: { _all: true },
        _avg: { score: true }
      }),
      this.prisma.safetyCheck.groupBy({
        by: ['checkType'],
        where: { createdAt: { gte: startDate } },
        _count: { _all: true }
      }),
      this.prisma.safetyCheck.findMany({
        where: { 
          createdAt: { gte: startDate },
          status: { in: ['FAILED', 'BLOCKED'] }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      })
    ]);

    const passRate = totalChecks > 0 ? 
      (checksByStatus.find(s => (s as any).status === 'PASSED')?._count?._all || 0) / totalChecks * 100 : 0;

    return {
      timeframe,
      totalChecks,
      passRate: Math.round(passRate),
      checksByStatus,
      checksByType,
      recentViolations,
      averageScore: (checksByStatus as any).reduce((sum: number, s: any) => sum + (s._avg.score || 0), 0) / (checksByStatus as any).length
    };
  }

  private static calculateStartDate(timeframe: string): Date {
    const now = new Date();
    
    switch (timeframe) {
      case '1d': return new Date(now.setDate(now.getDate() - 1));
      case '7d': return new Date(now.setDate(now.getDate() - 7));
      case '30d': return new Date(now.setDate(now.getDate() - 30));
      default: return new Date(now.setDate(now.getDate() - 7));
    }
  }
}