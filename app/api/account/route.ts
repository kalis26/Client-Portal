import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { currentUser, revokeCurrentSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { authSessions, users } from "@/lib/db/schema";
import { hashPassword, verifyPassword } from "@/lib/passwords";

const updateInput = z.object({ name: z.string().min(2).max(160).optional(), locale: z.enum(["fr", "en"]).optional() });
export async function PATCH(request: NextRequest) { const user = await currentUser(); const parsed = updateInput.safeParse(await request.json()); if (!user || !parsed.success) return NextResponse.json({ error: "Invalid request." }, { status: 400 }); await db.update(users).set({ ...parsed.data, updatedAt: new Date() }).where(eq(users.id, user.id)); return NextResponse.json({ ok: true }); }
export async function DELETE() { const user = await currentUser(); if (!user) return NextResponse.json({ error: "Not authorized." }, { status: 401 }); const response = NextResponse.json({ ok: true }); await revokeCurrentSession(response); return response; }
export async function POST(request: NextRequest) { const user = await currentUser(); const input = await request.json().catch(() => ({})); if (!user || typeof input.currentPassword !== "string" || typeof input.newPassword !== "string" || input.newPassword.length < 12) return NextResponse.json({ error: "Invalid request." }, { status: 400 }); const row = await db.query.users.findFirst({ where: eq(users.id, user.id) }); if (!row?.passwordHash || !(await verifyPassword(row.passwordHash, input.currentPassword))) return NextResponse.json({ error: "Current password is incorrect." }, { status: 400 }); await db.transaction(async tx => { await tx.update(users).set({ passwordHash: await hashPassword(input.newPassword), updatedAt: new Date() }).where(eq(users.id, user.id)); await tx.update(authSessions).set({ revokedAt: new Date() }).where(eq(authSessions.userId, user.id)); }); const response = NextResponse.json({ ok: true }); await revokeCurrentSession(response); return response; }
