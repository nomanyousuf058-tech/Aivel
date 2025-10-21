// Automated payout scheduling system
import cron from 'node-cron';
import { PayoutProcessor } from './payout-processor';

export class PayoutScheduler {
  private static isRunning = false;

  // Start the payout scheduler
  static start(): void {
    if (this.isRunning) {
      console.log('⏰ Payout scheduler already running');
      return;
    }

    console.log('⏰ Starting payout scheduler...');

    // Daily at 9:00 AM - Check for pending payouts
    cron.schedule('0 9 * * *', async () => {
      console.log('⏰ Running daily payout check...');
      await this.processScheduledPayouts();
    });

    // Weekly on Monday at 10:00 AM - Process weekly payouts
    cron.schedule('0 10 * * 1', async () => {
      console.log('⏰ Processing weekly payouts...');
      await this.processWeeklyPayouts();
    });

    // Monthly on 1st at 6:00 AM - Process monthly payouts
    cron.schedule('0 6 1 * *', async () => {
      console.log('⏰ Processing monthly payouts...');
      await this.processMonthlyPayouts();
    });

    // Every 6 hours - Process any pending payouts
    cron.schedule('0 */6 * * *', async () => {
      console.log('⏰ Processing pending payouts...');
      await PayoutProcessor.processPendingPayouts();
    });

    this.isRunning = true;
    console.log('⏰ Payout scheduler started successfully');
  }

  // Stop the scheduler
  static stop(): void {
    this.isRunning = false;
    console.log('⏰ Payout scheduler stopped');
  }

  // Process scheduled payouts based on rules
  private static async processScheduledPayouts(): Promise<void> {
    const { prisma } = await import('./db');
    
    try {
      // Get active payout rules
      const rules = await prisma.payoutRule.findMany({
        where: { isActive: true }
      });

      for (const rule of rules) {
        if (this.shouldExecuteRule(rule)) {
          await this.executePayoutRule(rule);
        }
      }
    } catch (error) {
      console.error('Scheduled payout processing error:', error);
    }
  }

  // Process weekly payouts
  private static async processWeeklyPayouts(): Promise<void> {
    const { prisma } = await import('./db');
    
    try {
      // Close current week's revenue period
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const now = new Date();

      const period = await prisma.revenuePeriod.findFirst({
        where: {
          status: 'ACTIVE',
          startDate: { gte: weekAgo }
        }
      });

      if (period) {
        console.log(`💰 Closing weekly revenue period: ${period.id}`);
        await this.closeRevenuePeriodAndPayout(period.id);
      }
    } catch (error) {
      console.error('Weekly payout processing error:', error);
    }
  }

  // Process monthly payouts
  private static async processMonthlyPayouts(): Promise<void> {
    const { prisma } = await import('./db');
    
    try {
      // Close current month's revenue period
      const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const now = new Date();

      const period = await prisma.revenuePeriod.findFirst({
        where: {
          status: 'ACTIVE',
          startDate: { gte: monthAgo }
        }
      });

      if (period) {
        console.log(`💰 Closing monthly revenue period: ${period.id}`);
        await this.closeRevenuePeriodAndPayout(period.id);
      }
    } catch (error) {
      console.error('Monthly payout processing error:', error);
    }
  }

  // Close revenue period and trigger payout
  private static async closeRevenuePeriodAndPayout(periodId: string): Promise<void> {
    const { prisma } = await import('./db');
    const { PayoutCalculator } = await import('./payout-calculator');

    try {
      const result = await PayoutCalculator.closeRevenuePeriod(periodId);
      
      if (result.payoutCreated) {
        console.log(`💰 Auto-created payout for period: ${periodId}`);
        
        // Process the payout immediately
        const { PayoutProcessor } = await import('./payout-processor');
        await PayoutProcessor.processPayout(result.period.payoutId);
      }
    } catch (error: any) {
      console.error(`Error closing period ${periodId}:`, error);
      
      // Log the error
      await import('./audit-logger').then(({ AuditLogger }) => 
        AuditLogger.logAction({
          action: 'AUTO_PAYOUT_FAILED',
          resource: 'REVENUE_PERIOD',
          resourceId: periodId,
          context: { error: error.message },
          severity: 'ERROR',
          status: 'FAILURE'
        })
      );
    }
  }

