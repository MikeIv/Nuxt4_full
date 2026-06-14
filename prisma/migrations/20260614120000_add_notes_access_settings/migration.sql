-- CreateTable
CREATE TABLE "notes_access_settings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "passwordHash" TEXT NOT NULL,
    "passwordCipher" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notes_access_settings_pkey" PRIMARY KEY ("id")
);
