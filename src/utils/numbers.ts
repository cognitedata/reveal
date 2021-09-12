/**
 * Modulo operator (% is remainder and doesn't "wrap" negative numbers)
 */
export function modulo(n: number, m: number) {
  return ((n % m) + m) % m;
}

export function formatNumberForDisplay(value: number, decimals?: number) {
  const decimalPoints = typeof decimals === 'number' ? decimals : Infinity;
  return Number(value).toFixed(decimalPoints);
}
