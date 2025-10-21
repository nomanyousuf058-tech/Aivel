// AI Agent specialized in code analysis and fixes
import { AIAgentBase, AgentTask, AgentResult } from '../ai-agent-base';
import { AIService } from '../ai-service';

export class CodeFixAgent extends AIAgentBase {
  protected async performTask(task: AgentTask): Promise<AgentResult> {
    const { code, issue, context } = task.input;
    
    const prompt = `
      CODE FIX REQUEST:
      
      Issue: ${issue}
      Code Context: ${context || 'No additional context'}
      
      Code to fix:
      \`\`\`
      ${code}
      \`\`\`
      
      Please provide:
      1. Fixed code
      2. Explanation of the fix
      3. Potential risks
      4. Testing recommendations
      
      Return as JSON:
      {
        "fixedCode": "the fixed code here",
        "explanation": "what was fixed and why",
        "risks": ["risk1", "risk2"],
        "testing": ["test1", "test2"],
        "complexity": "LOW|MEDIUM|HIGH"
      }
    `;

    try {
      const response = await AIService.chatWithAIVEL(prompt, {
        agent: 'CodeFixAgent',
        task: 'code_fix'
      });

      const fixData = this.parseFixResponse(response);
      const confidence = this.calculateFixConfidence(fixData);

      return {
        success: true,
        output: fixData,
        confidence,
        costEstimate: await this.estimateCost(task),
        reasoning: `Fixed code issue: ${issue}. Confidence based on fix complexity and risks.`,
        risks: fixData.risks,
        recommendations: fixData.testing
      };
    } catch (error) {
      return {
        success: false,
        output: null,
        confidence: 0,
        costEstimate: await this.estimateCost(task),
        reasoning: `Failed to generate fix: ${error.message}`
      };
    }
  }

  private parseFixResponse(response: string): any {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('No JSON found in response');
    } catch (error) {
      // Fallback parsing
      return {
        fixedCode: response,
        explanation: 'AI provided fix without structured response',
        risks: ['Unable to parse AI response properly'],
        testing: ['Manual testing required'],
        complexity: 'UNKNOWN'
      };
    }
  }

  private calculateFixConfidence(fixData: any): number {
    let confidence = 0.8; // Base confidence
    
    if (fixData.complexity === 'LOW') confidence += 0.15;
    if (fixData.complexity === 'MEDIUM') confidence += 0.05;
    if (fixData.complexity === 'HIGH') confidence -= 0.1;
    
    if (fixData.risks && fixData.risks.length > 0) {
      confidence -= fixData.risks.length * 0.05;
    }
    
    return Math.max(0.1, Math.min(0.95, confidence));
  }
}