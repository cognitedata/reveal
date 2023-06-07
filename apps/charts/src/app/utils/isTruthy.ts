function isTruthy<T>(item: T | undefined | null | false): item is T {
  return Boolean(item);
}

export default isTruthy;
