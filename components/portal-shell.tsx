"use client";

import Link from "next/link";
import { Bell, ChevronDown, FileText, FolderOpen, LayoutDashboard, Menu, MessagesSquare, ReceiptText, Settings, UsersRound, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ThemeToggle } from "./theme-toggle";

const clientNav = [
  [LayoutDashboard, "Overview", "/"], [FolderOpen, "Project", "/project"], [FileText, "Documents", "/documents"], [ReceiptText, "Invoices", "/invoices"], [FolderOpen, "Files", "/files"], [MessagesSquare, "Messages", "/messages"], [Settings, "Settings", "/settings"],
] as const;

export function PortalShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const active = clientNav.find(([, , href]) => href === pathname)?.[1] ?? "Overview";
  return <div className="app-shell">
    <aside className={`sidebar ${open ? "sidebar-open" : ""}`}>
      <Link className="brand" href="/"><span className="brand-mark">A</span><span>atelier</span><button className="mobile-close icon-button" onClick={(event) => { event.preventDefault(); setOpen(false); }} aria-label="Close navigation"><X size={18}/></button></Link>
      <Link className="workspace" href="/project"><span className="avatar">AP</span><span><b>Client workspace</b><small>Projects & records</small></span><ChevronDown size={15}/></Link>
      <nav aria-label="Client navigation">
        <p className="nav-label">Workspace</p>
        {clientNav.map(([Icon, label, href]) => <Link key={label} className={`nav-link ${href === pathname ? "active" : ""}`} href={href} onClick={() => setOpen(false)}><Icon size={17}/><span>{label}</span></Link>)}
      </nav>
      <div className="sidebar-footer"><UsersRound size={15}/><span>Need help? <a href="mailto:aminera2006@gmail.com">Contact Amine</a></span></div>
    </aside>
    {open && <button className="backdrop" aria-label="Close navigation" onClick={() => setOpen(false)} />}
    <main className="main"><header className="topbar"><button className="mobile-menu icon-button" aria-label="Open navigation" onClick={() => setOpen(true)}><Menu size={18}/></button><div className="crumb"><span>Client portal</span><b>/</b><strong>{active}</strong></div><div className="top-actions"><Link className="icon-button" href="/messages" aria-label="Messages"><Bell size={17}/></Link><ThemeToggle/><Link className="profile" href="/settings" aria-label="Settings"><span className="avatar">AP</span><ChevronDown size={15}/></Link></div></header>{children}</main>
  </div>;
}
