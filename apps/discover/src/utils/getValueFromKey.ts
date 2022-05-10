import get from 'lodash/get';
import isNumber from 'lodash/isNumber';

export const getValueFromKey = <T>(object: T, path: string) => {
  const value = get(object, path, '');
  if (isNumber(value)) return Number(value);
  return String(value);
};
