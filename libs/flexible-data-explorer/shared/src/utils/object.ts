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
