import { env } from "@/lib/env";

const baseUrl = process.env.PAYPAL_ENV === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";
type PayPalOrder = { id: string; status: string; links: Array<{ href: string; rel: string; method: string }> };

async function accessToken() {
  const credentials = Buffer.from(`${env.PAYPAL_CLIENT_ID}:${env.PAYPAL_CLIENT_SECRET}`).toString("base64");
  const response = await fetch(`${baseUrl}/v1/oauth2/token`, { method: "POST", headers: { Authorization: `Basic ${credentials}`, "Content-Type": "application/x-www-form-urlencoded" }, body: "grant_type=client_credentials", cache: "no-store" });
  if (!response.ok) throw new Error("PayPal authentication failed.");
  return (await response.json() as { access_token: string }).access_token;
}

export async function createPayPalOrder(input: { invoiceId: string; publicInvoiceId: string; amount: string; currency: string; returnUrl: string; cancelUrl: string }) {
  const token = await accessToken();
  const response = await fetch(`${baseUrl}/v2/checkout/orders`, { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", "PayPal-Request-Id": `invoice-${input.invoiceId}` }, body: JSON.stringify({ intent: "CAPTURE", purchase_units: [{ reference_id: input.publicInvoiceId, custom_id: input.invoiceId, amount: { currency_code: input.currency, value: input.amount } }], application_context: { return_url: input.returnUrl, cancel_url: input.cancelUrl, user_action: "PAY_NOW" } }), cache: "no-store" });
  if (!response.ok) throw new Error("PayPal order creation failed.");
  return await response.json() as PayPalOrder;
}

export async function verifyPayPalWebhook(headers: Headers, event: unknown) {
  const token = await accessToken();
  const response = await fetch(`${baseUrl}/v1/notifications/verify-webhook-signature`, { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify({ auth_algo: headers.get("paypal-auth-algo"), cert_url: headers.get("paypal-cert-url"), transmission_id: headers.get("paypal-transmission-id"), transmission_sig: headers.get("paypal-transmission-sig"), transmission_time: headers.get("paypal-transmission-time"), webhook_id: env.PAYPAL_WEBHOOK_ID, webhook_event: event }), cache: "no-store" });
  if (!response.ok) return false;
  return (await response.json() as { verification_status: string }).verification_status === "SUCCESS";
}
