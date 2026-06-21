import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { consumeEmailToken } from "@/lib/email-tokens";
import { eq } from "drizzle-orm";
export async function GET(request: NextRequest) { const token = request.nextUrl.searchParams.get("token"); if (!token) return NextResponse.redirect(new URL("/sign-in?verified=invalid", request.url)); const record = await consumeEmailToken(token, "verify_email"); if (!record) return NextResponse.redirect(new URL("/sign-in?verified=invalid", request.url)); await db.update(users).set({ status: "active", emailVerified: new Date() }).where(eq(users.id, record.userId)); return NextResponse.redirect(new URL("/sign-in?verified=1", request.url)); }
