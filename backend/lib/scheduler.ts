// Cron scheduler for automated AI tasks
import cron from 'node-cron';
import { AIWorker } from './worker';

export class AIScheduler {
  private static isRunning = false;

  // Start the scheduler
  static start() {
    if (this.isRunning) {
      console.log('⏰ AI Scheduler already running');
      return;
    }

    console.log('⏰ Starting AI Scheduler...');

    // Daily at 9:00 AM - System scan
    cron.schedule('0 9 * * *', async () => {
      console.log('⏰ Running daily scan...');
      await AIWorker.processTask('daily-scan');
    });

    // Weekly on Monday at 10:00 AM - Comprehensive analysis
    cron.schedule('0 10 * * 1', async () => {
      console.log('⏰ Running weekly analysis...');
      await AIWorker.processTask('weekly-analysis');
    });

    // Every 6 hours - Investment review
    cron.schedule('0 */6 * * *', async () => {
      console.log('⏰ Running investment review...');
      await AIWorker.processTask('investment-review');
    });

    // Every hour - Safety check
    cron.schedule('0 * * * *', async () => {
      console.log('⏰ Running safety check...');
      await AIWorker.processTask('safety-check');
    });

    this.isRunning = true;
    console.log('⏰ AI Scheduler started successfully');
  }

  // Stop the scheduler
  static stop() {
    // Note: node-cron doesn't have a direct stop method
    // In production, you might want to use a different scheduler
    this.isRunning = false;
    console.log('⏰ AI Scheduler stopped');
  }
}