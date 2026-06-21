import chromium from "@sparticuz/chromium";
import { chromium as playwright } from "playwright-core";

export async function renderPdf(input: { html: string; filename: string }) {
  const browser = await playwright.launch({ args: chromium.args, executablePath: await chromium.executablePath(), headless: true });
  try { const page = await browser.newPage(); await page.setContent(input.html, { waitUntil: "networkidle" }); return new Uint8Array(await page.pdf({ format: "A4", printBackground: true, margin: { top: "18mm", right: "16mm", bottom: "18mm", left: "16mm" } })); }
  finally { await browser.close(); }
}
