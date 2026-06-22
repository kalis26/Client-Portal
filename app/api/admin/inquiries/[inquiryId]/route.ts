import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { requireAdmin } from "@/lib/authz";
import { db } from "@/lib/db";
import { auditEvents, inquiries } from "@/lib/db/schema";

const input=z.object({status:z.enum(["approved","declined","archived"]),note:z.string().max(2000).optional()});
export async function PATCH(request:NextRequest,{params}:{params:Promise<{inquiryId:string}>}){const admin=await requireAdmin();const parsed=input.safeParse(await request.json());if(!parsed.success)return NextResponse.json({error:"Invalid inquiry decision."},{status:400});const id=(await params).inquiryId;const inquiry=await db.query.inquiries.findFirst({where:eq(inquiries.id,id)});if(!inquiry)return NextResponse.json({error:"Inquiry not found."},{status:404});await db.transaction(async tx=>{await tx.update(inquiries).set({status:parsed.data.status,reviewedAt:new Date(),reviewedBy:admin.id,reviewNote:parsed.data.note??null,updatedAt:new Date()}).where(eq(inquiries.id,id));await tx.insert(auditEvents).values({actorId:admin.id,entityType:"inquiry",entityId:id,action:`inquiry_${parsed.data.status}`,metadata:{note:parsed.data.note??null}})});return NextResponse.json({ok:true});}
