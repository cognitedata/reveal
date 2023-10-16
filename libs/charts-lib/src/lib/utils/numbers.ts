/**
 * Modulo operator (% is remainder and doesn't "wrap" negative numbers)
 */
export function modulo(n: number, m: number) {
  return ((n % m) + m) % m;
}

export const roundToSignificantDigits = (
  value: number,
  significantDigits: number
) => {
  return Number(value.toPrecision(significantDigits));
};

export function formatValueForDisplay(value?: number, significantDigits = 3) {
  return typeof value === 'number' && !Number.isNaN(value)
    ? roundToSignificantDigits(value, significantDigits).toString()
    : '-';
}
