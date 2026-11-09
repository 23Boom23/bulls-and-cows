import { createDigitValidator } from './digit.js';
export const isValidGuess = (guess: string, length: number, base: number): boolean => {
  const digits = [...guess.toLowerCase()];
  return digits.length === length && new Set(digits).size === length && digits.every(createDigitValidator(base));
};
