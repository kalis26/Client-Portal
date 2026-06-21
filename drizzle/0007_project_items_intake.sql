CREATE TABLE "project_items" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "project_id" uuid NOT NULL REFERENCES "projects"("id") ON DELETE CASCADE,
  "description" text NOT NULL,
  "quantity" integer DEFAULT 1 NOT NULL,
  "unit_amount" numeric(12,2) NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX "project_items_project_idx" ON "project_items" USING btree ("project_id");
CREATE TABLE "project_intakes" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "project_id" uuid NOT NULL REFERENCES "projects"("id") ON DELETE CASCADE,
  "submitted_by" uuid REFERENCES "users"("id"),
  "answers" jsonb NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE UNIQUE INDEX "project_intakes_project_unique" ON "project_intakes" USING btree ("project_id");
