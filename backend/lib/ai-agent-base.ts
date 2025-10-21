// Base class for all AI agents with common functionality
import { AIService } from './ai-service';

export interface AgentTask {
  type: string;
  input: any;
  context?: any;
}

export interface AgentResult {
  success: boolean;
  output: any;
  confidence: number;
  costEstimate: number;
  reasoning?: string;
  risks?: string[];
  recommendations?: string[];
}

export abstract class AIAgentBase {
  protected agentConfig: any;
  protected prisma: any;

  constructor(agentConfig: any) {
    this.agentConfig = agentConfig;
  }

  // Main method to execute a task
  async executeTask(task: AgentTask): Promise<AgentResult> {
    const startTime = Date.now();
    
    try {
      // Initialize Prisma if not already done
      if (!this.prisma) {
        this.prisma = (await import('./db')).prisma;
      }

      // Create task record
      const taskRecord = await this.prisma.agentTask.create({
        data: {
          agentId: this.agentConfig.id,
          type: task.type,
          status: 'PENDING',
          input: task.input,
          startedAt: new Date()
        }
      });

      // Pre-task safety check
      const safetyCheck = await this.performSafetyCheck(task);
      if (!safetyCheck.passed) {
        await this.handleSafetyViolation(taskRecord.id, safetyCheck);
        return {
          success: false,
          output: null,
          confidence: 0,
          costEstimate: 0,
          reasoning: `Safety check failed: ${safetyCheck.reason}`,
          risks: safetyCheck.risks
        };
      }

      // Check if approval is required
      const requiresApproval = await this.requiresApproval(task);
      if (requiresApproval) {
        await this.requestApproval(taskRecord.id, task);
        return {
          success: false,
          output: null,
          confidence: 0,
          costEstimate: 0,
          reasoning: 'Task requires manual approval before execution'
        };
      }

      // Execute the task
      const result = await this.performTask(task);
      const duration = Date.now() - startTime;

      // Update task record with results
      await this.prisma.agentTask.update({
        where: { id: taskRecord.id },
        data: {
          status: result.success ? 'COMPLETED' : 'FAILED',
          output: result.output,
          reasoning: result.reasoning,
          confidence: result.confidence,
          costEstimate: result.costEstimate,
          duration: duration,
          completedAt: new Date()
        }
      });

      // Update agent performance metrics
      await this.updateAgentPerformance(result);

      // Log the task execution
      await this.logTaskExecution(taskRecord.id, result, duration);

      return result;

    } catch (error) {
      console.error(`Agent ${this.agentConfig.name} task failed:`, error);
      
      if (this.prisma) {
        await this.prisma.agentTask.update({
          where: { id: (await this.prisma.agentTask.findFirst({ 
            where: { agentId: this.agentConfig.id },
            orderBy: { createdAt: 'desc' }
          })).id },
          data: {
            status: 'FAILED',
            output: { error: error.message },
            completedAt: new Date()
          }
        });
      }

      return {
        success: false,
        output: null,
        confidence: 0,
        costEstimate: 0,
        reasoning: `Task execution failed: ${error.message}`
      };
    }
  }

  // Abstract method that each agent must implement
  protected abstract performTask(task: AgentTask): Promise<AgentResult>;

  // Safety check before task execution
  protected async performSafetyCheck(task: AgentTask): Promise<{ passed: boolean; reason?: string; risks?: string[] }> {
    const risks: string[] = [];

    // Check confidence threshold
    if (this.agentConfig.minConfidenceThreshold > 0.9) {
      risks.push('High confidence threshold may limit agent effectiveness');
    }

    // Check cost limits
    const estimatedCost = await this.estimateCost(task);
    if (estimatedCost > this.agentConfig.maxCostPerTask) {
      return {
        passed: false,
        reason: `Estimated cost (${estimatedCost}) exceeds maximum (${this.agentConfig.maxCostPerTask})`,
        risks: ['Budget overrun risk']
      };
    }

    // Check for dangerous operations
    if (this.containsDangerousOperations(task)) {
      risks.push('Task contains potentially dangerous operations');
    }

    // Apply policy-based checks
    const policyViolations = await this.checkPolicies(task);
    if (policyViolations.length > 0) {
      return {
        passed: false,
        reason: `Policy violations: ${policyViolations.join(', ')}`,
        risks: policyViolations
      };
    }

    return {
      passed: true,
      risks: risks.length > 0 ? risks : undefined
    };
  }

  // Estimate task cost
  protected async estimateCost(task: AgentTask): Promise<number> {
    // Simple cost estimation based on task complexity
    // In production, this would use actual API pricing
    const baseCost = 0.02; // $0.02 per task
    const complexity = this.assessTaskComplexity(task);
    return baseCost * complexity;
  }

  // Assess task complexity (1-10 scale)
  protected assessTaskComplexity(task: AgentTask): number {
    let complexity = 1;
    
    if (task.type.includes('ANALYSIS')) complexity += 2;
    if (task.type.includes('OPTIMIZATION')) complexity += 3;
    if (task.type.includes('GENERATION')) complexity += 2;
    if (task.input && JSON.stringify(task.input).length > 1000) complexity += 1;
    
    return Math.min(10, complexity);
  }

  // Check for dangerous operations
  protected containsDangerousOperations(task: AgentTask): boolean {
    const dangerousPatterns = [
      'delete',
      'drop',
      'remove',
      'override',
      'shutdown',
      'restart'
    ];
    
    const taskStr = JSON.stringify(task).toLowerCase();
    return dangerousPatterns.some(pattern => taskStr.includes(pattern));
  }

