import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not configured.");
const sql = neon(process.env.DATABASE_URL);
const [{ now, database }] = await sql`select now() as now, current_database() as database`;
console.log(`Neon connection verified: ${database} at ${now}`);
