import { expect, it } from "vitest";
import { generateSecret } from "../src/secret";
it("generates unique digits with an injected random source, including leading zero", () => {
  expect(generateSecret(4, 10, () => 0)).toBe("0123");
  expect(generateSecret(2, 2, () => 0.999)).toBe("10");
  expect(() => generateSecret(3, 2, () => 0)).toThrow();
});
