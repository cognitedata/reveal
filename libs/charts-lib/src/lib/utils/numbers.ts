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

export const formatNumberWithSuffix = (num: number, digits: number): string => {
  const absNum = Math.abs(num);
  const sign = Math.sign(num);

  let formattedNumber: string;
  let suffix = '';

  if (absNum >= 1.0e9) {
    formattedNumber = (sign * (absNum / 1.0e9)).toFixed(digits);
    suffix = 'b';
  } else if (absNum >= 1.0e6) {
    formattedNumber = (sign * (absNum / 1.0e6)).toFixed(digits);
    suffix = 'm';
  } else if (absNum >= 1.0e3) {
    formattedNumber = (sign * (absNum / 1.0e3)).toFixed(digits);
    suffix = 'k';
  } else {
    formattedNumber = num.toFixed(digits);
  }

  // Remove unnecessary trailing zeros and decimal point
  formattedNumber = parseFloat(formattedNumber).toString();

  return formattedNumber + suffix;
};
