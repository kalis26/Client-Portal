import { NextRequest, NextResponse } from "next/server";
import { and, eq, gt, isNull } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { createSession, setSessionCookie } from "@/lib/auth";
import { verifyPassword } from "@/lib/passwords";
import { allowAttempt } from "@/lib/rate-limit";

const input = z.object({ email: z.string().email(), password: z.string().min(1) });
export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"; if (!(await allowAttempt("sign_in", ip, 10, 15 * 60_000))) return NextResponse.json({ error: "Invalid email or password." }, { status: 429 });
  const parsed = input.safeParse(await request.json()); if (!parsed.success) return NextResponse.json({ error: "Invalid email or password." }, { status: 400 });
  const user = await db.query.users.findFirst({ where: eq(users.email, parsed.data.email.toLowerCase()) });
  const valid = Boolean(user?.passwordHash && user.status === "active" && (!user.lockedUntil || user.lockedUntil < new Date()) && await verifyPassword(user.passwordHash, parsed.data.password));
  if (!valid || !user) { if (user) await db.update(users).set({ failedLoginCount: user.failedLoginCount + 1, lockedUntil: user.failedLoginCount + 1 >= 8 ? new Date(Date.now() + 15 * 60_000) : null }).where(eq(users.id, user.id)); return NextResponse.json({ error: "Invalid email or password." }, { status: 401 }); }
  await db.update(users).set({ failedLoginCount: 0, lockedUntil: null, lastLoginAt: new Date() }).where(eq(users.id, user.id));
  const response = NextResponse.json({ ok: true }); setSessionCookie(response, await createSession(user.id)); return response;
}
