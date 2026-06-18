-- Better Auth 1.6 Account model: refreshTokenExpiresAt
ALTER TABLE "accounts" ADD COLUMN IF NOT EXISTS "refreshTokenExpiresAt" TIMESTAMP(3);
