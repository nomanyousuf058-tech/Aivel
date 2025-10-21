// Revenue calculation and 70/30 split system
import { AuditLogger } from './audit-logger';
export class PayoutCalculator {
  private static prisma: any;

  // Calculate revenue for a specific period
  static async calculatePeriodRevenue(periodId: string): Promise<{
    totalRevenue: number;
    growthFund: number;
    ownerBalance: number;
    transactionCount: number;
    details: any;
  }> {
    if (!this.prisma) {
      this.prisma = (await import('./db')).prisma;
    }

    const period = await this.prisma.revenuePeriod.findUnique({
      where: { id: periodId }
    });

    if (!period) {
      throw new Error('Revenue period not found');
    }

    // Get all revenue in the period
    const revenues = await this.prisma.revenue.findMany({
      where: {
        createdAt: {
          gte: period.startDate,
          lte: period.endDate
        }
      }
    });

    const totalRevenue = revenues.reduce((sum, revenue) => sum + revenue.amount, 0);
    const growthFund = totalRevenue * 0.3; // 30% to growth fund
    const ownerBalance = totalRevenue * 0.7; // 70% to owner

    // Update period with calculated amounts
    await this.prisma.revenuePeriod.update({
      where: { id: periodId },
      data: {
        totalRevenue,
        growthFund,
        ownerBalance,
        transactionCount: revenues.length,
        averageTransaction: revenues.length > 0 ? totalRevenue / revenues.length : 0
      }
    });

    // Log the calculation
    await this.logRevenueCalculation(periodId, {
      totalRevenue,
      growthFund,
      ownerBalance,
      transactionCount: revenues.length,
      period: `${period.startDate.toISOString()} to ${period.endDate.toISOString()}`
    });

    return {
      totalRevenue,
      growthFund,
      ownerBalance,
      transactionCount: revenues.length,
      details: {
        revenues: revenues.map(r => ({
          id: r.id,
          amount: r.amount,
          type: r.type,
          date: r.createdAt
        }))
      }
    };
  }

  // Create a new revenue period
  static async createRevenuePeriod(startDate: Date, endDate: Date, autoPayout: boolean = true): Promise<string> {
    if (!this.prisma) {
      this.prisma = (await import('./db')).prisma;
    }

    const period = await this.prisma.revenuePeriod.create({
      data: {
        startDate,
        endDate,
        autoPayout,
        status: 'ACTIVE'
      }
    });

    await AuditLogger.logAction({
      action: 'REVENUE_PERIOD_CREATED',
      resource: 'REVENUE_PERIOD',
      resourceId: period.id,
      context: {
        startDate,
        endDate,
        autoPayout
      },
      severity: 'INFO'
    });

    return period.id;
  }

  // Close a revenue period and prepare for payout
  static async closeRevenuePeriod(periodId: string): Promise<any> {
    if (!this.prisma) {
      this.prisma = (await import('./db')).prisma;
    }

    const period = await this.prisma.revenuePeriod.findUnique({
      where: { id: periodId }
    });

    if (!period) {
      throw new Error('Revenue period not found');
    }

    if (period.status !== 'ACTIVE') {
      throw new Error('Period is not active');
    }

    // Calculate final revenue
    const revenue = await this.calculatePeriodRevenue(periodId);

    // Close the period
    const updatedPeriod = await this.prisma.revenuePeriod.update({
      where: { id: periodId },
      data: {
        status: 'CLOSED',
        updatedAt: new Date()
      }
    });

    // Log period closure
    await AuditLogger.logAction({
      action: 'REVENUE_PERIOD_CLOSED',
      resource: 'REVENUE_PERIOD',
      resourceId: periodId,
      context: {
        totalRevenue: revenue.totalRevenue,
        growthFund: revenue.growthFund,
        ownerBalance: revenue.ownerBalance,
        transactionCount: revenue.transactionCount
      },
      severity: 'INFO'
    });

    // Auto-create payout if enabled
    if (period.autoPayout && revenue.ownerBalance > 0) {
      await this.autoCreatePayout(periodId, revenue.ownerBalance);
    }

    return {
      period: updatedPeriod,
      revenue,
      payoutCreated: period.autoPayout && revenue.ownerBalance > 0
    };
  }

