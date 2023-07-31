import get from 'lodash/get';

const unknownName = '[[Unknown Name]]';

export const getLabelFromIdentifier = (
  value: unknown | undefined,
  identifier = '',
  fallback = unknownName
): string => {
  return identifier ? get(value, identifier) || unknownName : fallback;
};
