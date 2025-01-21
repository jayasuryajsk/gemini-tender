-- First, add the new kind column with a default value
ALTER TABLE "Document" ADD COLUMN IF NOT EXISTS "kind" varchar DEFAULT 'text' NOT NULL;

-- Copy data from text to kind if text exists
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Document' AND column_name = 'text') THEN
        UPDATE "Document" SET "kind" = "text";
        ALTER TABLE "Document" DROP COLUMN "text";
    END IF;
END $$;