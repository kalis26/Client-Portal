const required = ["PAYPAL_CLIENT_ID", "PAYPAL_CLIENT_SECRET"];
for (const key of required) if (!process.env[key]) throw new Error(`${key} is not configured.`);

const base = process.env.PAYPAL_ENV === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";
const auth = Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString("base64");
const response = await fetch(`${base}/v1/oauth2/token`, { method: "POST", headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/x-www-form-urlencoded" }, body: "grant_type=client_credentials" });
if (!response.ok) throw new Error(`PayPal credential check failed (${response.status}).`);
console.log(`PayPal ${process.env.PAYPAL_ENV === "live" ? "live" : "sandbox"} credentials verified.`);
