import { NextRequest } from "next/server";
import { head } from "@vercel/blob";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { projectFiles } from "@/lib/db/schema";
import { mayAccessProject } from "@/lib/authorization";
import { retrieveEncryptedFile } from "@/lib/storage";
export async function GET(_: NextRequest, { params }: { params: Promise<{ fileId: string }> }) { const file = await db.query.projectFiles.findFirst({ where: eq(projectFiles.id, (await params).fileId) }); if (!file || !(await mayAccessProject(file.projectId))) return new Response("Forbidden", { status: 403 }); const blob = await head(file.storageKey); return new Response(await retrieveEncryptedFile(blob.url), { headers: { "Content-Type": file.contentType, "Content-Disposition": `attachment; filename="${file.filename.replaceAll('"','') }"`, "Cache-Control": "private, no-store" } }); }
