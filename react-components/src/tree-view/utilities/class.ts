// eslint-disable-next-line @typescript-eslint/ban-types
export type Class<T> = Function & { prototype: T };

export function isInstanceOf<T>(value: unknown, classType: Class<T>): value is T {
  return value instanceof classType;
}
