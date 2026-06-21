import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";

export async function requireUser() { const user = await currentUser(); if (!user || user.status !== "active") redirect("/sign-in"); return user; }
export async function requireAdmin() { const user = await requireUser(); if (user.role !== "admin") redirect("/"); return user; }
