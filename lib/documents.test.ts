import { describe, expect, it } from "vitest";
import { agreementHtml, documentHash } from "./documents";

describe("immutable agreement source", () => {
  const source = { projectId: "project-1", clientName: "A < B", projectName: "Portal", locale: "en" as const, templateVersion: "v1", scope: "Build a secure portal", amount: "1200.00", currency: "EUR" };
  it("escapes user-controlled content before rendering", () => {
    expect(agreementHtml(source)).toContain("A &lt; B");
    expect(agreementHtml(source)).not.toContain("<dd>A < B</dd>");
  });
  it("has a stable SHA-256 source hash", () => {
    expect(documentHash(agreementHtml(source))).toMatch(/^[a-f0-9]{64}$/);
    expect(documentHash(agreementHtml(source))).toBe(documentHash(agreementHtml(source)));
  });
});
