import flatten from 'lodash/flatten';
import isEmpty from 'lodash/isEmpty';

export const areAllSetValuesEmpty = (
  data: Record<string, unknown[]>
): boolean => {
  return isEmpty(flatten(Object.values(data)));
};
