import { NextRequest,NextResponse } from "next/server";
import { requireAdmin } from "@/lib/authz";
import { generateAgreement } from "@/lib/document-service";
export async function POST(_:NextRequest,{params}:{params:Promise<{projectId:string}>}){await requireAdmin();try{return NextResponse.json(await generateAgreement((await params).projectId),{status:201})}catch{return NextResponse.json({error:"Agreement generation failed."},{status:400})}}
