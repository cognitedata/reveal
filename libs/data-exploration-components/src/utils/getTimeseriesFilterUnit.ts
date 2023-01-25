import isArray from 'lodash/isArray';
import isUndefined from 'lodash/isUndefined';

export const getTimeseriesFilterUnit = (
  unit?: string[] | string
): string[] | undefined => {
  return isArray(unit) || isUndefined(unit) ? unit : [unit];
};
