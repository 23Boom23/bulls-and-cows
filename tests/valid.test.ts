import { expect, it } from "vitest";
import { isValidGuess } from "../src/valid";
it("requires the correct length and unique valid digits, ignoring case", () => {
  expect(isValidGuess("0AbF", 4, 16)).toBe(true);
  expect(isValidGuess("aA", 2, 16)).toBe(false);
  expect(isValidGuess("02", 2, 2)).toBe(false);
  expect(isValidGuess("01", 3, 10)).toBe(false);
});
