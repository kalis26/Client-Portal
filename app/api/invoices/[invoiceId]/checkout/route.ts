import { NextRequest, NextResponse } from "next/server";
import { mayAccessInvoice } from "@/lib/authorization";
import { beginPayPalInvoicePayment } from "@/lib/billing";

export async function POST(request: NextRequest, { params }: { params: Promise<{ invoiceId: string }> }) {
  const { invoiceId } = await params;
  if (!(await mayAccessInvoice(invoiceId))) return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  try { return NextResponse.json(await beginPayPalInvoicePayment({ invoiceId, origin: request.nextUrl.origin })); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Checkout could not be started." }, { status: 400 }); }
}
