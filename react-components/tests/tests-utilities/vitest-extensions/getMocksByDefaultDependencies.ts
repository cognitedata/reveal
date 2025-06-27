import { vi, type Mock } from 'vitest';

type Prettify<T> = {
  [K in keyof T]: T[K];
} & NonNullable<unknown>;

type MockDependencies<T> = Prettify<{
  [P in keyof T as T[P] extends (...args: any[]) => any ? P : never]: T[P] extends (
    ...args: any[]
  ) => any
    ? Mock<T[P]>
    : never;
}>;

export function getMocksByDefaultDependencies<T extends Record<string, any>>(
  defaultDependencies: T
): MockDependencies<T> {
  const entries = Object.entries(defaultDependencies).map(([key]) => {
    return [key, vi.fn()] as const;
  });
  return Object.fromEntries(entries) as MockDependencies<T>;
}
