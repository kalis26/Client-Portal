import { PortalShell } from "@/components/portal-shell";
import { Dashboard } from "@/components/dashboard";
import { requireUser } from "@/lib/authz";
import { db } from "@/lib/db";
import { clientContacts, generatedDocuments, invoices, projects } from "@/lib/db/schema";
import { and, desc, eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export default async function Home() {
  const user = await requireUser();
  if(user.role==="admin") redirect("/admin");
  const project=await db.select({id:projects.id,name:projects.name,status:projects.status}).from(projects).innerJoin(clientContacts,and(eq(clientContacts.clientId,projects.clientId),eq(clientContacts.userId,user.id))).orderBy(desc(projects.createdAt)).limit(1);
  const p=project[0]; const documentCount=p?(await db.select({id:generatedDocuments.id}).from(generatedDocuments).where(eq(generatedDocuments.projectId,p.id))).length:0; const invoice=p?await db.select({id:invoices.id,publicId:invoices.publicId,amount:invoices.amount,currency:invoices.currency}).from(invoices).where(and(eq(invoices.projectId,p.id),eq(invoices.status,"issued"))).limit(1):[];
  return <PortalShell><Dashboard project={p} invoice={invoice[0]} documentCount={documentCount}/></PortalShell>;
}
