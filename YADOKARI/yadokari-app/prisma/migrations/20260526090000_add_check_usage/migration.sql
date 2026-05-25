CREATE TYPE "CheckUsageScope" AS ENUM ('USER', 'ANONYMOUS');

CREATE TABLE "CheckUsage" (
    "id" TEXT NOT NULL,
    "scope" "CheckUsageScope" NOT NULL,
    "identifier" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CheckUsage_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "CheckUsage_date_idx" ON "CheckUsage"("date");

CREATE UNIQUE INDEX "CheckUsage_scope_identifier_date_key" ON "CheckUsage"("scope", "identifier", "date");
