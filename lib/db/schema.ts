import {
  boolean, index, integer, jsonb, numeric, pgEnum, pgTable, primaryKey,
  text, timestamp, uniqueIndex, uuid, varchar,
} from "drizzle-orm/pg-core";

export const role = pgEnum("role", ["admin", "client"]);
export const projectStatus = pgEnum("project_status", ["draft", "awaiting_acceptance", "awaiting_deposit", "active", "awaiting_final_payment", "completed", "cancelled"]);
export const invoiceStatus = pgEnum("invoice_status", ["draft", "issued", "partially_paid", "paid", "overdue", "cancelled"]);
export const paymentMethod = pgEnum("payment_method", ["paypal", "ccp_transfer"]);
export const inquiryStatus = pgEnum("inquiry_status", ["new", "approved", "declined", "archived"]);
export const userStatus = pgEnum("user_status", ["pending_verification", "active", "suspended"]);
export const emailTokenPurpose = pgEnum("email_token_purpose", ["verify_email", "reset_password", "invite"]);

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
};

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  role: role("role").notNull().default("client"),
  email: varchar("email", { length: 255 }).notNull(),
  name: varchar("name", { length: 160 }).notNull().default(""),
  emailVerified: timestamp("email_verified", { withTimezone: true }),
  image: varchar("image", { length: 2048 }),
  locale: varchar("locale", { length: 2 }).notNull().default("fr"),
  status: userStatus("status").notNull().default("pending_verification"),
  passwordHash: text("password_hash"),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
  failedLoginCount: integer("failed_login_count").notNull().default(0),
  lockedUntil: timestamp("locked_until", { withTimezone: true }),
  ...timestamps,
}, (t) => [uniqueIndex("users_email_unique").on(t.email)]);

export const emailTokens = pgTable("email_tokens", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  purpose: emailTokenPurpose("purpose").notNull(),
  tokenHash: varchar("token_hash", { length: 64 }).notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  usedAt: timestamp("used_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [uniqueIndex("email_tokens_hash_unique").on(t.tokenHash), index("email_tokens_user_idx").on(t.userId)]);

export const authSessions = pgTable("auth_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  tokenHash: varchar("token_hash", { length: 64 }).notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  revokedAt: timestamp("revoked_at", { withTimezone: true }),
  userAgent: varchar("user_agent", { length: 512 }),
  ipAddress: varchar("ip_address", { length: 64 }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [uniqueIndex("auth_sessions_token_hash_unique").on(t.tokenHash), index("auth_sessions_user_idx").on(t.userId)]);

export const clients = pgTable("clients", {
  id: uuid("id").primaryKey().defaultRandom(),
  publicId: varchar("public_id", { length: 20 }).notNull(),
  legalName: varchar("legal_name", { length: 255 }).notNull(),
  billingAddress: text("billing_address"),
  primaryUserId: uuid("primary_user_id").references(() => users.id),
  ...timestamps,
}, (t) => [uniqueIndex("clients_public_id_unique").on(t.publicId)]);

export const clientContacts = pgTable("client_contacts", {
  id: uuid("id").primaryKey().defaultRandom(),
  clientId: uuid("client_id").notNull().references(() => clients.id, { onDelete: "cascade" }),
  userId: uuid("user_id").references(() => users.id),
  email: varchar("email", { length: 255 }).notNull(),
  name: varchar("name", { length: 160 }).notNull(),
  isPrimary: boolean("is_primary").notNull().default(false),
  ...timestamps,
}, (t) => [index("client_contacts_client_idx").on(t.clientId)]);

export const inquiries = pgTable("inquiries", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 160 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  company: varchar("company", { length: 255 }),
  message: text("message").notNull(),
  status: inquiryStatus("status").notNull().default("new"),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
  reviewedBy: uuid("reviewed_by").references(() => users.id),
  reviewNote: text("review_note"),
  ...timestamps,
}, (t) => [index("inquiries_status_idx").on(t.status)]);

export const projects = pgTable("projects", {
  id: uuid("id").primaryKey().defaultRandom(),
  publicId: varchar("public_id", { length: 20 }).notNull(),
  clientId: uuid("client_id").notNull().references(() => clients.id),
  inquiryId: uuid("inquiry_id").references(() => inquiries.id),
  name: varchar("name", { length: 255 }).notNull(),
  locale: varchar("locale", { length: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).notNull(),
  totalAmount: numeric("total_amount", { precision: 12, scale: 2 }).notNull(),
  status: projectStatus("status").notNull().default("draft"),
  scope: text("scope").notNull(),
  deliverables: jsonb("deliverables").notNull().default([]),
  startsAt: timestamp("starts_at", { withTimezone: true }),
  dueAt: timestamp("due_at", { withTimezone: true }),
  ...timestamps,
}, (t) => [uniqueIndex("projects_public_id_unique").on(t.publicId), index("projects_client_idx").on(t.clientId)]);

export const documentTemplates = pgTable("document_templates", {
  id: uuid("id").primaryKey().defaultRandom(),
  kind: varchar("kind", { length: 32 }).notNull(),
  locale: varchar("locale", { length: 2 }).notNull(),
  version: varchar("version", { length: 32 }).notNull(),
  html: text("html").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  ...timestamps,
}, (t) => [uniqueIndex("document_templates_version_unique").on(t.kind, t.locale, t.version)]);

export const generatedDocuments = pgTable("generated_documents", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: uuid("project_id").notNull().references(() => projects.id),
  kind: varchar("kind", { length: 32 }).notNull(),
  locale: varchar("locale", { length: 2 }).notNull(),
  templateVersion: varchar("template_version", { length: 32 }).notNull(),
  storageKey: text("storage_key").notNull(),
  sha256: varchar("sha256", { length: 64 }).notNull(),
  sourceSnapshot: jsonb("source_snapshot").notNull(),
  acceptedAt: timestamp("accepted_at", { withTimezone: true }),
  ...timestamps,
}, (t) => [index("generated_documents_project_idx").on(t.projectId)]);

export const agreementAcceptances = pgTable("agreement_acceptances", {
  id: uuid("id").primaryKey().defaultRandom(),
  documentId: uuid("document_id").notNull().references(() => generatedDocuments.id),
  signerName: varchar("signer_name", { length: 160 }).notNull(),
  ipAddress: varchar("ip_address", { length: 64 }).notNull(),
  userAgent: text("user_agent").notNull(),
  acceptedAt: timestamp("accepted_at", { withTimezone: true }).notNull().defaultNow(),
});

export const invoices = pgTable("invoices", {
  id: uuid("id").primaryKey().defaultRandom(),
  publicId: varchar("public_id", { length: 20 }).notNull(),
  projectId: uuid("project_id").notNull().references(() => projects.id),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).notNull(),
  status: invoiceStatus("status").notNull().default("draft"),
  dueAt: timestamp("due_at", { withTimezone: true }),
  isDeposit: boolean("is_deposit").notNull().default(false),
  ...timestamps,
}, (t) => [uniqueIndex("invoices_public_id_unique").on(t.publicId), index("invoices_project_idx").on(t.projectId)]);

export const invoiceItems = pgTable("invoice_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  invoiceId: uuid("invoice_id").notNull().references(() => invoices.id, { onDelete: "cascade" }),
  description: text("description").notNull(),
  quantity: integer("quantity").notNull().default(1),
  unitAmount: numeric("unit_amount", { precision: 12, scale: 2 }).notNull(),
  ...timestamps,
}, (t) => [index("invoice_items_invoice_idx").on(t.invoiceId)]);

