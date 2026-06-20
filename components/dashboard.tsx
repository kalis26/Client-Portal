import { ArrowUpRight, CheckCircle2, ChevronRight, Clock3, CreditCard, Download, FileCheck2, Upload } from "lucide-react";

const documents = [
  { name: "Project agreement", ref: "AGR-2026-0004", state: "Accepted", icon: FileCheck2 },
  { name: "Client onboarding guide", ref: "PACK-2026-0004", state: "Ready", icon: Download },
];

export function Dashboard() {
  return <div className="content">
    <section className="page-heading"><div><p className="eyebrow">NORD & BLOOM / PROJECT 2026-0004</p><h1>Good afternoon, Nora.</h1><p className="lead">Everything for your new website, in one considered place.</p></div><button className="button button-secondary"><Upload size={16}/> Upload project files</button></section>
    <section className="project-banner"><div className="project-index">01</div><div className="project-copy"><p className="eyebrow">Active project</p><h2>Nord & Bloom website</h2><p>We are preparing your approved structure for build.</p></div><div className="progress"><span>Project progress</span><b>32%</b><div><i style={{ width: "32%" }}/></div></div><button className="button button-quiet">View project <ChevronRight size={16}/></button></section>
    <section className="dashboard-grid">
      <div className="main-column"><div className="section-title"><div><p className="eyebrow">NEXT STEP</p><h2>Your deposit is ready</h2></div><a href="#">View invoices <ArrowUpRight size={14}/></a></div>
        <article className="invoice-row"><div className="invoice-icon"><CreditCard size={20}/></div><div><b>Deposit invoice</b><p>INV-2026-0001 · Due 27 June 2026</p></div><strong>€240.00</strong><span className="status status-warning"><Clock3 size={13}/> Awaiting payment</span><button className="button">Pay invoice <ArrowUpRight size={15}/></button></article>
        <div className="section-title space-top"><div><p className="eyebrow">DOCUMENTS</p><h2>Your project records</h2></div><a href="#">View all <ArrowUpRight size={14}/></a></div>
        <div className="document-list">{documents.map(({ name, ref, state, icon: Icon }) => <div className="document-row" key={name}><span className="document-icon"><Icon size={18}/></span><span className="document-name"><b>{name}</b><small>{ref} · French</small></span><span className="status status-success"><CheckCircle2 size={13}/>{state}</span><button className="text-button">Open <ChevronRight size={16}/></button></div>)}</div>
      </div>
      <aside className="side-column"><section className="note-panel"><p className="eyebrow">HOW WE WORK</p><h2>One decision at a time.</h2><p>Send consolidated feedback at each review stage. It keeps the project moving and protects the delivery date.</p><a href="#">Read the project guide <ArrowUpRight size={14}/></a></section><section className="timeline"><p className="eyebrow">ACTIVITY</p><div><span className="timeline-dot complete"/><p><b>Agreement accepted</b><small>20 June, 14:12</small></p></div><div><span className="timeline-dot current"/><p><b>Deposit invoice issued</b><small>20 June, 14:15</small></p></div><div><span className="timeline-dot"/><p><b>Kickoff opens after payment</b><small>Next</small></p></div></section></aside>
    </section>
  </div>;
}
