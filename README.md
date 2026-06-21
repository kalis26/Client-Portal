# Rezo client portal

## Deployment

Deploy with Vercel. Set `APP_URL` to the Vercel production URL and configure Neon, Gmail SMTP, PayPal, Blob, `DOCUMENT_ENCRYPTION_KEY`, `RATE_LIMIT_SALT`, and `ADMIN_EMAILS` in Vercel Environment Variables. Keep PayPal Sandbox in Preview and use Live credentials only in Production.

Before public launch, configure Vercel Firewall rate limits for `/api/auth/*` and `/api/inquiries`.
