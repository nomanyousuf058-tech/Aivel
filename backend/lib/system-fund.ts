// Enhanced system fund management with payout integration
export class SystemFund {
  private static prisma: any;

  // Initialize system fund with payout integration
  static async initialize(): Promise<void> {
    if (!this.prisma) {
      this.prisma = (await import('./db')).prisma;
    }

    const existingFund = await this.prisma.systemFund.findFirst();
    
    if (!existingFund) {
      await this.prisma.systemFund.create({
        data: {
          growthFund: 0,
          ownerEarnings: 0,
          totalRevenue: 0,
          monthlyBudget: 10000,
          autoInvest: false,
          autoDeployEnabled: false
        }
      });

      console.log('💰 System fund initialized with payout support');
    }

    // Initialize payout scheduler
    const { PayoutScheduler } = await import('./payout-scheduler');
    PayoutScheduler.start();
    
    // Initialize default payout rules
    await PayoutScheduler.initializeDefaultRules();

    // Initialize monthly budgets for payout categories
    const { BudgetManager } = await import('./budget-manager');
    await BudgetManager.initializeMonthlyBudgets();
  }

  // Record revenue with automatic 70/30 split
  static async recordRevenue(amount: number, type: string, description: string, context?: any): Promise<void> {
    if (!this.prisma) {
      this.prisma = (await import('./db')).prisma;
    }

    const growthFund = amount * 0.3;
    const ownerEarnings = amount * 0.7;

    // Update system fund
    const systemFund = await this.prisma.systemFund.findFirst();
    
    if (systemFund) {
      await this.prisma.systemFund.update({
        where: { id: systemFund.id },
        data: {
          growthFund: { increment: growthFund },
          ownerEarnings: { increment: ownerEarnings },
          totalRevenue: { increment: amount }
        }
      });
    }

    // Record revenue transaction
    await this.prisma.revenue.create({
      data: {
        amount: amount,
        type: type,
        description: description,
        userId: context?.userId,
        projectId: context?.projectId,
        productId: context?.productId,
        contentId: context?.contentId,
        growthFund: growthFund,
        ownerShare: ownerEarnings
      }
    });

    // Log revenue recording
    await import('./audit-logger').then(({ AuditLogger }) =>
      AuditLogger.logAction({
        action: 'REVENUE_RECORDED',
        resource: 'REVENUE',
        context: {
          amount,
          type,
          description,
          growthFund,
          ownerEarnings,
          split: '70/30'
        },
        severity: 'INFO'
      })
    );

    // Check if auto-payout should be triggered
    await this.checkAutoPayout(systemFund);
  }

  // Check if auto-payout should be triggered
  private static async checkAutoPayout(systemFund: any): Promise<void> {
    if (!this.prisma) {
      this.prisma = (await import('./db')).prisma;
    }

    // Get auto-payout rules
    const autoPayoutRule = await this.prisma.payoutRule.findFirst({
      where: {
        type: 'AUTO_PAYOUT',
        isActive: true
      }
    });

    if (autoPayoutRule && systemFund.ownerEarnings >= 100) { // $100 threshold
      const { PayoutProcessor } = await import('./payout-processor');
      await PayoutProcessor.processPendingPayouts();
    }
  }

  // Get complete financial overview
  static async getFinancialOverview(): Promise<any> {
    if (!this.prisma) {
      this.prisma = (await import('./db')).prisma;
    }

    const [
      systemFund,
      revenueStats,
      payoutStats,
      pendingBalance,
      budgetStatus
    ] = await Promise.all([
      this.prisma.systemFund.findFirst(),
      import('./payout-calculator').then(({ PayoutCalculator }) => 
        PayoutCalculator.getRevenueStats('30d')
      ),
      import('./payout-processor').then(({ PayoutProcessor }) =>
        PayoutProcessor.getPayoutStats('30d')
      ),
      import('./payout-calculator').then(({ PayoutCalculator }) =>
        PayoutCalculator.getPendingOwnerBalance()
      ),
      import('./budget-manager').then(({ BudgetManager }) =>
        BudgetManager.getBudgetStatus()
      )
    ]);

    return {
      systemFund,
      revenue: revenueStats.summary,
      payouts: payoutStats.summary,
      pendingBalance,
      budgets: budgetStatus,
      split: {
        growthFund: '30%',
        ownerShare: '70%',
        actual: {
          growthFund: systemFund?.growthFund || 0,
          ownerEarnings: systemFund?.ownerEarnings || 0
        }
      }
    };
  }
}