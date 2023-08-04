export type ExactlyOnePartial<T> = {
  [K in keyof T]: {
    [P in K]: Partial<T[K]>;
  } & {
    [P in keyof Omit<T, K>]?: never;
  };
}[keyof T];
