CREATE TABLE "request_throttles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"route" varchar(96) NOT NULL,
	"ip_hash" varchar(64) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "request_throttles_lookup_idx" ON "request_throttles" USING btree ("route","ip_hash","created_at");