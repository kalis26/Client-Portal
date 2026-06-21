import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { auditEvents, clientContacts, clients, invoiceItems, invoices, projects } from "@/lib/db/schema";
import { allocatePublicId } from "@/lib/public-ids";

const bodySchema = z.object({ clientName: z.string().min(2).max(255), contactName: z.string().min(2).max(160), contactEmail: z.string().email(), projectName: z.string().min(2).max(255), scope: z.string().min(10).max(5000), totalAmount: z.string().regex(/^\d+(\.\d{1,2})?$/), currency: z.enum(["DZD", "EUR", "USD"]) });

export async function POST(request: NextRequest) {
  const user = await currentUser();
  if (user?.role !== "admin" || user.status !== "active") return NextResponse.json({ error: "Administrator access is required." }, { status: 403 });
  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Please complete every required field." }, { status: 400 });
  if (await db.query.projects.findFirst()) return NextResponse.json({ error: "Initial setup has already been completed." }, { status: 409 });
  const clientId = crypto.randomUUID(), projectId = crypto.randomUUID(), invoiceId = crypto.randomUUID();
  const clientPublicId = await allocatePublicId("CL"), projectPublicId = await allocatePublicId("PRJ"), invoicePublicId = await allocatePublicId("INV");
  const depositAmount = (Number(parsed.data.totalAmount) * 0.2).toFixed(2); const dueAt = new Date(); dueAt.setDate(dueAt.getDate() + 7);
  await db.insert(clients).values({ id: clientId, publicId: clientPublicId, legalName: parsed.data.clientName });
  await db.insert(clientContacts).values({ clientId, email: parsed.data.contactEmail.toLowerCase(), name: parsed.data.contactName, isPrimary: true });
  await db.insert(projects).values({ id: projectId, publicId: projectPublicId, clientId, name: parsed.data.projectName, locale: "fr", currency: parsed.data.currency, totalAmount: parsed.data.totalAmount, scope: parsed.data.scope, status: "awaiting_acceptance" });
  await db.insert(invoices).values({ id: invoiceId, publicId: invoicePublicId, projectId, amount: depositAmount, currency: parsed.data.currency, status: "issued", dueAt, isDeposit: true });
  await db.insert(invoiceItems).values({ invoiceId, description: `20% deposit for ${parsed.data.projectName}`, quantity: 1, unitAmount: depositAmount });
  await db.insert(auditEvents).values({ entityType: "project", entityId: projectId, action: "initial_project_created", metadata: { clientPublicId, projectPublicId, invoicePublicId, contactName: parsed.data.contactName, contactEmail: parsed.data.contactEmail } });
  return NextResponse.json({ projectId, projectPublicId, invoicePublicId }, { status: 201 });
}
