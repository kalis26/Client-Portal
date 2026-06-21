import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { invoices, payments, projects } from "@/lib/db/schema";
import { createPayPalOrder } from "@/lib/paypal";

export async function beginPayPalInvoicePayment(input: { invoiceId: string; origin: string }) {
  const invoice = await db.query.invoices.findFirst({ where: eq(invoices.id, input.invoiceId) });
  if (!invoice) throw new Error("Invoice not found.");
  if (!["issued", "partially_paid"].includes(invoice.status)) throw new Error("This invoice is not payable.");
  const order = await createPayPalOrder({ invoiceId: invoice.id, publicInvoiceId: invoice.publicId, amount: invoice.amount, currency: invoice.currency, returnUrl: `${input.origin}/invoices/${invoice.id}?payment=returned`, cancelUrl: `${input.origin}/invoices/${invoice.id}?payment=cancelled` });
  await db.insert(payments).values({ invoiceId: invoice.id, method: "paypal", providerReference: order.id, amount: invoice.amount });
  const approveUrl = order.links.find((link) => link.rel === "approve")?.href;
  if (!approveUrl) throw new Error("PayPal did not provide an approval URL.");
  return { orderId: order.id, approveUrl };
}

export async function markPayPalOrderCaptured(orderId: string) {
  const payment = await db.query.payments.findFirst({ where: eq(payments.providerReference, orderId) });
  if (!payment || payment.confirmedAt) return;
  const invoice = await db.query.invoices.findFirst({ where: eq(invoices.id, payment.invoiceId) });
  if (!invoice) throw new Error("Invoice not found for PayPal payment.");
  await db.update(payments).set({ confirmedAt: new Date() }).where(eq(payments.id, payment.id));
  await db.update(invoices).set({ status: "paid", updatedAt: new Date() }).where(eq(invoices.id, payment.invoiceId));
  if (invoice.isDeposit) await db.update(projects).set({ status: "active", updatedAt: new Date() }).where(eq(projects.id, invoice.projectId));
}