  // Automatically create payout for a period
  private static async autoCreatePayout(periodId: string, amount: number): Promise<void> {
    if (!this.prisma) {
      this.prisma = (await import('./db')).prisma;
    }

    // Get owner user (in real system, this would be from your user management)
    const owner = await this.getOwnerUser();
    
    if (!owner) {
      throw new Error('Owner user not found');
    }

    // Get default payout method
    const payoutMethod = await this.getDefaultPayoutMethod(owner.id);
    
    const payout = await this.prisma.payout.create({
      data: {
        ownerId: owner.id,
        amount: amount,
        type: 'REVENUE_SHARE',
        status: 'PENDING',
        periodStart: (await this.prisma.revenuePeriod.findUnique({ where: { id: periodId } })).startDate,
        periodEnd: (await this.prisma.revenuePeriod.findUnique({ where: { id: periodId } })).endDate,
        totalRevenue: (await this.prisma.revenuePeriod.findUnique({ where: { id: periodId } })).totalRevenue,
        growthFund: (await this.prisma.revenuePeriod.findUnique({ where: { id: periodId } })).growthFund,
        ownerShare: amount,
        netAmount: amount, // Would subtract fees in real implementation
        paymentMethod: payoutMethod?.type || 'BANK_TRANSFER',
        description: `Automatic revenue share payout for period ${periodId}`
      }
    });

    // Link payout to period
    await this.prisma.revenuePeriod.update({
      where: { id: periodId },
      data: {
        payoutId: payout.id,
        status: 'PROCESSED'
      }
    });

    // Log payout creation
    await AuditLogger.logAction({
      action: 'AUTO_PAYOUT_CREATED',
      resource: 'PAYOUT',
      resourceId: payout.id,
      context: {
        periodId,
        amount,
        ownerId: owner.id,
        payoutMethod: payoutMethod?.type
      },
      severity: 'INFO'
    });

    console.log(`💰 Auto-created payout: $${amount} for period ${periodId}`);
  }

  // Get owner user (simplified - in production, this would be from your auth system)
  static async getOwnerUser(): Promise<any> {
    if (!this.prisma) {
      this.prisma = (await import('./db')).prisma;
    }

    // In a real system, you'd have proper role-based owner identification
    // For now, we'll use a simple approach
    return await this.prisma.user.findFirst({
      where: { role: 'OWNER' }
    }) || await this.prisma.user.findFirst(); // Fallback to first user
  }

  // Get default payout method for owner
  private static async getDefaultPayoutMethod(ownerId: string): Promise<any> {
    if (!this.prisma) {
      this.prisma = (await import('./db')).prisma;
    }

    return await this.prisma.payoutMethod.findFirst({
      where: {
        ownerId: ownerId,
        isDefault: true,
        status: 'ACTIVE',
        isVerified: true
      }
    });
  }

  // Calculate pending owner balance across all active periods
  static async getPendingOwnerBalance(): Promise<number> {
    if (!this.prisma) {
      this.prisma = (await import('./db')).prisma;
    }

    const activePeriods = await this.prisma.revenuePeriod.findMany({
      where: { status: 'ACTIVE' }
    });

    let totalPending = 0;
    
    for (const period of activePeriods) {
      const revenue = await this.calculatePeriodRevenue(period.id);
      totalPending += revenue.ownerBalance;
    }

    return totalPending;
  }

  // Get revenue statistics
  static async getRevenueStats(timeframe: string = '30d'): Promise<any> {
    if (!this.prisma) {
      this.prisma = (await import('./db')).prisma;
    }

    const startDate = this.calculateStartDate(timeframe);
    
    const [
      totalRevenue,
      revenueByType,
      activePeriods,
      completedPayouts
    ] = await Promise.all([
      this.prisma.revenue.aggregate({
        where: { createdAt: { gte: startDate } },
        _sum: { amount: true },
        _count: { _all: true }
      }),
      this.prisma.revenue.groupBy({
        by: ['type'],
        where: { createdAt: { gte: startDate } },
        _sum: { amount: true },
        _count: { _all: true }
      }),
      this.prisma.revenuePeriod.count({
        where: { status: 'ACTIVE' }
      }),
      this.prisma.payout.aggregate({
        where: { 
          status: 'COMPLETED',
          createdAt: { gte: startDate }
        },
        _sum: { amount: true }
      })
    ]);

    const pendingBalance = await this.getPendingOwnerBalance();

    return {
      timeframe,
      summary: {
        totalRevenue: totalRevenue._sum.amount || 0,
        transactionCount: totalRevenue._count._all || 0,
        growthFund: (totalRevenue._sum.amount || 0) * 0.3,
        ownerEarnings: (totalRevenue._sum.amount || 0) * 0.7,
        paidOut: completedPayouts._sum.amount || 0,
        pendingPayout: pendingBalance,
        activePeriods
      },
      revenueByType,
      split: {
        growthFund: '30%',
        ownerShare: '70%',
        actualSplit: {
          growth: (totalRevenue._sum.amount || 0) * 0.3,
          owner: (totalRevenue._sum.amount || 0) * 0.7
        }
      }
    };
  }

  // Log revenue calculation
  private static async logRevenueCalculation(periodId: string, details: any): Promise<void> {
    await AuditLogger.logAction({
      action: 'REVENUE_CALCULATED',
      resource: 'REVENUE_PERIOD',
      resourceId: periodId,
      context: details,
      severity: 'INFO'
    });
  }

  private static calculateStartDate(timeframe: string): Date {
    const now = new Date();
    
    switch (timeframe) {
      case '7d': return new Date(now.setDate(now.getDate() - 7));
      case '30d': return new Date(now.setDate(now.getDate() - 30));
      case '90d': return new Date(now.setDate(now.getDate() - 90));
      default: return new Date(now.setDate(now.getDate() - 30));
    }
  }
}