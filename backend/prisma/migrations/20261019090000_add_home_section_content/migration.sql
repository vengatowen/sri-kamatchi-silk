-- Add persisted JSON settings for manually selected homepage products and section content.
ALTER TABLE "HomeSettings" ADD COLUMN "sectionContent" JSONB;
