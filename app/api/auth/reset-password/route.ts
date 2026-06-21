import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { authSessions, users } from "@/lib/db/schema";
import { consumeEmailToken } from "@/lib/email-tokens";
import { hashPassword } from "@/lib/passwords";
import { eq } from "drizzle-orm";
const input = z.object({ token: z.string().min(20), password: z.string().min(12).max(128) });
export async function POST(request: NextRequest) { const parsed = input.safeParse(await request.json()); if (!parsed.success) return NextResponse.json({ error: "Unable to reset password." }, { status: 400 }); const record = await consumeEmailToken(parsed.data.token, "reset_password"); if (!record) return NextResponse.json({ error: "This reset link is invalid or expired." }, { status: 400 }); await db.update(users).set({ passwordHash: await hashPassword(parsed.data.password), failedLoginCount: 0, lockedUntil: null, updatedAt: new Date() }).where(eq(users.id, record.userId)); await db.update(authSessions).set({ revokedAt: new Date() }).where(eq(authSessions.userId, record.userId)); return NextResponse.json({ ok: true }); }
