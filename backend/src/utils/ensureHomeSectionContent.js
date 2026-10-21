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

    // The admin logistics endpoint persists stateShippingFees through Prisma.
    // Add this nullable JSONB column idempotently so existing production databases
    // can accept shipping/COD/free-shipping setting updates without data resets.
    await prisma.$executeRawUnsafe(
      'ALTER TABLE "ShippingSettings" ADD COLUMN IF NOT EXISTS "stateShippingFees" JSONB'
    );
    await prisma.$executeRawUnsafe(
      `UPDATE "ShippingSettings"
       SET "stateShippingFees" = '{"tamilNadu":30,"pondicherry":30,"southStates":60,"otherStates":80}'::jsonb
       WHERE "stateShippingFees" IS NULL`
    );
    console.log('Verified ShippingSettings.stateShippingFees is present.');
  } catch (error) {
    console.error('Failed to ensure HomeSettings.sectionContent:', error.message);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

ensureHomeSectionContentColumn();
