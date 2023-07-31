export const isStringsArray = (value: unknown): value is string[] => {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.every((item) => typeof item === 'string')
  );
};
