// Policy management and enforcement system for AI agents
export class PolicyManager {
  private static prisma: any;

  // Initialize default policies
  static async initializeDefaultPolicies(): Promise<void> {
    if (!this.prisma) {
      this.prisma = (await import('./db')).prisma;
    }

    const defaultPolicies = [
      {
        name: 'Budget Protection Policy',
        description: 'Prevents agents from exceeding budget limits',
        scope: 'SYSTEM',
        conditions: {},
        actions: { block: true, notify: true },
        constraints: { maxCostPerTask: 100, maxDailyCost: 1000 },
        priority: 1,
        autoEnforce: true
      },
      {
        name: 'High Risk Task Approval',
        description: 'Requires approval for high-risk tasks',
        scope: 'TASK_TYPE',
        conditions: { taskType: ['SYSTEM_UPGRADE', 'SECURITY_SCAN'] },
        actions: { requireApproval: true },
        constraints: { requireApproval: true },
        priority: 2,
        autoEnforce: true
      },
      {
        name: 'Code Change Safety',
        description: 'Additional safety checks for code changes',
        scope: 'AGENT',
        conditions: { agentId: 'CODE_FIXER' },
        actions: { safetyCheck: true, backup: true },
        constraints: { requireTesting: true, requireBackup: true },
        priority: 3,
        autoEnforce: true
      },
      {
        name: 'Data Protection',
        description: 'Prevents exposure of sensitive data',
        scope: 'SYSTEM',
        conditions: {},
        actions: { encrypt: true, anonymize: true },
        constraints: { noPersonalData: true, noSecrets: true },
        priority: 1,
        autoEnforce: true
      }
    ];

    for (const policy of defaultPolicies) {
      await this.prisma.agentPolicy.upsert({
        where: { name: policy.name },
        update: {},
        create: policy
      });
    }

    console.log('📜 Default AI agent policies created');
  }

  // Evaluate policies for a task
  static async evaluatePolicies(task: any, agent: any): Promise<{
    allowed: boolean;
    requiresApproval: boolean;
    constraints: any;
    violations: string[];
  }> {
    if (!this.prisma) {
      this.prisma = (await import('./db')).prisma;
    }

    const policies = await this.prisma.agentPolicy.findMany({
      where: { 
        isActive: true,
        OR: [
          { scope: 'SYSTEM' },
          { scope: 'AGENT', conditions: { path: ['agentId'], equals: agent.id } },
          { scope: 'TASK_TYPE', conditions: { path: ['taskType'], equals: task.type } }
        ]
      },
      orderBy: { priority: 'desc' }
    });

    const violations: string[] = [];
    let requiresApproval = false;
    const constraints: any = {};

    for (const policy of policies) {
      const applies = this.evaluateConditions(policy.conditions, task, agent);
      
      if (applies) {
        // Check constraints
        const constraintViolations = this.checkConstraints(policy.constraints, task);
        violations.push(...constraintViolations);

        // Apply actions
        if (policy.actions.requireApproval) {
          requiresApproval = true;
        }

        // Merge constraints
        Object.assign(constraints, policy.constraints);
      }
    }

    return {
      allowed: violations.length === 0,
      requiresApproval,
      constraints,
      violations
    };
  }

  // Evaluate policy conditions
  private static evaluateConditions(conditions: any, task: any, agent: any): boolean {
    try {
      if (conditions.agentId && conditions.agentId !== agent.id) {
        return false;
      }

      if (conditions.taskType && !conditions.taskType.includes(task.type)) {
        return false;
      }

      if (conditions.minConfidence && task.confidence < conditions.minConfidence) {
        return false;
      }

      if (conditions.maxCost && task.costEstimate > conditions.maxCost) {
        return false;
      }

      return true;
    } catch (error) {
      console.error('Policy condition evaluation error:', error);
      return false;
    }
  }

  // Check policy constraints
  private static checkConstraints(constraints: any, task: any): string[] {
    const violations: string[] = [];

    if (constraints.maxCost && task.costEstimate > constraints.maxCost) {
      violations.push(`Cost estimate ${task.costEstimate} exceeds maximum ${constraints.maxCost}`);
    }

    if (constraints.requireApproval && !task.approved) {
      violations.push('Approval required for this task type');
    }

    if (constraints.allowedTaskTypes && !constraints.allowedTaskTypes.includes(task.type)) {
      violations.push(`Task type ${task.type} not allowed`);
    }

    if (constraints.noPersonalData && this.containsPersonalData(task)) {
      violations.push('Task contains personal data');
    }

    return violations;
  }

  // Check if task contains personal data
  private static containsPersonalData(task: any): boolean {
    const personalPatterns = [
      'email', 'password', 'credit_card', 'ssn', 'phone', 'address'
    ];

    const taskStr = JSON.stringify(task).toLowerCase();
    return personalPatterns.some(pattern => taskStr.includes(pattern));
  }

  // Get all policies
  static async getPolicies(scope?: string): Promise<any[]> {
    if (!this.prisma) {
      this.prisma = (await import('./db')).prisma;
    }

    const where = scope ? { scope } : {};
    
    return await this.prisma.agentPolicy.findMany({
      where: { ...where, isActive: true },
      orderBy: [{ priority: 'desc' }, { name: 'asc' }]
    });
  }

  // Update a policy
  static async updatePolicy(policyId: string, updates: any): Promise<void> {
    if (!this.prisma) {
      this.prisma = (await import('./db')).prisma;
    }

    await this.prisma.agentPolicy.update({
      where: { id: policyId },
      data: updates
    });
  }
}