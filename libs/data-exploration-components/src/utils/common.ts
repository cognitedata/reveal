export const isNotUndefined = <T>(value: T | undefined): value is T =>
  value !== undefined;

export const sleep = (milliseconds: number) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));
