import { and, desc, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { Dashboard } from "@/components/dashboard";
import { PortalShell } from "@/components/portal-shell";
import { requireUser } from "@/lib/authz";
import { db } from "@/lib/db";
import { clientContacts, generatedDocuments, invoices, payments, projects } from "@/lib/db/schema";
export default async function Home({searchParams}:{searchParams:Promise<{project?:string}>}){const user=await requireUser();if(user.role==="admin")redirect("/admin");const rows=await db.select().from(projects).innerJoin(clientContacts,and(eq(clientContacts.clientId,projects.clientId),eq(clientContacts.userId,user.id))).orderBy(desc(projects.updatedAt));const selected=(await searchParams).project;const project=rows.map(r=>r.projects).find(p=>p.publicId===selected)??rows[0]?.projects;if(!project)return <PortalShell><Dashboard projects={[]} /></PortalShell>;const [docs,bills,proofs]=await Promise.all([db.select().from(generatedDocuments).where(eq(generatedDocuments.projectId,project.id)),db.select().from(invoices).where(eq(invoices.projectId,project.id)),db.select().from(payments).innerJoin(invoices,eq(payments.invoiceId,invoices.id)).where(eq(invoices.projectId,project.id)).orderBy(desc(payments.createdAt))]);return <PortalShell projectPublicId={project.publicId}><Dashboard projects={rows.map(r=>r.projects)} project={project} documents={docs} invoices={bills} proof={proofs[0]?.payments}/></PortalShell>}
