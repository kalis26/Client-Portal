import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { requireAdmin } from "@/lib/authz";
import { db } from "@/lib/db";
import { authSessions, auditEvents, users } from "@/lib/db/schema";
const input = z.object({ status: z.enum(["active", "suspended", "pending_verification"]) });
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ userId: string }> }) { const admin = await requireAdmin(); const parsed = input.safeParse(await request.json()); const userId = (await params).userId; if (!parsed.success) return NextResponse.json({ error: "Invalid status." }, { status: 400 }); await db.transaction(async tx => { await tx.update(users).set({ status: parsed.data.status, updatedAt: new Date() }).where(eq(users.id, userId)); if (parsed.data.status === "suspended") await tx.update(authSessions).set({ revokedAt: new Date() }).where(eq(authSessions.userId, userId)); await tx.insert(auditEvents).values({ actorId: admin.id, entityType: "user", entityId: userId, action: `user_${parsed.data.status}`, metadata: {} }); }); return NextResponse.json({ ok: true }); }
