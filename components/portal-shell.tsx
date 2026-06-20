"use client";

import { Bell, ChevronDown, FileText, FolderOpen, LayoutDashboard, Menu, MessagesSquare, ReceiptText, Settings, UsersRound, X } from "lucide-react";
import { useState } from "react";
import { ThemeToggle } from "./theme-toggle";

const clientNav = [
  [LayoutDashboard, "Overview"], [FolderOpen, "Project"], [FileText, "Documents"], [ReceiptText, "Invoices"], [FolderOpen, "Files"], [MessagesSquare, "Messages"], [Settings, "Settings"],
] as const;

export function PortalShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return <div className="app-shell">
    <aside className={`sidebar ${open ? "sidebar-open" : ""}`}>
      <div className="brand"><span className="brand-mark">A</span><span>atelier</span><button className="mobile-close icon-button" onClick={() => setOpen(false)} aria-label="Close navigation"><X size={18}/></button></div>
      <div className="workspace"><span className="avatar">NB</span><span><b>Nord & Bloom</b><small>Client workspace</small></span><ChevronDown size={15}/></div>
      <nav aria-label="Client navigation">
        <p className="nav-label">Workspace</p>
        {clientNav.map(([Icon, label], index) => <a key={label} className={`nav-link ${index === 0 ? "active" : ""}`} href="#"><Icon size={17}/><span>{label}</span>{label === "Invoices" && <em>1</em>}</a>)}
      </nav>
      <div className="sidebar-footer"><UsersRound size={15}/><span>Need help? <a href="mailto:aminera2006@gmail.com">Contact Amine</a></span></div>
    </aside>
    {open && <button className="backdrop" aria-label="Close navigation" onClick={() => setOpen(false)} />}
    <main className="main"><header className="topbar"><button className="mobile-menu icon-button" aria-label="Open navigation" onClick={() => setOpen(true)}><Menu size={18}/></button><div className="crumb"><span>Client portal</span><b>/</b><strong>Overview</strong></div><div className="top-actions"><button className="icon-button" aria-label="Notifications"><Bell size={17}/><i /></button><ThemeToggle/><button className="profile"><span className="avatar">NB</span><ChevronDown size={15}/></button></div></header>{children}</main>
  </div>;
}
