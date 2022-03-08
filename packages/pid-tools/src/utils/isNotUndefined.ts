function isNotUndefined<T>(value: T | undefined): value is T {
  return value !== undefined;
}

export default isNotUndefined;
