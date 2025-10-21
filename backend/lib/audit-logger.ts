// Comprehensive audit logging system for all system actions
export class AuditLogger {
  private static prisma: any;

  // Log a system action
  static async logAction(data: {
    action: string;
    resource: string;
    resourceId?: string;
    userId?: string;
    userAgent?: string;
    ipAddress?: string;
    oldValues?: any;
    newValues?: any;
    changes?: any;
    context?: any;
    severity?: string;
    status?: string;
    error?: string;
  }): Promise<void> {
    if (!this.prisma) {
      this.prisma = (await import('./db')).prisma;
    }

    try {
      await this.prisma.systemAudit.create({
        data: {
          action: data.action,
          resource: data.resource,
          resourceId: data.resourceId,
          userId: data.userId,
          userAgent: data.userAgent,
          ipAddress: data.ipAddress,
          oldValues: data.oldValues,
          newValues: data.newValues,
          changes: data.changes || this.calculateChanges(data.oldValues, data.newValues),
          context: data.context,
          severity: data.severity || 'INFO',
          status: data.status || 'SUCCESS',
          error: data.error
        }
      });
    } catch (error) {
      // Don't let audit logging break the application
      console.error('Audit logging failed:', error);
    }
  }

  // Calculate changes between old and new values
  private static calculateChanges(oldValues: any, newValues: any): any {
    if (!oldValues || !newValues) return null;

    const changes: any = {};
    
    for (const key in newValues) {
      if (JSON.stringify(oldValues[key]) !== JSON.stringify(newValues[key])) {
        changes[key] = {
          from: oldValues[key],
          to: newValues[key]
        };
      }
    }

    return Object.keys(changes).length > 0 ? changes : null;
  }

  // Log agent task execution
  static async logAgentTask(task: any, result: any, agent: any): Promise<void> {
    await this.logAction({
      action: 'AGENT_TASK_EXECUTION',
      resource: 'AGENT_TASK',
      resourceId: task.id,
      userId: agent.id,
      oldValues: { input: task.input, status: 'PENDING' },
      newValues: { 
        output: result.output, 
        status: result.success ? 'COMPLETED' : 'FAILED',
        confidence: result.confidence
      },
      context: {
        agent: agent.name,
        taskType: task.type,
        duration: result.duration,
        costEstimate: result.costEstimate
      },
      severity: result.success ? 'INFO' : 'ERROR',
      status: result.success ? 'SUCCESS' : 'FAILURE',
      error: result.success ? undefined : result.reasoning
    });
  }

  // Log system configuration change
  static async logConfigChange(userId: string, key: string, oldValue: any, newValue: any): Promise<void> {
    await this.logAction({
      action: 'CONFIGURATION_CHANGE',
      resource: 'SYSTEM_CONFIG',
      resourceId: key,
      userId: userId,
      oldValues: { [key]: oldValue },
      newValues: { [key]: newValue },
      context: { configKey: key },
      severity: 'WARNING' // Config changes are important
    });
  }

  // Log budget activity
  static async logBudgetActivity(category: string, amount: number, operation: string, context?: any): Promise<void> {
    await this.logAction({
      action: `BUDGET_${operation.toUpperCase()}`,
      resource: 'BUDGET',
      resourceId: category,
      oldValues: { balance: context?.oldBalance },
      newValues: { 
        amount: amount,
        newBalance: context?.newBalance,
        operation: operation
      },
      context: context,
      severity: amount > 1000 ? 'WARNING' : 'INFO'
    });
  }

  // Log security event
  static async logSecurityEvent(event: string, details: any, severity: string = 'MEDIUM'): Promise<void> {
    await this.logAction({
      action: `SECURITY_${event.toUpperCase()}`,
      resource: 'SECURITY',
      context: details,
      severity: severity as any,
      status: 'SUCCESS'
    });
  }

  // Get audit logs with filtering
  static async getAuditLogs(filters: {
    action?: string;
    resource?: string;
    userId?: string;
    severity?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }): Promise<any[]> {
    if (!this.prisma) {
      this.prisma = (await import('./db')).prisma;
    }

    const where: any = {};

    if (filters.action) where.action = filters.action;
    if (filters.resource) where.resource = filters.resource;
    if (filters.userId) where.userId = filters.userId;
    if (filters.severity) where.severity = filters.severity;
    
    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = filters.startDate;
      if (filters.endDate) where.createdAt.lte = filters.endDate;
    }

    return await this.prisma.systemAudit.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: filters.limit || 100
    });
  }

  // Get audit statistics
  static async getAuditStats(timeframe: string = '7d'): Promise<any> {
    if (!this.prisma) {
      this.prisma = (await import('./db')).prisma;
    }

    const startDate = this.calculateStartDate(timeframe);
    
    const [
      totalActions,
      actionsByType,
      actionsBySeverity,
      recentActivity
    ] = await Promise.all([
      this.prisma.systemAudit.count({
        where: { createdAt: { gte: startDate } }
      }),
      this.prisma.systemAudit.groupBy({
        by: ['action'],
        where: { createdAt: { gte: startDate } },
        _count: { _all: true }
      }),
      this.prisma.systemAudit.groupBy({
        by: ['severity'],
        where: { createdAt: { gte: startDate } },
        _count: { _all: true }
      }),
      this.prisma.systemAudit.findMany({
        where: { createdAt: { gte: startDate } },
        orderBy: { createdAt: 'desc' },
        take: 10
      })
    ]);

    return {
      timeframe,
      totalActions,
      actionsByType,
      actionsBySeverity,
      recentActivity,
      errorRate: await this.calculateErrorRate(startDate)
    };
  }

  // Calculate error rate
  private static async calculateErrorRate(startDate: Date): Promise<number> {
    if (!this.prisma) {
      this.prisma = (await import('./db')).prisma;
    }

    const total = await this.prisma.systemAudit.count({
      where: { createdAt: { gte: startDate } }
    });

    const errors = await this.prisma.systemAudit.count({
      where: { 
        createdAt: { gte: startDate },
        OR: [
          { status: 'FAILURE' },
          { severity: 'ERROR' },
          { severity: 'CRITICAL' }
        ]
      }
    });

    return total > 0 ? (errors / total) * 100 : 0;
  }

  // Calculate start date based on timeframe
  private static calculateStartDate(timeframe: string): Date {
    const now = new Date();
    
    switch (timeframe) {
      case '1d':
        return new Date(now.setDate(now.getDate() - 1));
      case '7d':
        return new Date(now.setDate(now.getDate() - 7));
      case '30d':
        return new Date(now.setDate(now.getDate() - 30));
      case '90d':
        return new Date(now.setDate(now.getDate() - 90));
      default:
        return new Date(now.setDate(now.getDate() - 7));
    }
  }
}