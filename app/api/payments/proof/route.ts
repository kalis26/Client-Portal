import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { mayAccessInvoice } from "@/lib/authorization";
import { db } from "@/lib/db";
import { payments } from "@/lib/db/schema";
export async function POST(request:NextRequest){const user=await currentUser();if(!user)return NextResponse.json({error:"Not authorized."},{status:401});const form=await request.formData();const invoiceId=String(form.get("invoiceId")??"");const proof=form.get("proof");if(!invoiceId||!(proof instanceof File)||!(await mayAccessInvoice(invoiceId)))return NextResponse.json({error:"Invalid payment proof."},{status:400});if(proof.size>5_000_000)return NextResponse.json({error:"Proof exceeds 5 MB."},{status:400});await db.insert(payments).values({invoiceId,method:"ccp_transfer",amount:"0.00",proofStorageKey:`pending:${proof.name}`});return NextResponse.json({received:true},{status:201})}
