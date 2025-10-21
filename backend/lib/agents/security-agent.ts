// AI Agent specialized in security monitoring and analysis
import { AIAgentBase, AgentTask, AgentResult } from '../ai-agent-base';
import { AIService } from '../ai-service';

export class SecurityAgent extends AIAgentBase {
  protected async performTask(task: AgentTask): Promise<AgentResult> {
    const { systemLogs, accessPatterns, threatIndicators, config } = task.input;
    
    const prompt = `
      SECURITY ANALYSIS REQUEST:
      
      System Logs: ${JSON.stringify(systemLogs, null, 2)}
      Access Patterns: ${JSON.stringify(accessPatterns, null, 2)}
      Threat Indicators: ${JSON.stringify(threatIndicators, null, 2)}
      System Config: ${JSON.stringify(config, null, 2)}
      
      Perform security analysis and provide:
      
      1. Threat assessment
      2. Vulnerability analysis
      3. Recommended immediate actions
      4. Long-term security improvements
      5. Risk level (LOW|MEDIUM|HIGH|CRITICAL)
      
      Return as JSON:
      {
        "threatLevel": "LOW|MEDIUM|HIGH|CRITICAL",
        "vulnerabilities": [
          {
            "type": "vulnerability_type",
            "severity": "LOW|MEDIUM|HIGH|CRITICAL",
            "description": "vulnerability_description",
            "fix": "recommended_fix",
            "urgency": "IMMEDIATE|HIGH|MEDIUM|LOW"
          }
        ],
        "immediateActions": ["action1", "action2"],
        "longTermImprovements": ["improvement1", "improvement2"],
        "confidence": 0.95
      }
    `;

    try {
      const response = await AIService.chatWithAIVEL(prompt, {
        agent: 'SecurityAgent',
        task: 'security_analysis'
      });

      const securityAnalysis = this.parseSecurityResponse(response);
      const confidence = securityAnalysis.confidence || this.calculateSecurityConfidence(securityAnalysis);

      // If critical issues found, require immediate attention
      if (securityAnalysis.threatLevel === 'CRITICAL' || 
          securityAnalysis.vulnerabilities?.some((v: any) => v.severity === 'CRITICAL')) {
        await this.triggerSecurityAlert(securityAnalysis);
      }

      return {
        success: true,
        output: securityAnalysis,
        confidence,
        costEstimate: await this.estimateCost(task),
        reasoning: `Security analysis completed. Threat level: ${securityAnalysis.threatLevel}`,
        risks: this.extractSecurityRisks(securityAnalysis),
        recommendations: [
          ...(securityAnalysis.immediateActions || []),
          ...(securityAnalysis.longTermImprovements || [])
        ]
      };
    } catch (error) {
      return {
        success: false,
        output: null,
        confidence: 0,
        costEstimate: await this.estimateCost(task),
        reasoning: `Failed to perform security analysis: ${error.message}`
      };
    }
  }

  private parseSecurityResponse(response: string): any {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('No JSON found in response');
    } catch (error) {
      return {
        threatLevel: 'UNKNOWN',
        vulnerabilities: [],
        immediateActions: ['Manual security review required'],
        longTermImprovements: [],
        confidence: 0.1,
        error: error.message
      };
    }
  }

  private calculateSecurityConfidence(analysis: any): number {
    let confidence = 0.8;
    
    if (analysis.threatLevel === 'CRITICAL') confidence = 0.95;
    if (analysis.threatLevel === 'HIGH') confidence = 0.85;
    if (analysis.threatLevel === 'MEDIUM') confidence = 0.75;
    if (analysis.threatLevel === 'LOW') confidence = 0.65;
    
    // Adjust based on number of vulnerabilities
    if (analysis.vulnerabilities && analysis.vulnerabilities.length > 0) {
      const criticalCount = analysis.vulnerabilities.filter((v: any) => 
        v.severity === 'CRITICAL'
      ).length;
      
      confidence += criticalCount * 0.05;
    }
    
    return Math.max(0.1, Math.min(0.99, confidence));
  }

  private extractSecurityRisks(analysis: any): string[] {
    const risks: string[] = [];
    
    if (analysis.threatLevel === 'CRITICAL') {
      risks.push('CRITICAL security threat detected');
    }
    
    if (analysis.vulnerabilities) {
      analysis.vulnerabilities.forEach((vuln: any) => {
        risks.push(`${vuln.severity} vulnerability: ${vuln.type}`);
      });
    }
    
    return risks.length > 0 ? risks : ['No immediate security risks detected'];
  }

  private async triggerSecurityAlert(analysis: any): Promise<void> {
    const { prisma } = await import('../db');
    
    await prisma.aILog.create({
      data: {
        type: 'SAFETY_CHECK',
        summary: `SECURITY ALERT: ${analysis.threatLevel} threat level detected`,
        details: {
          analysis,
          timestamp: new Date().toISOString(),
          urgent: true
        },
        agent: 'SecurityAgent',
        confidence: 0.99
      }
    });

    // In production, this would trigger notifications, emails, etc.
    console.error('🚨 SECURITY ALERT:', analysis);
  }
}