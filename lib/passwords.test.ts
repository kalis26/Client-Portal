import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "./passwords";
describe("passwords", () => {
  it("verifies the submitted password only", async () => { const hash = await hashPassword("correct horse battery staple"); await expect(verifyPassword(hash, "correct horse battery staple")).resolves.toBe(true); await expect(verifyPassword(hash, "incorrect password")).resolves.toBe(false); });
});
