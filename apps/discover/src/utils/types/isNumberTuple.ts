export const isNumberTuple = (value: unknown): value is [number, number] => {
  return (
    Array.isArray(value) &&
    typeof value[0] === 'number' &&
    typeof value[1] === 'number'
  );
};
