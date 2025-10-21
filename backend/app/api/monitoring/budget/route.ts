// API endpoints for budget management
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { BudgetManager } from '@/lib/budget-manager';

export async function GET(request: NextRequest) {
  try {
    await requireAuth();
    
    const budgetStatus = await BudgetManager.getBudgetStatus();

    return NextResponse.json({
      success: true,
      ...budgetStatus
    });
  } catch (error) {
    console.error('Get budget status error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch budget status' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAuth();
    const { action, ...data } = await request.json();

    if (action === 'initialize') {
      await BudgetManager.initializeMonthlyBudgets();
      return NextResponse.json({
        success: true,
        message: 'Monthly budgets initialized successfully'
      });
    }

    if (action === 'update') {
      const budget = await BudgetManager.updateBudget(
        data.category,
        data.allocated,
        data.limitType
      );
      
      return NextResponse.json({
        success: true,
        budget,
        message: 'Budget updated successfully'
      });
    }

    if (action === 'recommendations') {
      const recommendations = await BudgetManager.getSpendingRecommendations();
      return NextResponse.json({
        success: true,
        recommendations
      });
    }

    return NextResponse.json(
      { error: 'Unknown action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Budget operation error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}