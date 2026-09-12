-- Prisma 7.10 maps String[] to nullable SQL arrays, even without ?.
-- Align with the canonical contract without rewriting applied migrations.
-- API-key authentication must treat NULL/empty scopes as no permissions.
ALTER TABLE "ApiKey" ALTER COLUMN "scopes" DROP NOT NULL;
