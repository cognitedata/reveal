type NonUndefined<T> = {
  [K in keyof T as T[K] extends undefined ? never : K]: T[K];
};

const filterNotUndefinedValues = <T extends Record<string, unknown>>(
  obj: T
): NonUndefined<T> => {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, value]) => value !== undefined)
  ) as NonUndefined<T>;
};

export default filterNotUndefinedValues;
