ALTER TABLE "inquiries" ADD COLUMN IF NOT EXISTS "reviewed_at" timestamp with time zone;
ALTER TABLE "inquiries" ADD COLUMN IF NOT EXISTS "reviewed_by" uuid REFERENCES "users"("id");
ALTER TABLE "inquiries" ADD COLUMN IF NOT EXISTS "review_note" text;
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "inquiry_id" uuid REFERENCES "inquiries"("id");
ALTER TABLE "payments" ADD COLUMN IF NOT EXISTS "review_note" text;
CREATE INDEX IF NOT EXISTS "projects_inquiry_idx" ON "projects" USING btree ("inquiry_id");
