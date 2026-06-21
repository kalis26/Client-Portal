import { NextRequest } from "next/server";
import { head } from "@vercel/blob";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { generatedDocuments } from "@/lib/db/schema";
import { retrieveImmutablePdf } from "@/lib/storage";
import { mayAccessDocument } from "@/lib/authorization";

export async function GET(_: NextRequest, { params }: { params: Promise<{ documentId: string }> }) {
  const documentId = (await params).documentId;
  if (!(await mayAccessDocument(documentId))) return new Response("Forbidden", { status: 403 });
  const document = await db.query.generatedDocuments.findFirst({ where: eq(generatedDocuments.id, documentId) });
  if (!document) return new Response("Not found", { status: 404 });
  const blob = await head(document.storageKey);
  const bytes = await retrieveImmutablePdf(blob.url);
  return new Response(bytes, { headers: { "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename="${document.kind}.pdf"`, "Cache-Control": "private, no-store" } });
}
