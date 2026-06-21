import { NextResponse } from "next/server";
import { revokeCurrentSession } from "@/lib/auth";
export async function POST() { const response = NextResponse.json({ ok: true }); await revokeCurrentSession(response); return response; }
