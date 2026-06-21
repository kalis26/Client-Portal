import { PortalShell } from "@/components/portal-shell";
import { SetupForm } from "@/components/setup-form";
import { requireAdmin } from "@/lib/authz";

export default async function SetupPage() {
  await requireAdmin();
  return <PortalShell><div className="content"><section className="page-heading"><div><p className="eyebrow">INITIAL ADMIN SETUP</p><h1>Create the first real project.</h1><p className="lead">This guarded one-time flow writes the client, project, and 20% deposit invoice to Neon. It stops working once a project exists.</p></div></section><section className="setup-card"><SetupForm /></section></div></PortalShell>;
}
