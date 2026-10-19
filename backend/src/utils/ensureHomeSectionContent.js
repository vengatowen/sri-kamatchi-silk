const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function ensureHomeSectionContentColumn() {
  try {
    // Narrow, additive, idempotent compatibility fix for the existing production DB.
    // Does not reset, rewrite, or delete any existing records.
    await prisma.$executeRawUnsafe(
      'ALTER TABLE "HomeSettings" ADD COLUMN IF NOT EXISTS "sectionContent" JSONB'
    );
    console.log('Verified HomeSettings.sectionContent is present.');
  } catch (error) {
    console.error('Failed to ensure HomeSettings.sectionContent:', error.message);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

ensureHomeSectionContentColumn();
