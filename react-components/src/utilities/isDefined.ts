export function isDefined<T>(element: T | undefined): element is T {
  return element !== undefined;
}
