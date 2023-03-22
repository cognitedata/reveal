export type ExactlyOneKey<T> = {
  [K in keyof T]: {
    [P in K]: T[K];
  } & {
    [P in keyof Omit<T, K>]?: never;
  };
}[keyof T];
