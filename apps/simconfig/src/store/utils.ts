// Type safe helper for updating state (replaces spread syntax)
export function partialUpdate<T>(state: T, newState: Partial<T>) {
  return Object.assign<T, Partial<T>>(state, newState);
}
