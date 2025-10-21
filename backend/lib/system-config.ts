// System configuration management for auto-upgrade settings
import { prisma } from './db';

export class SystemConfig {
  // Initialize default system configurations
  static async initializeDefaults(): Promise<void> {
    const defaultConfigs = [
      {
        key: 'auto_upgrade_enabled',
        value: 'false',
        description: 'Enable automatic upgrade proposal generation',
        category: 'upgrade'
      },
      {
        key: 'auto_deploy_enabled', 
        value: 'false',
        description: 'Enable automatic deployment of safe upgrades to staging',
        category: 'upgrade'
      },
      {
        key: 'max_upgrade_cost',
        value: '1000',
        description: 'Maximum cost (PKR) for auto-approved upgrades',
        category: 'upgrade'
      },
      {
        key: 'safety_threshold',
        value: '0.8',
        description: 'Minimum safety score for auto-approval (0-1)',
        category: 'upgrade'
      },
      {
        key: 'upgrade_check_interval',
        value: '7',
        description: 'Days between automatic upgrade checks',
        category: 'upgrade'
      }
    ];

    for (const config of defaultConfigs) {
      await prisma.systemConfig.upsert({
        where: { key: config.key },
        update: {},
        create: config
      });
    }

    console.log('⚙️ System configurations initialized');
  }

  // Initialize experiment configurations
  static async initializeExperimentConfigs(): Promise<void> {
    const experimentConfigs = [
      {
        key: 'auto_experiment_enabled',
        value: 'true',
        description: 'Enable automatic experiment creation for upgrades',
        category: 'experiment'
      },
      {
        key: 'min_experiment_participants',
        value: '100',
        description: 'Minimum participants before analyzing results',
        category: 'experiment'
      },
      {
        key: 'experiment_confidence_threshold',
        value: '0.95',
        description: 'Minimum confidence level for declaring winners',
        category: 'experiment'
      },
      {
        key: 'max_concurrent_experiments',
        value: '3',
        description: 'Maximum number of experiments running concurrently',
        category: 'experiment'
      }
    ];

    for (const config of experimentConfigs) {
      await prisma.systemConfig.upsert({
        where: { key: config.key },
        update: {},
        create: config
      });
    }

    console.log('🔬 Experiment configurations initialized');
  }

  // Get configuration value
  static async get(key: string): Promise<string> {
    const config = await prisma.systemConfig.findUnique({
      where: { key }
    });
    
    return config?.value || '';
  }

  // Set configuration value
  static async set(key: string, value: string, description?: string): Promise<void> {
    await prisma.systemConfig.upsert({
      where: { key },
      update: { 
        value,
        ...(description && { description })
      },
      create: {
        key,
        value,
        description: description || `Configuration for ${key}`,
        category: 'general'
      }
    });
  }

  // Get all configurations (excluding secrets)
  static async getAll(): Promise<any[]> {
    return await prisma.systemConfig.findMany({
      where: { isSecret: false },
      orderBy: { category: 'asc' }
    });
  }

  // Get configuration as boolean
  static async getBoolean(key: string): Promise<boolean> {
    const value = await this.get(key);
    return value.toLowerCase() === 'true';
  }

  // Get configuration as number
  static async getNumber(key: string): Promise<number> {
    const value = await this.get(key);
    return parseFloat(value) || 0;
  }

  // Get configuration as JSON
  static async getJson(key: string): Promise<any> {
    const value = await this.get(key);
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  }

  // Initialize all configurations
  static async initializeAll(): Promise<void> {
    await this.initializeDefaults();
    await this.initializeExperimentConfigs();
    console.log('✅ All system configurations initialized');
  }
}