  // Check if a rule should be executed
  private static shouldExecuteRule(rule: any): boolean {
    const now = new Date();
    
    // Check last execution time
    if (rule.lastTriggered) {
      const lastTriggered = new Date(rule.lastTriggered);
      const hoursSinceLastExecution = (now.getTime() - lastTriggered.getTime()) / (1000 * 60 * 60);
      
      // Don't execute if it's been less than 1 hour
      if (hoursSinceLastExecution < 1) {
        return false;
      }
    }

    // Check rule-specific conditions
    const conditions = rule.conditions;
    
    if (conditions.minimumAmount) {
      // Would check if pending balance meets minimum
      // This is simplified - in production, you'd calculate actual pending amount
    }

    if (conditions.specificDays) {
      const today = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
      if (!conditions.specificDays.includes(today)) {
        return false;
      }
    }

    return true;
  }

  // Execute a payout rule
  private static async executePayoutRule(rule: any): Promise<void> {
    const { prisma } = await import('./db');
    
    try {
      console.log(`💰 Executing payout rule: ${rule.name}`);

      // Update last triggered time
      await prisma.payoutRule.update({
        where: { id: rule.id },
        data: { lastTriggered: new Date() }
      });

      // Execute rule actions
      const actions = rule.actions;
      
      if (actions.createPayout) {
        await this.executeCreatePayoutAction(actions.createPayout);
      }

      if (actions.processPending) {
        const { PayoutProcessor } = await import('./payout-processor');
        await PayoutProcessor.processPendingPayouts();
      }

      // Log rule execution
      await import('./audit-logger').then(({ AuditLogger }) =>
        AuditLogger.logAction({
          action: 'PAYOUT_RULE_EXECUTED',
          resource: 'PAYOUT_RULE',
          resourceId: rule.id,
          context: {
            rule: rule.name,
            actions: Object.keys(actions)
          },
          severity: 'INFO'
        })
      );

    } catch (error) {
      console.error(`Error executing payout rule ${rule.name}:`, error);
    }
  }

  // Execute create payout action
  private static async executeCreatePayoutAction(actionConfig: any): Promise<void> {
    const { prisma } = await import('./db');
    const { PayoutCalculator } = await import('./payout-calculator');

    // Get pending balance
    const pendingBalance = await PayoutCalculator.getPendingOwnerBalance();
    
    if (pendingBalance >= (actionConfig.minimumAmount || 0)) {
      // Create a manual payout for the pending balance
      const owner = await PayoutCalculator.getOwnerUser();
      
      if (owner) {
        await prisma.payout.create({
          data: {
            ownerId: owner.id,
            amount: pendingBalance,
            type: 'REVENUE_SHARE',
            status: 'PENDING',
            periodStart: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
            periodEnd: new Date(),
            totalRevenue: pendingBalance / 0.7, // Calculate back to total revenue
            growthFund: pendingBalance / 0.7 * 0.3,
            ownerShare: pendingBalance,
            netAmount: pendingBalance,
            paymentMethod: 'BANK_TRANSFER',
            description: `Scheduled payout from rule execution. Pending balance: $${pendingBalance}`
          }
        });

        console.log(`💰 Created scheduled payout: $${pendingBalance}`);
      }
    }
  }

  // Initialize default payout rules
  static async initializeDefaultRules(): Promise<void> {
    const { prisma } = await import('./db');

    const defaultRules = [
      {
        name: 'Weekly Auto Payout',
        description: 'Automatically process payouts every Monday',
        type: 'AUTO_PAYOUT',
        conditions: {
          specificDays: [1], // Monday
          minimumAmount: 50
        },
        actions: {
          processPending: true,
          createPayout: {
            minimumAmount: 50
          }
        },
        priority: 1,
        isActive: true
      },
      {
        name: 'Minimum Payout Threshold',
        description: 'Create payout when pending balance reaches $100',
        type: 'MINIMUM_PAYOUT',
        conditions: {
          minimumAmount: 100
        },
        actions: {
          createPayout: {
            minimumAmount: 100
          }
        },
        priority: 2,
        isActive: true
      }
    ];

    for (const ruleConfig of defaultRules) {
      await prisma.payoutRule.upsert({
        where: { name: ruleConfig.name },
        update: {},
        create: ruleConfig
      });
    }

    console.log('💰 Default payout rules initialized');
  }
}