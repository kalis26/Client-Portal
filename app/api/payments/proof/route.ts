import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { currentUser } from "@/lib/auth";
import { mayAccessInvoice } from "@/lib/authorization";
import { db } from "@/lib/db";
import { invoices, payments, projects } from "@/lib/db/schema";
import { storeEncryptedFile } from "@/lib/storage";
const allowed=new Set(["application/pdf","image/jpeg","image/png"]);
export async function POST(request:NextRequest){const user=await currentUser();if(!user||user.status!=="active")return NextResponse.json({error:"Not authorized."},{status:401});const form=await request.formData(),invoiceId=String(form.get("invoiceId")??""),proof=form.get("proof");if(!invoiceId||!(proof instanceof File)||!(await mayAccessInvoice(invoiceId)))return NextResponse.json({error:"Invalid payment proof."},{status:400});const invoice=await db.query.invoices.findFirst({where:eq(invoices.id,invoiceId)}),project=invoice?await db.query.projects.findFirst({where:eq(projects.id,invoice.projectId)}):undefined;if(!invoice||!project||invoice.currency!=="DZD"||invoice.status!=="issued"||project.status==="awaiting_acceptance")return NextResponse.json({error:"CCP proof is not available for this invoice."},{status:400});if(proof.size>5_000_000||!allowed.has(proof.type))return NextResponse.json({error:"Upload a PDF, PNG, or JPEG under 5 MB."},{status:400});const stored=await storeEncryptedFile({key:`payment-proofs/${invoiceId}/${crypto.randomUUID()}.bin`,bytes:new Uint8Array(await proof.arrayBuffer())});await db.insert(payments).values({invoiceId,method:"ccp_transfer",amount:invoice.amount,proofStorageKey:stored.key,reviewStatus:"pending"});return NextResponse.json({received:true},{status:201})}
