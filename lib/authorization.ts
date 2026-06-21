import { and, eq } from "drizzle-orm";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { clientContacts, clients, invoices, projects } from "@/lib/db/schema";

export async function mayAccessInvoice(invoiceId: string) {
  const user = await currentUser(); if (!user || user.status !== "active") return false;
  if (user.role === "admin") return true;
  const row = await db.select({ id: invoices.id }).from(invoices).innerJoin(projects, eq(invoices.projectId, projects.id)).innerJoin(clients, eq(projects.clientId, clients.id)).innerJoin(clientContacts, and(eq(clientContacts.clientId, clients.id), eq(clientContacts.userId, user.id))).where(eq(invoices.id, invoiceId)).limit(1);
  return Boolean(row[0]);
}
