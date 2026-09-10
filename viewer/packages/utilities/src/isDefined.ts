/*!
 * Copyright 2025 Cognite AS
 */
export function isDefined<T>(value: T | undefined | null): value is T {
  return value !== undefined && value !== null;
}
