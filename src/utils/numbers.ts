/**
 * Modulo operator (% is remainder and doesn't "wrap" negative numbers)
 */
export function modulo(n: number, m: number) {
  return ((n % m) + m) % m;
}
