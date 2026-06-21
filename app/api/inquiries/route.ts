import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { inquiries } from "@/lib/db/schema";
import { allowAttempt } from "@/lib/rate-limit";

const inquirySchema = z.object({ name: z.string().min(2).max(160), email: z.string().email(), company: z.string().max(255).optional(), message: z.string().min(20).max(5000) });

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!(await allowAttempt("inquiry", ip, 5, 15 * 60_000))) return NextResponse.json({ error: "Unable to submit inquiry." }, { status: 429 });
  const parsed = inquirySchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Please provide your name, email, and a short project description." }, { status: 400 });
  await db.insert(inquiries).values({ ...parsed.data, email: parsed.data.email.toLowerCase() });
  return NextResponse.json({ received: true }, { status: 201 });
}
