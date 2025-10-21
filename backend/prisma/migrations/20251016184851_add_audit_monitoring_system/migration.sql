-- CreateEnum
CREATE TYPE "AuditSeverity" AS ENUM ('DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL');

-- CreateEnum
CREATE TYPE "AuditStatus" AS ENUM ('SUCCESS', 'FAILURE', 'UNAUTHORIZED');

-- CreateEnum
CREATE TYPE "RateLimitType" AS ENUM ('API_REQUEST', 'AGENT_TASK', 'USER_ACTION', 'SYSTEM_OPERATION');

-- CreateEnum
CREATE TYPE "SafetyCheckType" AS ENUM ('PRE_TASK', 'POST_TASK', 'PERIODIC', 'MANUAL', 'AUTOMATED');

-- CreateEnum
CREATE TYPE "SafetyStatus" AS ENUM ('PASSED', 'WARNING', 'FAILED', 'BLOCKED');

-- CreateEnum
CREATE TYPE "AlertType" AS ENUM ('BUDGET_EXCEEDED', 'RATE_LIMIT_EXCEEDED', 'SAFETY_VIOLATION', 'SYSTEM_ERROR', 'PERFORMANCE_DEGRADATION', 'SECURITY_THREAT');

-- CreateEnum
CREATE TYPE "AlertSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "AlertStatus" AS ENUM ('ACTIVE', 'ACKNOWLEDGED', 'RESOLVED', 'DISMISSED');

-- CreateEnum
CREATE TYPE "BudgetCategory" AS ENUM ('AI_API_COSTS', 'INFRASTRUCTURE', 'MARKETING', 'DEVELOPMENT', 'OPERATIONS');

-- CreateEnum
CREATE TYPE "LimitType" AS ENUM ('SOFT', 'HARD');

-- CreateTable
CREATE TABLE "system_audits" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "resourceId" TEXT,
    "userId" TEXT,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "oldValues" JSONB,
    "newValues" JSONB,
    "changes" JSONB,
    "context" JSONB,
    "severity" "AuditSeverity" NOT NULL DEFAULT 'INFO',
    "status" "AuditStatus" NOT NULL DEFAULT 'SUCCESS',
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "system_audits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rate_limits" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "type" "RateLimitType" NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 1,
    "windowStart" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "windowEnd" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rate_limits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "safety_checks" (
    "id" TEXT NOT NULL,
    "checkType" "SafetyCheckType" NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "status" "SafetyStatus" NOT NULL DEFAULT 'PASSED',
    "rules" JSONB NOT NULL,
    "violations" TEXT[],
    "score" DOUBLE PRECISION NOT NULL,
    "context" JSONB,
    "triggeredBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "safety_checks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_alerts" (
    "id" TEXT NOT NULL,
    "type" "AlertType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "severity" "AlertSeverity" NOT NULL DEFAULT 'MEDIUM',
    "data" JSONB,
    "source" TEXT,
    "status" "AlertStatus" NOT NULL DEFAULT 'ACTIVE',
    "acknowledgedBy" TEXT,
    "acknowledgedAt" TIMESTAMP(3),
    "resolvedBy" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "monthly_budgets" (
    "id" TEXT NOT NULL,
    "month" TIMESTAMP(3) NOT NULL,
    "category" "BudgetCategory" NOT NULL,
    "allocated" DOUBLE PRECISION NOT NULL,
    "spent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "limitType" "LimitType" NOT NULL DEFAULT 'SOFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "monthly_budgets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "system_audits_action_idx" ON "system_audits"("action");

-- CreateIndex
CREATE INDEX "system_audits_resource_idx" ON "system_audits"("resource");

-- CreateIndex
CREATE INDEX "system_audits_userId_idx" ON "system_audits"("userId");

-- CreateIndex
CREATE INDEX "system_audits_createdAt_idx" ON "system_audits"("createdAt");

-- CreateIndex
CREATE INDEX "rate_limits_key_type_idx" ON "rate_limits"("key", "type");

-- CreateIndex
CREATE INDEX "rate_limits_expiresAt_idx" ON "rate_limits"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "rate_limits_key_type_windowStart_key" ON "rate_limits"("key", "type", "windowStart");

-- CreateIndex
CREATE INDEX "safety_checks_targetType_targetId_idx" ON "safety_checks"("targetType", "targetId");

-- CreateIndex
CREATE INDEX "safety_checks_checkType_idx" ON "safety_checks"("checkType");

-- CreateIndex
CREATE INDEX "safety_checks_status_idx" ON "safety_checks"("status");

-- CreateIndex
CREATE INDEX "safety_checks_createdAt_idx" ON "safety_checks"("createdAt");

-- CreateIndex
CREATE INDEX "system_alerts_type_idx" ON "system_alerts"("type");

-- CreateIndex
CREATE INDEX "system_alerts_severity_idx" ON "system_alerts"("severity");

-- CreateIndex
CREATE INDEX "system_alerts_status_idx" ON "system_alerts"("status");

-- CreateIndex
CREATE INDEX "system_alerts_createdAt_idx" ON "system_alerts"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "monthly_budgets_month_category_key" ON "monthly_budgets"("month", "category");
