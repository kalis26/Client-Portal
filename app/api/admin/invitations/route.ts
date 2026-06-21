import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { clientContacts, clients, users } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/authz";
import { eq } from "drizzle-orm";
import { issueEmailToken } from "@/lib/email-tokens";
import { accountEmail, sendAccountEmail, smtpConfigured } from "@/lib/mailer";

const input=z.object({clientId:z.string().uuid(),name:z.string().min(2),email:z.string().email()});
export async function POST(request:NextRequest){await requireAdmin();const parsed=input.safeParse(await request.json());if(!parsed.success)return NextResponse.json({error:"Invalid invitation."},{status:400});const client=await db.query.clients.findFirst({where:eq(clients.id,parsed.data.clientId)});if(!client)return NextResponse.json({error:"Client not found."},{status:404});const email=parsed.data.email.toLowerCase();let user=await db.query.users.findFirst({where:eq(users.email,email)});if(!user) [user]=await db.insert(users).values({name:parsed.data.name,email,status:"pending_verification"}).returning();await db.insert(clientContacts).values({clientId:client.id,userId:user.id,email,name:parsed.data.name,isPrimary:false});if(smtpConfigured()){const token=await issueEmailToken(user.id,"invite");const copy=accountEmail("verify",token,user.locale);await sendAccountEmail({to:email,subject:`Invitation to ${client.legalName}`,html:`<p>You have been invited to ${client.legalName}.</p><p><a href="${copy.href}">Create or verify your account</a></p>`})}return NextResponse.json({ok:true},{status:201})}
