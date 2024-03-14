/*!
 * Copyright 2024 Cognite AS
 */
export function isDefined<T>(element: T | undefined): element is T {
  return element !== undefined;
}
