import { describe, expect, it } from "vitest";
import { createDigitValidator } from "../src/digit";
describe("createDigitValidator", () => {
  it("accepts digits in the chosen base, case-insensitively", () => {
    const hex = createDigitValidator(16);
    expect(hex("A")).toBe(true);
    expect(hex("f")).toBe(true);
    expect(hex("g")).toBe(false);
    expect(hex("aa")).toBe(false);
    expect(createDigitValidator(2)("2")).toBe(false);
  });
});
