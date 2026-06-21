import Link from "next/link";
import { db } from "@/lib/db";
import { inquiries, projects, users } from "@/lib/db/schema";
import { count } from "drizzle-orm";
import { requireAdmin } from "@/lib/authz";
import { PortalShell } from "@/components/portal-shell";

export default async function AdminPage(){await requireAdmin();const [[u],[i],[p]]=await Promise.all([db.select({n:count()}).from(users),db.select({n:count()}).from(inquiries),db.select({n:count()}).from(projects)]);return <PortalShell><div className="content"><section className="page-heading"><div><p className="eyebrow">ADMIN OPERATIONS</p><h1>Control room</h1><p className="lead">Clients, project intake, documents, and payment operations.</p></div></section><section className="record-list"><div className="record-row"><span><b>{u.n} registered users</b><small>Manage access and invitations through the admin API.</small></span></div><div className="record-row"><span><b>{i.n} inquiries</b><small>Review incoming project requests.</small></span><Link className="button button-quiet" href="/inquiry">Open intake</Link></div><div className="record-row"><span><b>{p.n} projects</b><small>Create or continue workspaces.</small></span><Link className="button button-quiet" href="/setup">Create project</Link></div></section></div></PortalShell>}
