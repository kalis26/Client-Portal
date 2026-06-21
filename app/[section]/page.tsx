import Link from "next/link";
import { FileText, FolderOpen, ReceiptText, Settings } from "lucide-react";
import { PortalShell } from "@/components/portal-shell";
import { db } from "@/lib/db";
import { clients, invoices, projects } from "@/lib/db/schema";
import { and, desc, eq } from "drizzle-orm";
import { clientContacts } from "@/lib/db/schema";
import { requireUser } from "@/lib/authz";
import { generatedDocuments } from "@/lib/db/schema";
import { InvoiceActions } from "@/components/invoice-actions";
import { AccountSettings } from "@/components/account-settings";

export const dynamic = "force-dynamic";

const pages = {
  project: { icon: FolderOpen, title: "Projects", copy: "Your assigned projects and agreed delivery scope." },
  documents: { icon: FileText, title: "Documents", copy: "Generated agreements, onboarding packets, and immutable document versions will appear here." },
  invoices: { icon: ReceiptText, title: "Invoices", copy: "Issued deposit and final invoices will appear here. A PayPal action only appears for a real, payable invoice." },
  files: { icon: FolderOpen, title: "Files", copy: "Secure project files shared with your workspace." },
  settings: { icon: Settings, title: "Settings", copy: "Manage your account and language preferences." },
} as const;

export default async function SectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  const user = await requireUser();
  const page = pages[section as keyof typeof pages];
  if (!page) return <PortalShell><div className="content"><h1>Page not found</h1></div></PortalShell>;
  if (section === "project") {
    const query = db.select({ projectId: projects.publicId, projectName: projects.name, status: projects.status, clientName: clients.legalName, scope: projects.scope }).from(projects).innerJoin(clients, eq(projects.clientId, clients.id));
    const record = user.role === "admin" ? await query.orderBy(desc(projects.createdAt)).limit(1) : await query.innerJoin(clientContacts, and(eq(clientContacts.clientId, clients.id), eq(clientContacts.userId, user.id))).orderBy(desc(projects.createdAt)).limit(1);
    return <PortalShell role={user.role}><div className="content"><section className="page-heading"><div><p className="eyebrow">PROJECTS</p><h1>Projects</h1><p className="lead">Your active client engagements and agreed delivery scope.</p></div></section>{record[0] ? <section className="record-list"><p className="eyebrow">{record[0].projectId} · {record[0].status.replaceAll("_", " ")}</p><h2>{record[0].projectName}</h2><p><b>{record[0].clientName}</b></p><p>{record[0].scope}</p></section> : <EmptyState page={page} />}</div></PortalShell>;
  }
  if (section === "invoices") {
    const query = db.select({ id: invoices.id, invoiceId: invoices.publicId, amount: invoices.amount, currency: invoices.currency, status: invoices.status, projectName: projects.name, dueAt: invoices.dueAt }).from(invoices).innerJoin(projects, eq(invoices.projectId, projects.id));
    const record = user.role === "admin" ? await query.orderBy(desc(invoices.createdAt)).limit(10) : await query.innerJoin(clients, eq(projects.clientId, clients.id)).innerJoin(clientContacts, and(eq(clientContacts.clientId, clients.id), eq(clientContacts.userId, user.id))).orderBy(desc(invoices.createdAt)).limit(10);
    return <PortalShell role={user.role}><div className="content"><section className="page-heading"><div><p className="eyebrow">BILLING</p><h1>Invoices</h1><p className="lead">Issued payment requests and their verification status.</p></div></section>{record.length ? <section className="record-list">{record.map((invoice) => <div className="record-row" key={invoice.invoiceId}><span><b>{invoice.invoiceId}</b><small>{invoice.projectName} · due {invoice.dueAt?.toLocaleDateString() ?? "on issue"}</small></span><strong>{invoice.currency} {invoice.amount}</strong><em className="status status-warning">{invoice.status.replaceAll("_", " ")}</em><InvoiceActions invoiceId={invoice.id} payable={invoice.status === "issued" || invoice.status === "partially_paid"}/></div>)}</section> : <EmptyState page={page} />}</div></PortalShell>;
  }
  if (section === "documents") { const rows = user.role === "admin" ? await db.select().from(generatedDocuments).orderBy(desc(generatedDocuments.createdAt)) : await db.select({ id:generatedDocuments.id,kind:generatedDocuments.kind,templateVersion:generatedDocuments.templateVersion,createdAt:generatedDocuments.createdAt,acceptedAt:generatedDocuments.acceptedAt }).from(generatedDocuments).innerJoin(projects,eq(generatedDocuments.projectId,projects.id)).innerJoin(clientContacts,and(eq(clientContacts.clientId,projects.clientId),eq(clientContacts.userId,user.id))).orderBy(desc(generatedDocuments.createdAt)); return <PortalShell role={user.role}><div className="content"><section className="page-heading"><div><p className="eyebrow">RECORDS</p><h1>Documents</h1><p className="lead">Signed and immutable document versions for your workspace.</p></div></section>{rows.length?<section className="record-list">{rows.map((d)=><div className="record-row" key={d.id}><span><b>{d.kind}</b><small>{d.templateVersion} · {d.createdAt.toLocaleDateString()}</small></span><em className="status status-success">{d.acceptedAt?"accepted":"available"}</em><a className="button button-quiet" href={`/api/documents/${d.id}/download`}>Download PDF</a></div>)}</section>:<EmptyState page={page}/>}</div></PortalShell> }
  if (section === "settings") return <PortalShell role={user.role}><div className="content"><section className="page-heading"><div><p className="eyebrow">ACCOUNT</p><h1>Settings</h1><p className="lead">Manage your profile, language, and current session.</p></div></section><AccountSettings name={user.name} locale={user.locale}/></div></PortalShell>;
  const Icon = page.icon;
  return <PortalShell role={user.role}><div className="content"><section className="page-heading"><div><p className="eyebrow">WORKSPACE</p><h1>{page.title}</h1><p className="lead">{page.copy}</p></div></section><section className="empty-state"><span className="document-icon"><Icon size={22}/></span><h2>No records yet</h2><p>Records shared with your workspace will appear here.</p></section></div></PortalShell>;
}

function EmptyState({ page }: { page: (typeof pages)[keyof typeof pages] }) {
  const Icon = page.icon;
  return <section className="empty-state"><span className="document-icon"><Icon size={22}/></span><h2>No records yet</h2><p>Your administrator will share records with this workspace when they are ready.</p></section>;
}
