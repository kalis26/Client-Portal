import nodemailer from "nodemailer";

const appUrl = () => process.env.APP_URL ?? "http://localhost:3000";
export const smtpConfigured = () => Boolean(process.env.SMTP_USER && process.env.SMTP_PASSWORD && process.env.SMTP_FROM);

export async function sendAccountEmail(input: { to: string; subject: string; html: string }) {
  if (!smtpConfigured()) throw new Error("Email delivery is not configured.");
  const transport = nodemailer.createTransport({ host: process.env.SMTP_HOST ?? "smtp.gmail.com", port: Number(process.env.SMTP_PORT ?? 465), secure: process.env.SMTP_SECURE !== "false", auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD } });
  await transport.sendMail({ from: process.env.SMTP_FROM, to: input.to, subject: input.subject, html: input.html });
}

export async function sendProjectEmail(input:{to:string;subject:string;html:string;attachments:Array<{filename:string;content:Uint8Array;contentType:string}>}){if(!smtpConfigured())throw new Error("Email delivery is not configured.");const transport=nodemailer.createTransport({host:process.env.SMTP_HOST??"smtp.gmail.com",port:Number(process.env.SMTP_PORT??465),secure:process.env.SMTP_SECURE!=="false",auth:{user:process.env.SMTP_USER,pass:process.env.SMTP_PASSWORD}});await transport.sendMail({from:process.env.SMTP_FROM,to:input.to,subject:input.subject,html:input.html,attachments:input.attachments.map(a=>({filename:a.filename,content:Buffer.from(a.content),contentType:a.contentType}))})}

export function accountEmail(kind: "verify" | "reset" | "invite", token: string, locale = "fr") {
  const href = kind === "verify" ? `${appUrl()}/api/auth/verify?token=${encodeURIComponent(token)}` : kind === "invite" ? `${appUrl()}/accept-invitation?token=${encodeURIComponent(token)}` : `${appUrl()}/reset-password?token=${encodeURIComponent(token)}`;
  const isFrench = locale === "fr";
  return { href, subject: isFrench ? (kind === "verify" ? "Vérifiez votre adresse e-mail" : kind === "invite" ? "Invitation à votre espace Rezo" : "Réinitialisez votre mot de passe") : (kind === "verify" ? "Verify your email address" : kind === "invite" ? "Invitation to your Rezo workspace" : "Reset your password"), body: isFrench ? (kind === "invite" ? "Créez votre mot de passe pour accéder à votre espace client." : kind === "verify" ? "Confirmez votre adresse pour activer votre espace client." : "Utilisez ce lien pour définir un nouveau mot de passe.") : (kind === "invite" ? "Create your password to access your client workspace." : kind === "verify" ? "Confirm your email to activate your client account." : "Use this link to set a new password.") };
}
