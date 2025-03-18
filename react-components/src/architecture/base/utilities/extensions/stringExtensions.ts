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
