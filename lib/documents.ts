import { createHash } from "crypto";

export type DocumentLocale = "fr" | "en";
export type ProjectDocument = { projectId: string; clientName: string; projectName: string; locale: DocumentLocale; templateVersion: string; scope: string; amount: string; currency: string };

/** HTML is intentionally separate from React UI and must be rendered in a server-only PDF worker. */
export function agreementHtml(data: ProjectDocument) {
  const copy = data.locale === "fr" ? { title: "Accord de prestation", scope: "Périmètre", total: "Montant du projet" } : { title: "Service agreement", scope: "Scope", total: "Project total" };
  return `<!doctype html><html lang="${data.locale}"><head><meta charset="utf-8"><style>body{font-family:Arial,sans-serif;color:#1e242d;padding:48px;line-height:1.5}h1{font-size:28px}dt{color:#5b6573;font-size:11px;text-transform:uppercase}dd{margin:3px 0 20px;font-weight:600}</style></head><body><h1>${copy.title}</h1><dl><dt>Client</dt><dd>${escapeHtml(data.clientName)}</dd><dt>Project</dt><dd>${escapeHtml(data.projectName)}</dd><dt>${copy.scope}</dt><dd>${escapeHtml(data.scope)}</dd><dt>${copy.total}</dt><dd>${escapeHtml(data.amount)} ${escapeHtml(data.currency)}</dd></dl></body></html>`;
}
export function documentHash(html: string) { return createHash("sha256").update(html).digest("hex"); }
function escapeHtml(value: string) { return value.replace(/[&<>'"]/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", "'":"&#39;", '"':"&quot;" }[c]!)); }
