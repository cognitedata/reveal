/*!
 * Copyright 2024 Cognite AS
 */
export function filterUndefined<T>(array: Array<T | undefined>): T[] {
  return array.filter((item): item is T => item !== undefined);
}
