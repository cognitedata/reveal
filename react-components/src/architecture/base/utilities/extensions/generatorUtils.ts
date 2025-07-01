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

export function* filter<T>(iterable: Generator<T>, predicate: (t: T) => boolean): Generator<T> {
  for (const item of iterable) {
    if (predicate(item)) {
      yield item;
    }
  }
}

export function* map<T, U>(iterable: Generator<T>, func: (t: T) => U): Generator<U> {
  for (const item of iterable) {
    yield func(item);
  }
}
