ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "deliverables" jsonb DEFAULT '[]'::jsonb NOT NULL;
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "starts_at" timestamp with time zone;
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "due_at" timestamp with time zone;
ALTER TABLE "payments" ADD COLUMN IF NOT EXISTS "review_status" varchar(24) DEFAULT 'pending' NOT NULL;
ALTER TABLE "payments" ADD COLUMN IF NOT EXISTS "reviewed_at" timestamp with time zone;
ALTER TABLE "payments" ADD COLUMN IF NOT EXISTS "reviewed_by" uuid REFERENCES "users"("id");
DROP TABLE IF EXISTS "verification_tokens";
DROP TABLE IF EXISTS "accounts";
DROP TABLE IF EXISTS "sessions";
