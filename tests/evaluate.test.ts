import { expect, it } from "vitest";
import { evaluateGuess } from "../src/evaluate";
it("counts bulls and cows without case sensitivity", () => {
  expect(evaluateGuess("01aF", "0fA1")).toEqual({ bulls: 2, cows: 2 });
  expect(evaluateGuess("0123", "4567")).toEqual({ bulls: 0, cows: 0 });
  expect(evaluateGuess("abcd", "ABCD")).toEqual({ bulls: 4, cows: 0 });
});
