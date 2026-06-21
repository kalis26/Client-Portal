import { createHash } from "crypto";
import { and, count, eq, gt } from "drizzle-orm";
import { db } from "@/lib/db";
import { requestThrottles } from "@/lib/db/schema";

export async function allowAttempt(route: string, ip: string, limit: number, windowMs: number) {
  const ipHash = createHash("sha256").update(`${process.env.RATE_LIMIT_SALT ?? "local"}:${ip}`).digest("hex");
  const since = new Date(Date.now() - windowMs);
  const [{ value }] = await db.select({ value: count() }).from(requestThrottles).where(and(eq(requestThrottles.route, route), eq(requestThrottles.ipHash, ipHash), gt(requestThrottles.createdAt, since)));
  if (value >= limit) return false;
  await db.insert(requestThrottles).values({ route, ipHash });
  return true;
}
