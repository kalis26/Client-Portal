/** Allocate inside a SERIALIZABLE DB transaction, locking the yearly counter row. */
export function publicId(prefix: "CL" | "PRJ" | "INV", sequence: number, year = new Date().getUTCFullYear()) {
  return `${prefix}-${year}-${String(sequence).padStart(4, "0")}`;
}
