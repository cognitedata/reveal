import has from 'lodash/has';

export const hasObjectAnyProperty = <T>(
  object: T,
  properties: string[]
): boolean => {
  return !!properties.find((property) => has(object, property));
};
