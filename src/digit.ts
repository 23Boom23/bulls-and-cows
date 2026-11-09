export const DIGITS = '0123456789abcdef';
export const createDigitValidator = (base: number) => (char: string): boolean =>
  char.length === 1 && DIGITS.slice(0, base).includes(char.toLowerCase());
