export function isEmpty(value: string | null | undefined): boolean {
  return value === null || value === undefined || value.length === 0;
}

export function equalsIgnoreCase(value1: string, value2: string): boolean {
  return value1.toLowerCase() === value2.toLowerCase();
}

export function equalsIgnoreCaseAndSpace(value1: string, value2: string): boolean {
  return equalsIgnoreCase(value1.replace(' ', ''), value2.replace(' ', ''));
}

/**
 * Converts a number to a string representation with improved rounding precision.
 *
 * This function addresses numeric precision issues where numbers like `1.20000005` or `1.19999992`
 * may appear due to floating-point arithmetic. It rounds the number to a fixed precision and formats
 * it as a string, ensuring a clean and accurate representation.
 *
 * - For very small numbers (absolute value less than 0.001), the default string conversion is used.
 * - For other numbers, the value is multiplied by `1e5`, rounded, and formatted with a decimal point
 *   inserted at the appropriate position.
 * - Trailing zeros and unnecessary decimal points are removed for a cleaner output.
 * - Negative numbers are handled by preserving the negative sign.
 *
 * @param value - The numeric value to convert to a string.
 * @returns A string representation of the number with improved precision and formatting.
 */
export function numberToString(value: number): string {
  const sign = Math.sign(value);
  const rounded = Math.abs(Math.round(value * 1e5));
  let text = `${rounded}`;
  if (text.length === 3) {
    text = `${'0.00'}${text}`;
  } else if (text.length === 4) {
    text = `${'0.0'}${text}`;
  } else if (text.length === 5) {
    text = `${'0.'}${text}`;
  } else if (text.length >= 6) {
    const i = text.length - 5;
    text = `${text.slice(0, i)}${'.'}${text.slice(i)}`;
  } else {
    return `${value}`;
  }
  // Since we know that the comma are there,
  // we can safely remove trailing zeros
  while (text[text.length - 1] === '0') {
    text = text.slice(0, -1);
  }
  // Remove if last is a comma
  if (text[text.length - 1] === '.') {
    text = text.slice(0, -1);
  }
  // Put the negative sign in the front
  if (sign < 0) {
    text = `${'-'}${text}`;
  }
  return text;
}
