import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { currentUser } from "@/lib/auth";
import { mayAccessProject } from "@/lib/authorization";
import { db } from "@/lib/db";
import { projectFiles } from "@/lib/db/schema";
import { storeEncryptedFile } from "@/lib/storage";

const allowed = new Set(["application/pdf", "image/jpeg", "image/png", "application/zip", "text/plain"]);
export async function POST(request: NextRequest) { const user = await currentUser(); const form = await request.formData(); const projectId = String(form.get("projectId") ?? ""); const file = form.get("file"); if (!user || user.status !== "active" || !(file instanceof File) || !(await mayAccessProject(projectId))) return NextResponse.json({ error: "Not authorized." }, { status: 403 }); if (file.size > 20_000_000 || !allowed.has(file.type)) return NextResponse.json({ error: "Unsupported file type or file exceeds 20 MB." }, { status: 400 }); const stored = await storeEncryptedFile({ key: `files/${projectId}/${crypto.randomUUID()}.bin`, bytes: new Uint8Array(await file.arrayBuffer()) }); const [record] = await db.insert(projectFiles).values({ projectId, uploadedBy: user.id, storageKey: stored.key, filename: file.name.slice(0,255), contentType: file.type, sizeBytes: file.size }).returning(); return NextResponse.json(record, { status: 201 }); }

export async function GET(request: NextRequest) { const projectId = request.nextUrl.searchParams.get("projectId"); if (!projectId || !(await mayAccessProject(projectId))) return NextResponse.json({ error: "Not authorized." }, { status: 403 }); return NextResponse.json(await db.select().from(projectFiles).where(eq(projectFiles.projectId, projectId))); }
