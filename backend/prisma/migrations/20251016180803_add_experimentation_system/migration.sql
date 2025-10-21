-- CreateEnum
CREATE TYPE "ExperimentStatus" AS ENUM ('DRAFT', 'RUNNING', 'PAUSED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ExperimentCategory" AS ENUM ('UI_UX', 'PERFORMANCE', 'FEATURE', 'PRICING', 'CONTENT', 'MARKETING', 'ONBOARDING');

-- CreateEnum
CREATE TYPE "ExperimentEventType" AS ENUM ('IMPRESSION', 'ENGAGEMENT', 'CONVERSION', 'REVENUE', 'RETENTION', 'BOUNCE');

-- CreateTable
CREATE TABLE "experiments" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "hypothesis" TEXT NOT NULL,
    "status" "ExperimentStatus" NOT NULL DEFAULT 'DRAFT',
    "category" "ExperimentCategory" NOT NULL,
    "variants" JSONB NOT NULL,
    "targetAudience" TEXT,
    "trafficAllocation" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "variantWeights" JSONB,
    "primaryMetric" TEXT NOT NULL,
    "secondaryMetrics" TEXT[],
    "successThreshold" DOUBLE PRECISION,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "estimatedDuration" INTEGER,
    "results" JSONB,
    "winnerVariant" TEXT,
    "confidence" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "experiments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "experiment_variants" (
    "id" TEXT NOT NULL,
    "experimentId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "config" JSONB NOT NULL,
    "allocation" DOUBLE PRECISION NOT NULL DEFAULT 0.5,

    CONSTRAINT "experiment_variants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "experiment_events" (
    "id" TEXT NOT NULL,
    "experimentId" TEXT NOT NULL,
    "variantName" TEXT NOT NULL,
    "userId" TEXT,
    "sessionId" TEXT NOT NULL,
    "eventType" "ExperimentEventType" NOT NULL,
    "eventValue" DOUBLE PRECISION,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "experiment_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "experiment_summaries" (
    "id" TEXT NOT NULL,
    "experimentId" TEXT NOT NULL,
    "variantName" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "participants" INTEGER NOT NULL DEFAULT 0,
    "conversions" INTEGER NOT NULL DEFAULT 0,
    "totalValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "averageValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "pValue" DOUBLE PRECISION,
    "confidenceInterval" JSONB,

    CONSTRAINT "experiment_summaries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "experiments_name_key" ON "experiments"("name");

-- CreateIndex
CREATE INDEX "experiment_events_experimentId_variantName_idx" ON "experiment_events"("experimentId", "variantName");

-- CreateIndex
CREATE INDEX "experiment_events_eventType_idx" ON "experiment_events"("eventType");

-- CreateIndex
CREATE UNIQUE INDEX "experiment_summaries_experimentId_variantName_date_key" ON "experiment_summaries"("experimentId", "variantName", "date");

-- AddForeignKey
ALTER TABLE "experiment_variants" ADD CONSTRAINT "experiment_variants_experimentId_fkey" FOREIGN KEY ("experimentId") REFERENCES "experiments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "experiment_events" ADD CONSTRAINT "experiment_events_experimentId_fkey" FOREIGN KEY ("experimentId") REFERENCES "experiments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "experiment_summaries" ADD CONSTRAINT "experiment_summaries_experimentId_fkey" FOREIGN KEY ("experimentId") REFERENCES "experiments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
