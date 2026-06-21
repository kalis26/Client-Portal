import { NextRequest, NextResponse } from "next/server";
import { and, eq, isNull } from "drizzle-orm";
import { currentUser } from "@/lib/auth";
import { mayAccessDocument } from "@/lib/authorization";
import { db } from "@/lib/db";
import { agreementAcceptances, generatedDocuments, projects } from "@/lib/db/schema";

export async function POST(request: NextRequest, { params }: { params: Promise<{ documentId: string }> }) {
  const user = await currentUser(); const documentId = (await params).documentId;
  if (!user || user.status !== "active" || !(await mayAccessDocument(documentId))) return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  const document = await db.query.generatedDocuments.findFirst({ where: eq(generatedDocuments.id, documentId) });
  if (!document || document.kind !== "agreement" || document.acceptedAt) return NextResponse.json({ error: "This agreement cannot be accepted." }, { status: 409 });
  const body = await request.json().catch(() => ({})); const signerName = typeof body.signerName === "string" ? body.signerName.trim().slice(0, 160) : "";
  if (signerName.length < 2) return NextResponse.json({ error: "A signer name is required." }, { status: 400 });
  const ipAddress = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  await db.transaction(async (tx) => { await tx.insert(agreementAcceptances).values({ documentId, signerName, ipAddress, userAgent: request.headers.get("user-agent") ?? "unknown" }); await tx.update(generatedDocuments).set({ acceptedAt: new Date(), updatedAt: new Date() }).where(and(eq(generatedDocuments.id, documentId), isNull(generatedDocuments.acceptedAt))); await tx.update(projects).set({ status: "awaiting_deposit", updatedAt: new Date() }).where(eq(projects.id, document.projectId)); });
  return NextResponse.json({ accepted: true });
}
