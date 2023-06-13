export const EMPTY_OBJECT = Object.freeze({});

/*
  EMPTY_ARRAY is type casted with 'as' because freeze returns readonly
  ideally, we should've readonly in front of all types that are intended to be readonly list
*/
export const EMPTY_ARRAY = Object.freeze([]) as [];

// This bad-boy needs some proper unit testing - will come back to it later
export function toFlatPropertyMap(object: object, keySeparator = '.') {
  const flattenRecursive = (
    object: object,
    parentProperty?: string,
    accumulator: Record<string, unknown> = {}
  ): Record<string, unknown> => {
    for (const [key, value] of Object.entries(object)) {
      const property = parentProperty
        ? `${parentProperty}${keySeparator}${key}`
        : key;

      if ((value && typeof value === 'object') || Array.isArray(value)) {
        flattenRecursive(value, property, accumulator);
      } else {
        accumulator[property] = value;
      }
    }
    return accumulator;
  };

  return flattenRecursive(object);
}