  // Check policies against task
  protected async checkPolicies(task: AgentTask): Promise<string[]> {
    const violations: string[] = [];
    
    // Get applicable policies
    const policies = await this.prisma.agentPolicy.findMany({
      where: {
        isActive: true,
        OR: [
          { scope: 'SYSTEM' },
          { scope: 'AGENT', conditions: { path: ['agentId'], equals: this.agentConfig.id } },
          { scope: 'TASK_TYPE', conditions: { path: ['taskType'], equals: task.type } }
        ]
      }
    });

    for (const policy of policies) {
      const applies = this.evaluatePolicyConditions(policy.conditions, task);
      if (applies) {
        const violation = this.checkPolicyConstraints(policy.constraints, task);
        if (violation) {
          violations.push(`${policy.name}: ${violation}`);
        }
      }
    }

    return violations;
  }

  // Evaluate policy conditions
  protected evaluatePolicyConditions(conditions: any, task: AgentTask): boolean {
    // Simple condition evaluation
    // In production, use a proper rules engine
    try {
      if (conditions.agentId && conditions.agentId !== this.agentConfig.id) {
        return false;
      }
      
      if (conditions.taskType && conditions.taskType !== task.type) {
        return false;
      }
      
      if (conditions.minConfidence && task.input?.confidence < conditions.minConfidence) {
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Policy condition evaluation error:', error);
      return false;
    }
  }

  // Check policy constraints
  protected checkPolicyConstraints(constraints: any, task: AgentTask): string | null {
    if (constraints.maxCost && this.estimateCost(task) > constraints.maxCost) {
      return `Cost exceeds maximum of ${constraints.maxCost}`;
    }
    
    if (constraints.allowedTaskTypes && !constraints.allowedTaskTypes.includes(task.type)) {
      return `Task type ${task.type} not allowed`;
    }
    
    if (constraints.requireApproval && !task.input?.approved) {
      return 'Approval required for this task type';
    }
    
    return null;
  }

  // Check if task requires approval
  protected async requiresApproval(task: AgentTask): Promise<boolean> {
    if (this.agentConfig.requireHumanApproval) {
      return true;
    }
    
    // Check policies for approval requirements
    const policies = await this.prisma.agentPolicy.findMany({
      where: {
        isActive: true,
        constraints: { path: ['requireApproval'], equals: true }
      }
    });
    
    return policies.some(policy => this.evaluatePolicyConditions(policy.conditions, task));
  }

  // Request approval for a task
  protected async requestApproval(taskId: string, task: AgentTask): Promise<void> {
    await this.prisma.agentTask.update({
      where: { id: taskId },
      data: {
        status: 'APPROVAL_REQUIRED',
        requireApproval: true
      }
    });

    // Log approval request
    await this.prisma.aILog.create({
      data: {
        type: 'SYSTEM_UPDATE',
        summary: `Approval required for agent task: ${this.agentConfig.name} - ${task.type}`,
        details: {
          taskId,
          agent: this.agentConfig.name,
          taskType: task.type,
          input: task.input
        },
        agent: this.agentConfig.name,
        confidence: 0.5
      }
    });
  }

  // Handle safety violation
  protected async handleSafetyViolation(taskId: string, safetyCheck: any): Promise<void> {
    await this.prisma.agentTask.update({
      where: { id: taskId },
      data: {
        status: 'FAILED',
        output: { safetyViolation: safetyCheck.reason, risks: safetyCheck.risks }
      }
    });

    await this.prisma.aILog.create({
      data: {
        type: 'SAFETY_CHECK',
        summary: `Safety violation prevented agent task: ${this.agentConfig.name}`,
        details: {
          taskId,
          reason: safetyCheck.reason,
          risks: safetyCheck.risks
        },
        agent: this.agentConfig.name,
        confidence: 0.9
      }
    });
  }

  // Update agent performance metrics
  protected async updateAgentPerformance(result: AgentResult): Promise<void> {
    const agent = await this.prisma.aIAgent.findUnique({
      where: { id: this.agentConfig.id }
    });

    const newTasksCompleted = agent.tasksCompleted + 1;
    const newSuccessRate = ((agent.successRate * agent.tasksCompleted) + (result.success ? 1 : 0)) / newTasksCompleted;
    const newAvgConfidence = ((agent.avgConfidence * agent.tasksCompleted) + (result.confidence || 0)) / newTasksCompleted;

    await this.prisma.aIAgent.update({
      where: { id: this.agentConfig.id },
      data: {
        tasksCompleted: newTasksCompleted,
        successRate: newSuccessRate,
        avgConfidence: newAvgConfidence
      }
    });
  }

  // Log task execution
  protected async logTaskExecution(taskId: string, result: AgentResult, duration: number): Promise<void> {
    await this.prisma.aILog.create({
      data: {
        type: 'TASK_EXECUTION',
        summary: `Agent ${this.agentConfig.name} completed task: ${result.success ? 'SUCCESS' : 'FAILED'}`,
        details: {
          taskId,
          agent: this.agentConfig.name,
          success: result.success,
          confidence: result.confidence,
          duration: duration,
          costEstimate: result.costEstimate
        },
        agent: this.agentConfig.name,
        confidence: result.confidence || 0,
        costEstimate: result.costEstimate || 0
      }
    });
  }
}