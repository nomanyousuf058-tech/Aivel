-- CreateEnum
CREATE TYPE "AgentRole" AS ENUM ('CODE_FIXER', 'OPPORTUNITY_FINDER', 'MARKETING_OPTIMIZER', 'SECURITY_GUARDIAN', 'PERFORMANCE_ANALYST', 'CONTENT_CREATOR', 'BUSINESS_ANALYST', 'SYSTEM_MAINTAINER');

-- CreateEnum
CREATE TYPE "AgentStatus" AS ENUM ('ACTIVE', 'PAUSED', 'DISABLED', 'TRAINING');

-- CreateEnum
CREATE TYPE "TaskType" AS ENUM ('CODE_ANALYSIS', 'BUG_FIX', 'PERFORMANCE_OPTIMIZATION', 'SECURITY_SCAN', 'CONTENT_GENERATION', 'MARKETING_STRATEGY', 'INVESTMENT_ANALYSIS', 'SYSTEM_UPGRADE', 'EXPERIMENT_DESIGN', 'RISK_ASSESSMENT');

-- CreateEnum
CREATE TYPE "PolicyScope" AS ENUM ('SYSTEM', 'AGENT', 'TASK_TYPE', 'USER');

-- CreateTable
CREATE TABLE "ai_agents" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "role" "AgentRole" NOT NULL,
    "status" "AgentStatus" NOT NULL DEFAULT 'ACTIVE',
    "capabilities" TEXT[],
    "permissions" JSONB,
    "successRate" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "tasksCompleted" INTEGER NOT NULL DEFAULT 0,
    "avgConfidence" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "minConfidenceThreshold" DOUBLE PRECISION NOT NULL DEFAULT 0.8,
    "maxCostPerTask" DOUBLE PRECISION NOT NULL DEFAULT 100.0,
    "requireHumanApproval" BOOLEAN NOT NULL DEFAULT false,
    "systemPrompt" TEXT,
    "model" TEXT NOT NULL DEFAULT 'gpt-4',
    "temperature" DOUBLE PRECISION NOT NULL DEFAULT 0.3,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_agents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agent_tasks" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "type" "TaskType" NOT NULL,
    "status" "TaskStatus" NOT NULL DEFAULT 'PENDING',
    "input" JSONB,
    "output" JSONB,
    "reasoning" TEXT,
    "confidence" DOUBLE PRECISION,
    "costEstimate" DOUBLE PRECISION,
    "actualCost" DOUBLE PRECISION,
    "duration" INTEGER,
    "safetyScore" DOUBLE PRECISION,
    "riskAnalysis" JSONB,
    "requireApproval" BOOLEAN NOT NULL DEFAULT false,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "rejectedReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "agent_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agent_policies" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "scope" "PolicyScope" NOT NULL DEFAULT 'SYSTEM',
    "conditions" JSONB NOT NULL,
    "actions" JSONB NOT NULL,
    "constraints" JSONB NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "autoEnforce" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agent_policies_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ai_agents_name_key" ON "ai_agents"("name");

-- CreateIndex
CREATE UNIQUE INDEX "agent_policies_name_key" ON "agent_policies"("name");

-- AddForeignKey
ALTER TABLE "agent_tasks" ADD CONSTRAINT "agent_tasks_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "ai_agents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
