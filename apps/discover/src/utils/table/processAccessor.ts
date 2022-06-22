import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';
import isNumber from 'lodash/isNumber';

export const processAccessor = <T>(row: T, accessor: DeepKeyOf<T>) => {
  const value = get(row, accessor);

  if (isNumber(value) || !isEmpty(value)) return value;
  return null;
};
