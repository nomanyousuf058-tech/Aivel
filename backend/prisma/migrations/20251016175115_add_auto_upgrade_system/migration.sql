-- CreateEnum
CREATE TYPE "UpgradeCategory" AS ENUM ('CODE_IMPROVEMENT', 'PERFORMANCE', 'SECURITY', 'FEATURE', 'DEPENDENCY_UPDATE', 'CONFIG_CHANGE', 'BUG_FIX');

-- CreateEnum
CREATE TYPE "UpgradePriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "UpgradeStatus" AS ENUM ('PROPOSED', 'APPROVED', 'TESTING', 'TEST_FAILED', 'READY_FOR_DEPLOY', 'DEPLOYING', 'DEPLOYED', 'FAILED', 'ROLLED_BACK', 'REJECTED');

-- CreateEnum
CREATE TYPE "TestType" AS ENUM ('UNIT_TEST', 'INTEGRATION_TEST', 'SAFETY_CHECK', 'PERFORMANCE_TEST', 'SECURITY_SCAN');

-- CreateEnum
CREATE TYPE "TestStatus" AS ENUM ('PENDING', 'RUNNING', 'PASSED', 'FAILED', 'SKIPPED');

-- CreateEnum
CREATE TYPE "DeploymentEnvironment" AS ENUM ('STAGING', 'PRODUCTION');

-- CreateEnum
CREATE TYPE "DeploymentStatus" AS ENUM ('PENDING', 'RUNNING', 'SUCCESS', 'FAILED', 'ROLLED_BACK');

-- CreateTable
CREATE TABLE "upgrade_proposals" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "UpgradeCategory" NOT NULL,
    "priority" "UpgradePriority" NOT NULL DEFAULT 'MEDIUM',
    "changes" JSONB,
    "status" "UpgradeStatus" NOT NULL DEFAULT 'PROPOSED',
    "proposedBy" TEXT NOT NULL DEFAULT 'AI',
    "safetyScore" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "riskAnalysis" JSONB,
    "testsPassed" BOOLEAN NOT NULL DEFAULT false,
    "approvedAt" TIMESTAMP(3),
    "testedAt" TIMESTAMP(3),
    "deployedAt" TIMESTAMP(3),
    "rolledBackAt" TIMESTAMP(3),
    "testResults" JSONB,
    "deployResults" JSONB,
    "rollbackReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "upgrade_proposals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "upgrade_tests" (
    "id" TEXT NOT NULL,
    "proposalId" TEXT NOT NULL,
    "testType" "TestType" NOT NULL,
    "status" "TestStatus" NOT NULL DEFAULT 'PENDING',
    "results" JSONB,
    "logs" TEXT,
    "duration" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "upgrade_tests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deployments" (
    "id" TEXT NOT NULL,
    "proposalId" TEXT NOT NULL,
    "environment" "DeploymentEnvironment" NOT NULL DEFAULT 'STAGING',
    "status" "DeploymentStatus" NOT NULL DEFAULT 'PENDING',
    "logs" TEXT,
    "duration" INTEGER,
    "deployedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "deployments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_configs" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL DEFAULT 'general',
    "isSecret" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT NOT NULL DEFAULT 'system',

    CONSTRAINT "system_configs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "system_configs_key_key" ON "system_configs"("key");

-- AddForeignKey
ALTER TABLE "upgrade_tests" ADD CONSTRAINT "upgrade_tests_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "upgrade_proposals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deployments" ADD CONSTRAINT "deployments_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "upgrade_proposals"("id") ON DELETE CASCADE ON UPDATE CASCADE;
