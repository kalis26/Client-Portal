import { sql } from "drizzle-orm";
import { db } from "@/lib/db";

export type PublicPrefix = "CL" | "PRJ" | "INV";

/** A single UPSERT is atomic, so concurrent project creation cannot reuse a public reference. */
export async function allocatePublicId(prefix: PublicPrefix, year = new Date().getUTCFullYear()) {
  const result = await db.execute<{ value: number }>(sql`
    insert into public_counters (prefix, year, value)
    values (${prefix}, ${year}, 1)
    on conflict (prefix, year) do update set value = public_counters.value + 1
    returning value
  `);
  const value = result.rows[0]?.value;
  if (!value) throw new Error("Could not allocate public reference.");
  return `${prefix}-${year}-${String(value).padStart(4, "0")}`;
}
