import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { providerWebhookEvents } from "@/lib/db/schema";
import { markPayPalOrderCaptured } from "@/lib/billing";
import { verifyPayPalWebhook } from "@/lib/paypal";

export async function POST(request: NextRequest) {
  const event = await request.json() as { id?: string; event_type?: string; resource?: { supplementary_data?: { related_ids?: { order_id?: string } } } };
  if (!event.id || !event.event_type) return NextResponse.json({ error: "Malformed PayPal event" }, { status: 400 });
  if (!(await verifyPayPalWebhook(request.headers, event))) return NextResponse.json({ error: "Invalid PayPal signature" }, { status: 401 });

  const inserted = await db.insert(providerWebhookEvents).values({ provider: "paypal", eventId: event.id, eventType: event.event_type, payload: event }).onConflictDoNothing().returning({ id: providerWebhookEvents.id });
  if (!inserted.length) return NextResponse.json({ received: true, duplicate: true });

  if (event.event_type === "PAYMENT.CAPTURE.COMPLETED") {
    const orderId = event.resource?.supplementary_data?.related_ids?.order_id;
    if (orderId) await markPayPalOrderCaptured(orderId);
  }
  return NextResponse.json({ received: true });
}
