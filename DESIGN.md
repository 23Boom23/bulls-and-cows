# Design

## Data and algorithms

The round is an immutable `Game` object: its settings, secret, start time, win status and an array of guesses. Each guess is an object containing the input and its bulls and cows. Submitting a guess creates a new array and state object; earlier entries are never mutated. Records are plain objects in a separate array, sorted by attempts and then elapsed seconds, and persisted in localStorage with the length and base displayed for each entry.

`generateSecret` samples without replacement from the digit alphabet, using the injected random source. A string preserves a leading zero. `evaluateGuess` normalizes both strings, counts matching positions with `filter`, then counts all input digits found in the secret and subtracts bulls. Guesses and secrets have unique digits. `countPossibleSecrets` uses the recurrence P(b, n) = b × P(b − 1, n − 1), with P(b, 0) = 1. A map caches each pair of arguments.

## Complexity

Let n be the secret length and b the size of the alphabet.

- `generateSecret`: O(b + n × b) time due to copying the alphabet and removing each selected digit from an array; O(b + n) space.
- `evaluateGuess`: O(n²) time because each input digit searches the target array; O(n) space for normalized arrays. The game limits n to six.
- `isValidGuess`: O(n × b) time because each digit is checked against the alphabet, and O(n + b) space for the normalized input, set and validator's substring.
- `countPossibleSecrets`: O(n) time and O(n) recursion/cache space on a cold call, O(1) time for a cached pair. Cache space accumulates over distinct pairs.

## Clean code

- Small named functions isolate responsibilities: `isValidGuess` validates, while `evaluateGuess` scores, without DOM or storage dependencies.
- `createDigitValidator` provides one rule shared by validation and input filtering, avoiding divergent definitions of a digit.
- `generateSecret` injects randomness so its behavior can be tested deterministically.
- `main.ts` keeps rendering and browser effects at the edge; immutable state updates make previous attempts predictable.
