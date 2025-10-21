// System alert management and notification system
import { AuditLogger } from './audit-logger';
export class AlertManager {
  private static prisma: any;

  // Create a new alert
  static async createAlert(data: {
    type: string;
    title: string;
    message: string;
    severity: string;
    data?: any;
    source?: string;
  }): Promise<void> {
    if (!this.prisma) {
      this.prisma = (await import('./db')).prisma;
    }

    await this.prisma.systemAlert.create({
      data: {
        type: data.type,
        title: data.title,
        message: data.message,
        severity: data.severity,
        data: data.data,
        source: data.source,
        status: 'ACTIVE'
      }
    });

    // Log the alert creation
    await AuditLogger.logAction({
      action: 'ALERT_CREATED',
      resource: 'SYSTEM_ALERT',
      context: data,
      severity: data.severity === 'CRITICAL' ? 'CRITICAL' : 'WARNING'
    });

    // Trigger notifications for high-severity alerts
    if (['HIGH', 'CRITICAL'].includes(data.severity)) {
      await this.triggerNotifications(data);
    }
  }

  // Trigger notifications for an alert
  private static async triggerNotifications(alert: any): Promise<void> {
    // In production, this would send emails, Slack messages, etc.
    console.log(`🔔 ALERT: ${alert.severity} - ${alert.title}`);
    console.log(`   ${alert.message}`);
    
    if (alert.data) {
      console.log('   Data:', JSON.stringify(alert.data, null, 2));
    }
  }

  // Acknowledge an alert
  static async acknowledgeAlert(alertId: string, userId: string): Promise<void> {
    if (!this.prisma) {
      this.prisma = (await import('./db')).prisma;
    }

    await this.prisma.systemAlert.update({
      where: { id: alertId },
      data: {
        status: 'ACKNOWLEDGED',
        acknowledgedBy: userId,
        acknowledgedAt: new Date()
      }
    });

    await AuditLogger.logAction({
      action: 'ALERT_ACKNOWLEDGED',
      resource: 'SYSTEM_ALERT',
      resourceId: alertId,
      userId: userId
    });
  }

  // Resolve an alert
  static async resolveAlert(alertId: string, userId: string, resolutionNotes?: string): Promise<void> {
    if (!this.prisma) {
      this.prisma = (await import('./db')).prisma;
    }

    await this.prisma.systemAlert.update({
      where: { id: alertId },
      data: {
        status: 'RESOLVED',
        resolvedBy: userId,
        resolvedAt: new Date(),
        data: {
          ...(await this.prisma.systemAlert.findUnique({ where: { id: alertId } })).data,
          resolutionNotes,
          resolvedAt: new Date().toISOString()
        }
      }
    });

    await AuditLogger.logAction({
      action: 'ALERT_RESOLVED',
      resource: 'SYSTEM_ALERT',
      resourceId: alertId,
      userId: userId,
      context: { resolutionNotes }
    });
  }

  // Get active alerts
  static async getActiveAlerts(severity?: string): Promise<any[]> {
    if (!this.prisma) {
      this.prisma = (await import('./db')).prisma;
    }

    const where: any = { status: 'ACTIVE' };
    if (severity) where.severity = severity;

    return await this.prisma.systemAlert.findMany({
      where,
      orderBy: [{ severity: 'desc' }, { createdAt: 'desc' }]
    });
  }

  // Get alert statistics
  static async getAlertStats(timeframe: string = '7d'): Promise<any> {
    if (!this.prisma) {
      this.prisma = (await import('./db')).prisma;
    }

    const startDate = this.calculateStartDate(timeframe);
    
    const [
      totalAlerts,
      alertsByType,
      alertsBySeverity,
      resolutionTime
    ] = await Promise.all([
      this.prisma.systemAlert.count({
        where: { createdAt: { gte: startDate } }
      }),
      this.prisma.systemAlert.groupBy({
        by: ['type'],
        where: { createdAt: { gte: startDate } },
        _count: { _all: true }
      }),
      this.prisma.systemAlert.groupBy({
        by: ['severity'],
        where: { createdAt: { gte: startDate } },
        _count: { _all: true }
      }),
      this.prisma.systemAlert.aggregate({
        where: { 
          createdAt: { gte: startDate },
          resolvedAt: { not: null }
        },
        _avg: {
          // Calculate resolution time in hours
          // This is a simplified calculation
        }
      })
    ]);

    const activeAlerts = await this.prisma.systemAlert.count({
      where: { 
        createdAt: { gte: startDate },
        status: 'ACTIVE'
      }
    });

    return {
      timeframe,
      totalAlerts,
      activeAlerts,
      alertsByType,
      alertsBySeverity,
      resolutionRate: totalAlerts > 0 ? ((totalAlerts - activeAlerts) / totalAlerts) * 100 : 100
    };
  }

  // Clean up old alerts
  static async cleanupOldAlerts(days: number = 90): Promise<{ deleted: number }> {
    if (!this.prisma) {
      this.prisma = (await import('./db')).prisma;
    }

    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    const result = await this.prisma.systemAlert.deleteMany({
      where: {
        createdAt: { lt: cutoffDate },
        status: { in: ['RESOLVED', 'DISMISSED'] }
      }
    });

    console.log(`🧹 Cleaned up ${result.count} old alerts`);
    return { deleted: result.count };
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