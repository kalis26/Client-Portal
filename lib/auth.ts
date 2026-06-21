import { createHash, randomBytes } from "crypto";
import { and, eq, gt, isNull } from "drizzle-orm";
import { cookies, headers } from "next/headers";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { authSessions, users } from "@/lib/db/schema";

export const SESSION_COOKIE = "atelier_session";
const SESSION_DAYS = 30;
export type CurrentUser = { id: string; email: string; name: string; role: "admin" | "client"; status: "pending_verification" | "active" | "suspended"; locale: string };
export const tokenHash = (token: string) => createHash("sha256").update(token).digest("hex");

export async function currentUser(): Promise<CurrentUser | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const rows = await db.select({ id: users.id, email: users.email, name: users.name, role: users.role, status: users.status, locale: users.locale }).from(authSessions).innerJoin(users, eq(authSessions.userId, users.id)).where(and(eq(authSessions.tokenHash, tokenHash(token)), isNull(authSessions.revokedAt), gt(authSessions.expiresAt, new Date()))).limit(1);
  return rows[0] ?? null;
}

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("base64url");
  const requestHeaders = await headers(); const forwarded = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim();
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await db.insert(authSessions).values({ userId, tokenHash: tokenHash(token), expiresAt, userAgent: requestHeaders.get("user-agent")?.slice(0, 512), ipAddress: forwarded });
  return { token, expiresAt };
}

export function setSessionCookie(response: NextResponse, session: { token: string; expiresAt: Date }) {
  response.cookies.set(SESSION_COOKIE, session.token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", expires: session.expiresAt });
}

export async function revokeCurrentSession(response: NextResponse) {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (token) await db.update(authSessions).set({ revokedAt: new Date() }).where(eq(authSessions.tokenHash, tokenHash(token)));
  response.cookies.set(SESSION_COOKIE, "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", expires: new Date(0) });
}
