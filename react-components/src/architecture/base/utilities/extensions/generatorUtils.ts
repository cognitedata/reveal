/*!
 * Copyright 2025 Cognite AS
 */

export function count<T>(iterable: Generator<T>, predicate?: (t: T) => boolean): number {
  let count = 0;
  for (const item of iterable) {
    if (predicate === undefined || predicate(item)) {
      count++;
    }
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
