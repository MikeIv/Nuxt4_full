-- Align Better Auth models with v1.6 schema (emailVerified boolean, account.password, timestamps)

-- users.emailVerified: DateTime? -> Boolean
ALTER TABLE "users" ALTER COLUMN "emailVerified" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "emailVerified" TYPE BOOLEAN USING (
  CASE WHEN "emailVerified" IS NOT NULL THEN true ELSE false END
);
ALTER TABLE "users" ALTER COLUMN "emailVerified" SET DEFAULT false;
ALTER TABLE "users" ALTER COLUMN "emailVerified" SET NOT NULL;

-- users.name: optional -> required (no rows yet in dev)
ALTER TABLE "users" ALTER COLUMN "name" SET NOT NULL;

-- accounts: password + timestamps
ALTER TABLE "accounts" ADD COLUMN IF NOT EXISTS "password" TEXT;
ALTER TABLE "accounts" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "accounts" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- verifications: timestamps
ALTER TABLE "verifications" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "verifications" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- indexes expected by Better Auth
CREATE INDEX IF NOT EXISTS "accounts_userId_idx" ON "accounts"("userId");
CREATE INDEX IF NOT EXISTS "verifications_identifier_idx" ON "verifications"("identifier");
