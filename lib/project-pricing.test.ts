import { describe, expect, it } from "vitest";
import { depositItems, depositTotal, projectTotal } from "./project-pricing";

describe("project pricing", () => {
  it("derives the total and exact 20% deposit from service items", () => {
    const items = [{ description: "Design", quantity: 1, unitAmount: "999.99" }, { description: "Build", quantity: 2, unitAmount: "250.00" }];
    expect(projectTotal(items)).toBe("1499.99");
    expect(depositTotal(items)).toBe("300.00");
    expect(depositItems(items).reduce((sum, item) => sum + Number(item.lineAmount), 0).toFixed(2)).toBe("300.00");
  });
});
