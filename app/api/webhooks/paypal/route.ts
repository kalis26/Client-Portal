import { NextRequest, NextResponse } from "next/server";

/** Verify the PayPal transmission signature before changing any invoice state. */
export async function POST(request: NextRequest) {
  const event = await request.json();
  const eventId = event.id as string | undefined;
  if (!eventId) return NextResponse.json({ error: "Missing webhook event ID" }, { status: 400 });
  // TODO: Call PayPal's verify-webhook-signature endpoint with PAYPAL_WEBHOOK_ID.
  // TODO: Persist eventId with a unique constraint before processing to make retries idempotent.
  // TODO: Transactionally mark the matching invoice paid, write payment + audit event, and unlock the project stage.
  return NextResponse.json({ received: true, eventId });
}
