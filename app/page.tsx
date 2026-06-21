import { PortalShell } from "@/components/portal-shell";
import { Dashboard } from "@/components/dashboard";
import { requireUser } from "@/lib/authz";

export default async function Home() {
  await requireUser();
  return <PortalShell><Dashboard /></PortalShell>;
}
