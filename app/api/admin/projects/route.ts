import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { requireAdmin } from "@/lib/authz";
import { db } from "@/lib/db";
import { auditEvents, clientContacts, clients, invoiceItems, invoices, projects, users } from "@/lib/db/schema";
import { allocatePublicId } from "@/lib/public-ids";
import { issueEmailToken } from "@/lib/email-tokens";
import { accountEmail, sendProjectEmail, smtpConfigured } from "@/lib/mailer";
import { generateProjectDocument } from "@/lib/document-service";

const shared = z.object({ projectName:z.string().min(2).max(255), scope:z.string().min(10).max(5000), totalAmount:z.string().regex(/^\d+(\.\d{1,2})?$/), currency:z.enum(["DZD","EUR","USD"]) });
const input = z.discriminatedUnion("clientMode", [shared.extend({clientMode:z.literal("existing"),clientId:z.string().uuid()}),shared.extend({clientMode:z.literal("new"),clientName:z.string().min(2).max(255),contactName:z.string().min(2).max(160),contactEmail:z.string().email()})]);

export async function POST(request: NextRequest) {
  const admin = await requireAdmin(); const parsed = input.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error:"Please complete every required field." }, { status:400 });
  const data=parsed.data, projectId=crypto.randomUUID(), invoiceId=crypto.randomUUID(); let clientId:string, clientPublicId:string|undefined; let invite: {userId:string;email:string;locale:string}|undefined;
  if (data.clientMode === "existing") { const client=await db.query.clients.findFirst({where:eq(clients.id,data.clientId)}); if(!client)return NextResponse.json({error:"Selected client no longer exists."},{status:404}); clientId=client.id; }
  else { clientId=crypto.randomUUID(); clientPublicId=await allocatePublicId("CL"); const email=data.contactEmail.toLowerCase(); let user=await db.query.users.findFirst({where:eq(users.email,email)}); if(!user)[user]=await db.insert(users).values({email,name:data.contactName,status:"pending_verification"}).returning(); invite={userId:user.id,email,locale:user.locale}; }
  const [projectPublicId,invoicePublicId]=await Promise.all([allocatePublicId("PRJ"),allocatePublicId("INV")]); const depositAmount=(Number(data.totalAmount)*.2).toFixed(2), dueAt=new Date(Date.now()+7*86400000);
  await db.transaction(async tx=>{ if(data.clientMode==="new"){await tx.insert(clients).values({id:clientId,publicId:clientPublicId!,legalName:data.clientName,primaryUserId:invite!.userId});await tx.insert(clientContacts).values({clientId,userId:invite!.userId,email:invite!.email,name:data.contactName,isPrimary:true});} await tx.insert(projects).values({id:projectId,publicId:projectPublicId,clientId,name:data.projectName,locale:"fr",currency:data.currency,totalAmount:data.totalAmount,scope:data.scope,status:"awaiting_acceptance"});await tx.insert(invoices).values({id:invoiceId,publicId:invoicePublicId,projectId,amount:depositAmount,currency:data.currency,status:"issued",dueAt,isDeposit:true});await tx.insert(invoiceItems).values({invoiceId,description:`20% deposit for ${data.projectName}`,quantity:1,unitAmount:depositAmount});await tx.insert(auditEvents).values({actorId:admin.id,entityType:"project",entityId:projectId,action:"project_created",metadata:{clientPublicId,projectPublicId,invoicePublicId}}); });
  try { const [agreement,invoiceDoc,welcome]=await Promise.all([generateProjectDocument(projectId,"agreement"),generateProjectDocument(projectId,"invoice"),generateProjectDocument(projectId,"welcome_packet")]); let invitationSent=false; if(invite&&smtpConfigured()){const token=await issueEmailToken(invite.userId,"invite"),copy=accountEmail("invite",token,invite.locale);await sendProjectEmail({to:invite.email,subject:copy.subject,html:`${welcome.html}<div style="background:#050505;color:#fff;padding:24px"><p>${copy.body}</p><p><a style="color:#fff" href="${copy.href}">Open Rezo</a></p>${invoiceDoc.html}</div>`,attachments:[{filename:invoiceDoc.filename,content:invoiceDoc.pdf,contentType:"application/pdf"},{filename:welcome.filename,content:welcome.pdf,contentType:"application/pdf"}]});invitationSent=true;} await db.insert(auditEvents).values({actorId:admin.id,entityType:"project",entityId:projectId,action:"documents_generated",metadata:{agreement:agreement.id,invoice:invoiceDoc.id,welcome:welcome.id}}); return NextResponse.json({projectId,projectPublicId,invoicePublicId,detailUrl:`/admin/projects/${projectId}`,invitationSent},{status:201}); }
  catch(error) { const message=error instanceof Error?error.message:"Unknown document delivery failure"; await db.insert(auditEvents).values({actorId:admin.id,entityType:"project",entityId:projectId,action:"document_delivery_failed",metadata:{message}}); return NextResponse.json({projectId,projectPublicId,invoicePublicId,detailUrl:`/admin/projects/${projectId}`,invitationSent:false,deliveryError:message},{status:201}); }
}
