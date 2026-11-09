import { expect, it } from 'vitest';
import { countPossibleSecrets } from '../src/count';
it('counts permutations including leading zero and caches results', () => {
  expect(countPossibleSecrets(0, 2)).toBe(1);
  expect(countPossibleSecrets(2, 2)).toBe(2);
  expect(countPossibleSecrets(4, 10)).toBe(5040);
  expect(countPossibleSecrets(4, 10)).toBe(5040);
  expect(countPossibleSecrets(3, 2)).toBe(0);
});
