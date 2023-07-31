export const isNumberArray = (value: unknown): value is number[] => {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.every((item) => typeof item === 'number')
  );
};
