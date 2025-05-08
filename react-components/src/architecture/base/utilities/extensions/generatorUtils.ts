/*!
 * Copyright 2025 Cognite AS
 */

export function count<T>(iterable: Generator<T>): number {
  let count = 0;
  for (const _item of iterable) {
    count++;
  }
  return count;
}

export function last<T>(iterable: Generator<T>): T | undefined {
  let lastItem: T | undefined;
  for (const item of iterable) {
    lastItem = item;
  }
  return lastItem;
}

export function first<T>(iterable: Generator<T>): T | undefined {
  return iterable.next().value;
}