export const projectItems = pgTable("project_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: uuid("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  description: text("description").notNull(),
  quantity: integer("quantity").notNull().default(1),
  unitAmount: numeric("unit_amount", { precision: 12, scale: 2 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [index("project_items_project_idx").on(t.projectId)]);

export const projectIntakes = pgTable("project_intakes", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: uuid("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  submittedBy: uuid("submitted_by").references(() => users.id),
  answers: jsonb("answers").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [uniqueIndex("project_intakes_project_unique").on(t.projectId)]);

export const payments = pgTable("payments", {
  id: uuid("id").primaryKey().defaultRandom(),
  invoiceId: uuid("invoice_id").notNull().references(() => invoices.id),
  method: paymentMethod("method").notNull(),
  providerReference: varchar("provider_reference", { length: 255 }),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  proofStorageKey: text("proof_storage_key"),
  confirmedAt: timestamp("confirmed_at", { withTimezone: true }),
  reviewStatus: varchar("review_status", { length: 24 }).notNull().default("pending"),
  reviewNote: text("review_note"),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
  reviewedBy: uuid("reviewed_by").references(() => users.id),
  ...timestamps,
}, (t) => [index("payments_invoice_idx").on(t.invoiceId), uniqueIndex("payments_provider_reference_unique").on(t.providerReference)]);

export const providerWebhookEvents = pgTable("provider_webhook_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  provider: varchar("provider", { length: 32 }).notNull(),
  eventId: varchar("event_id", { length: 255 }).notNull(),
  eventType: varchar("event_type", { length: 128 }).notNull(),
  payload: jsonb("payload").notNull(),
  processedAt: timestamp("processed_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [uniqueIndex("provider_webhook_events_unique").on(t.provider, t.eventId)]);

export const projectFiles = pgTable("project_files", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: uuid("project_id").notNull().references(() => projects.id),
  uploadedBy: uuid("uploaded_by").references(() => users.id),
  storageKey: text("storage_key").notNull(),
  filename: varchar("filename", { length: 255 }).notNull(),
  contentType: varchar("content_type", { length: 128 }).notNull(),
  sizeBytes: integer("size_bytes").notNull(),
  ...timestamps,
}, (t) => [index("project_files_project_idx").on(t.projectId)]);

export const publicCounters = pgTable("public_counters", {
  prefix: varchar("prefix", { length: 8 }).notNull(),
  year: integer("year").notNull(),
  value: integer("value").notNull().default(0),
}, (t) => [primaryKey({ columns: [t.prefix, t.year], name: "public_counters_pk" })]);

export const auditEvents = pgTable("audit_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  actorId: uuid("actor_id").references(() => users.id),
  entityType: varchar("entity_type", { length: 48 }).notNull(),
  entityId: uuid("entity_id").notNull(),
  action: varchar("action", { length: 96 }).notNull(),
  metadata: jsonb("metadata").notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const requestThrottles = pgTable("request_throttles", {
  id: uuid("id").primaryKey().defaultRandom(),
  route: varchar("route", { length: 96 }).notNull(),
  ipHash: varchar("ip_hash", { length: 64 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [index("request_throttles_lookup_idx").on(t.route, t.ipHash, t.createdAt)]);
