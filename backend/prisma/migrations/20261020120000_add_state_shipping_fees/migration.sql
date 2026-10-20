ALTER TABLE "ShippingSettings"
ADD COLUMN "stateShippingFees" JSONB;

UPDATE "ShippingSettings"
SET "stateShippingFees" = '{"tamilNadu":30,"pondicherry":30,"southStates":60,"otherStates":80}'::jsonb
WHERE "stateShippingFees" IS NULL;
