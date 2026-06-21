import { requireAdmin } from "@/lib/authz";
import { PortalShell } from "@/components/portal-shell";
import { AdminProjectForm } from "@/components/admin-project-form";
import { db } from "@/lib/db";
import { clients } from "@/lib/db/schema";
export default async function NewProjectPage(){await requireAdmin();const clientRows=await db.select({id:clients.id,legalName:clients.legalName}).from(clients).orderBy(clients.legalName);return <PortalShell role="admin"><div className="content"><section className="page-heading"><div><p className="eyebrow">ADMIN · PROJECTS</p><h1>Create a project</h1><p className="lead">Select an existing client or create a new organization, then prepare its first project and deposit invoice.</p></div></section><section className="setup-card"><AdminProjectForm clients={clientRows}/></section></div></PortalShell>}
