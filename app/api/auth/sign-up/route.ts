import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword } from "@/lib/passwords";
import { issueEmailToken } from "@/lib/email-tokens";
import { accountEmail, sendAccountEmail, smtpConfigured } from "@/lib/mailer";
import { allowAttempt } from "@/lib/rate-limit";

const input = z.object({ name: z.string().min(2).max(160), email: z.string().email(), password: z.string().min(12).max(128), acceptedTerms: z.literal(true) });
export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!(await allowAttempt("signup", ip, 5, 15 * 60_000))) return NextResponse.json({ error: "Unable to complete signup." }, { status: 429 });
  const parsed = input.safeParse(await request.json()); if (!parsed.success || !smtpConfigured()) return NextResponse.json({ error: "Unable to complete signup." }, { status: 400 });
  const email = parsed.data.email.toLowerCase(); const exists = await db.query.users.findFirst({ where: eq(users.email, email) });
  if (!exists) {
    const [user] = await db.insert(users).values({ name: parsed.data.name, email, passwordHash: await hashPassword(parsed.data.password), status: "pending_verification" }).returning();
    const token = await issueEmailToken(user.id, "verify_email"); const copy = accountEmail("verify", token, user.locale);
    await sendAccountEmail({ to: email, subject: copy.subject, html: `<p>${copy.body}</p><p><a href="${copy.href}">Continue</a></p>` });
  }
  return NextResponse.json({ received: true }, { status: 202 });
}
