import { expect, it } from "vitest";
import { countLabel } from "../src/words";

it("uses Russian forms for one, few, many and teens", () => {
  const forms = { one: "попытка", few: "попытки", many: "попыток" };
  expect(
    [1, 2, 5, 11, 21, 22].map((count) => countLabel(count, forms)),
  ).toEqual([
    "1 попытка",
    "2 попытки",
    "5 попыток",
    "11 попыток",
    "21 попытка",
    "22 попытки",
  ]);
});
