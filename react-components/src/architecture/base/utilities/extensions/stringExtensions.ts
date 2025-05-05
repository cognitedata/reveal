/*!
 * Copyright 2024 Cognite AS
 */

export function isEmpty(value: string | null | undefined): boolean {
  return value === null || value === undefined || value.length === 0;
}

export function equalsIgnoreCase(value1: string, value2: string): boolean {
  return value1.toLowerCase() === value2.toLowerCase();
}

export function equalsIgnoreCaseAndSpace(value1: string, value2: string): boolean {
  return equalsIgnoreCase(value1.replace(' ', ''), value2.replace(' ', ''));
}

export function numberToString(value: number): string {
  // Sometimes the number comes out like this: 1.20000005 or 1.19999992 due to numeric precision limitations.
  // To get better rounded values, I wrote this myself: Multiply by some high integer and round it, then
  // convert to text, and insert the comma manually afterwards.

  // Small number get less accurate result in this algorithm, so use the default string conversion.
  if (Math.abs(value) < 0.001) {
    return `${value}`;
  }
  const sign = Math.sign(value);
  const rounded = Math.abs(Math.round(value * 1e5));
  let text = `${rounded}`;
  if (text.length === 1) {
    text = `${'0.0000'}${text}`;
  } else if (text.length === 2) {
    text = `${'0.000'}${text}`;
  } else if (text.length === 3) {
    text = `${'0.00'}${text}`;
  } else if (text.length === 4) {
    text = `${'0.0'}${text}`;
  } else if (text.length === 5) {
    text = `${'0.'}${text}`;
  } else if (text.length >= 6) {
    const i = text.length - 5;
    text = `${text.slice(0, i)}${'.'}${text.slice(i)}`;
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
