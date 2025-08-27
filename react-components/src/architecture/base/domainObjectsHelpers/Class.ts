// eslint-disable-next-line @typescript-eslint/ban-types
export type Class<T> = Function & { prototype: T };

export function isInstanceOf<T>(value: any, classType: Class<T>): value is T {
  return value instanceof classType;
}
