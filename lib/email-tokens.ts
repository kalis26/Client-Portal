import { randomBytes } from "crypto";
import { and, eq, gt, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { emailTokens } from "@/lib/db/schema";
import { tokenHash } from "@/lib/auth";

export async function issueEmailToken(userId: string, purpose: "verify_email" | "reset_password" | "invite") {
  const token = randomBytes(32).toString("base64url"); const expiresAt = new Date(Date.now() + (purpose === "reset_password" ? 60 : 24 * 60) * 60 * 1000);
  await db.insert(emailTokens).values({ userId, purpose, tokenHash: tokenHash(token), expiresAt });
  return token;
}
export async function consumeEmailToken(token: string, purpose: "verify_email" | "reset_password" | "invite") {
  const rows = await db.select().from(emailTokens).where(and(eq(emailTokens.tokenHash, tokenHash(token)), eq(emailTokens.purpose, purpose), isNull(emailTokens.usedAt), gt(emailTokens.expiresAt, new Date()))).limit(1);
  const record = rows[0]; if (!record) return null;
  await db.update(emailTokens).set({ usedAt: new Date() }).where(eq(emailTokens.id, record.id));
  return record;
}
