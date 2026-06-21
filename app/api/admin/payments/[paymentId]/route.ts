import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { requireAdmin } from "@/lib/authz";
import { db } from "@/lib/db";
import { invoices, payments, projects } from "@/lib/db/schema";
const input = z.object({ decision: z.enum(["accepted", "rejected"]) });
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ paymentId: string }> }) { const admin = await requireAdmin(); const parsed = input.safeParse(await request.json()); if (!parsed.success) return NextResponse.json({ error: "Invalid decision." }, { status: 400 }); const payment = await db.query.payments.findFirst({ where: eq(payments.id, (await params).paymentId) }); if (!payment || payment.method !== "ccp_transfer") return NextResponse.json({ error: "Payment proof not found." }, { status: 404 }); await db.transaction(async tx => { await tx.update(payments).set({ reviewStatus: parsed.data.decision, reviewedAt: new Date(), reviewedBy: admin.id, confirmedAt: parsed.data.decision === "accepted" ? new Date() : null }).where(eq(payments.id, payment.id)); if (parsed.data.decision === "accepted") { const invoice = await tx.query.invoices.findFirst({ where: eq(invoices.id, payment.invoiceId) }); if (invoice) { await tx.update(invoices).set({ status: "paid", updatedAt: new Date() }).where(eq(invoices.id, invoice.id)); if (invoice.isDeposit) await tx.update(projects).set({ status: "active", updatedAt: new Date() }).where(eq(projects.id, invoice.projectId)); } } }); return NextResponse.json({ ok: true }); }
