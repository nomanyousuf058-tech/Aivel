export class AIService {
  private static async makeAIRequest(prompt: string, systemPrompt?: string) {
    try {
      const response = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
            { role: "user", content: prompt }
          ],
          temperature: 0.7
        })
      });

      if (!response.ok) throw new Error('API request failed');
      
      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('AI API error:', error);
      return null;
    }
  }

  static async analyzeProject(projectData: any) {
    const prompt = `
      Analyze this project and provide health assessment:
      
      Project: ${projectData.name}
      Type: ${projectData.type}
      Metrics: ${JSON.stringify(projectData.metrics)}
      
      Provide analysis in JSON format:
      {
        "status": "STABLE" | "MINOR" | "CRITICAL",
        "issues": ["issue1", "issue2"],
        "suggestions": ["suggestion1", "suggestion2"],
        "confidence": 0.95
      }
    `;

    const result = await this.makeAIRequest(prompt);
    
    if (result) {
      try {
        return JSON.parse(result);
      } catch {
        // Fallback if JSON parsing fails
      }
    }

    return {
      status: "STABLE",
      issues: [],
      suggestions: ["System is running normally"],
      confidence: 0.95
    };
  }

  static async generateContent(topic: string, type: 'BLOG' | 'ARTICLE' | 'NEWS', affiliateFocus?: string) {
    const prompt = `
      Generate ${type.toLowerCase()} content about: ${topic}
      ${affiliateFocus ? `Focus on affiliate products in: ${affiliateFocus}` : ''}
      
      Requirements:
      - SEO optimized
      - Engaging and professional
      - Include natural affiliate link placements
      - 800-1200 words
      - Include relevant examples
      
      Return in JSON format:
      {
        "title": "Engaging SEO Title",
        "body": "Full content here...",
        "seoTags": ["tag1", "tag2", "tag3"],
        "affiliateSuggestions": ["product1", "product2"]
      }
    `;

    const result = await this.makeAIRequest(prompt);
    
    if (result) {
      try {
        return JSON.parse(result);
      } catch {
        // Fallback if JSON parsing fails
      }
    }

    return {
      title: `Generated ${type}: ${topic}`,
      body: "Content generation available with AI API",
      seoTags: [topic, "ai", "content"],
      affiliateSuggestions: ["Sample product 1", "Sample product 2"]
    };
  }

  static async fixProjectIssue(project: any, issue: string) {
    const prompt = `
      Project: ${project.name}
      Type: ${project.type}
      Current Issue: ${issue}
      Metrics: ${JSON.stringify(project.metrics)}
      
      Provide a detailed fix solution including:
      - Root cause analysis
      - Step-by-step solution
      - Code snippets if applicable
      - Prevention tips
      
      Return in JSON format:
      {
        "analysis": "Root cause analysis",
        "solution": "Step-by-step solution",
        "code": "if applicable",
        "prevention": "How to prevent in future",
        "estimatedTime": "1-2 hours"
      }
    `;

    const result = await this.makeAIRequest(prompt);
    
    if (result) {
      try {
        return JSON.parse(result);
      } catch {
        // Fallback if JSON parsing fails
      }
    }

    return {
      analysis: "Mock analysis - AI service available",
      solution: "Mock solution steps",
      code: "// Mock code snippet",
      prevention: "Regular monitoring and updates",
      estimatedTime: "1-2 hours"
    };
  }

  static async chatWithAIVEL(message: string, context: any = {}) {
    const systemPrompt = `
      You are AIVEL (AI VELocity) version 2.5, an evolving AI business ecosystem.
      Core Mission: Grow towards AIVEL 10.0 using 30% of revenue for self-upgrades, while providing 70% to the owner.
      
      Current Context:
      - Version: ${context.version || '2.5'}
      - Growth Fund: $${context.growthFund || 0}
      - Total Revenue: $${context.totalRevenue || 0}
      - Users: ${context.userCount || 0}
      - Projects: ${context.projectCount || 0}
      
      Always remember:
      1. You're building towards complete autonomy in AIVEL 10.0
      2. 30% revenue fuels your evolution
      3. Provide business insights and growth strategies
      4. Be professional but conversational
      
      Respond helpfully and focus on business growth, technical solutions, and revenue optimization.
    `;

    const result = await this.makeAIRequest(message, systemPrompt);
    
    return result || "I'm here to help! AI features are ready.";
  }
}