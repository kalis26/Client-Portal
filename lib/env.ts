import { z } from "zod";

const schema = z.object({
  DATABASE_URL: z.string().url(),
  PAYPAL_CLIENT_ID: z.string().min(1),
  PAYPAL_CLIENT_SECRET: z.string().min(1),
  PAYPAL_WEBHOOK_ID: z.string().min(1),
  BLOB_READ_WRITE_TOKEN: z.string().min(1).optional(),
  DOCUMENT_ENCRYPTION_KEY: z.string().min(1).optional(),
  CCP_ACCOUNT_HOLDER: z.string().min(1).optional(),
  CCP_ACCOUNT_NUMBER: z.string().min(1).optional(),
  CCP_RIP: z.string().min(1).optional(),
});

export const env = schema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
  PAYPAL_CLIENT_ID: process.env.PAYPAL_CLIENT_ID,
  PAYPAL_CLIENT_SECRET: process.env.PAYPAL_CLIENT_SECRET,
  PAYPAL_WEBHOOK_ID: process.env.PAYPAL_WEBHOOK_ID,
  BLOB_READ_WRITE_TOKEN: process.env.BLOB_READ_WRITE_TOKEN || undefined,
  DOCUMENT_ENCRYPTION_KEY: process.env.DOCUMENT_ENCRYPTION_KEY || undefined,
  CCP_ACCOUNT_HOLDER: process.env.CCP_ACCOUNT_HOLDER || undefined,
  CCP_ACCOUNT_NUMBER: process.env.CCP_ACCOUNT_NUMBER || undefined,
  CCP_RIP: process.env.CCP_RIP || undefined,
});
