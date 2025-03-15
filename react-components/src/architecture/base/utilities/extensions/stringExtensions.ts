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
  const isSpace = (s: string): boolean => s === ' ';
  const { length: length1 } = value1;
  const { length: length2 } = value2;

  for (let i = 0, j = 0; i < length1; i++) {
    const char1 = value1.charAt(i);
    if (isSpace(char1)) {
      continue;
    }
    const lowerChar1 = char1.toLowerCase();
    let found = false;
    for (; j < length2; j++) {
      const char2 = value2.charAt(j);
      if (isSpace(char2)) {
        continue;
      }
      const lowerChar2 = char2.toLowerCase();
      if (lowerChar2 === lowerChar1) {
        j++;
        found = true;
        break;
      }
      return false;
    }
    if (!found) {
      return false;
    }
  }
  return true;
}
