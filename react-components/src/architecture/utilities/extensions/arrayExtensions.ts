/*!
 * Copyright 2024 Cognite AS
 */

export function clear<T>(array: T[]): void {
  array.splice(0, array.length);
}

export function removeAt<T>(array: T[], index: number): void {
  array.splice(index, 1);
}

export function remove<T>(array: T[], element: T): void {
  const index = array.indexOf(element);
  if (index >= 0) {
    removeAt(array, index);
  }
}
