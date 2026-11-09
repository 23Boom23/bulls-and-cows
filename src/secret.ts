import { DIGITS } from './digit.js';
export const generateSecret = (length: number, base: number, random = Math.random): string => {
  if (!Number.isInteger(base) || base < 2 || base > DIGITS.length || !Number.isInteger(length) || length < 1 || length > base) throw new RangeError('Invalid length or base');
  const available = [...DIGITS.slice(0, base)];
  return Array.from({ length }, () => available.splice(Math.floor(random() * available.length), 1)[0]).join('');
};
