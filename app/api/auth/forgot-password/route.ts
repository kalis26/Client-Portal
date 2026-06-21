import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { issueEmailToken } from "@/lib/email-tokens";
import { accountEmail, sendAccountEmail, smtpConfigured } from "@/lib/mailer";
import { allowAttempt } from "@/lib/rate-limit";
const input = z.object({ email: z.string().email(), turnstileToken: z.string().optional() });
export async function POST(request: NextRequest) { const body = await request.json().catch(() => ({})); const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"; if (!(await allowAttempt("forgot_password", ip, 5, 15 * 60_000))) return NextResponse.json({ received: true }, { status: 202 }); const parsed = input.safeParse(body); if (parsed.success && smtpConfigured()) { const user = await db.query.users.findFirst({ where: eq(users.email, parsed.data.email.toLowerCase()) }); if (user?.status === "active") { const token = await issueEmailToken(user.id, "reset_password"); const copy = accountEmail("reset", token, user.locale); await sendAccountEmail({ to: user.email, subject: copy.subject, html: `<p>${copy.body}</p><p><a href="${copy.href}">Continue</a></p>` }); } } return NextResponse.json({ received: true }, { status: 202 }); }
