import isUndefined from 'lodash/isUndefined';

export const filterByMinMax = (value: number, min?: number, max?: number) => {
  if (!isUndefined(min) && !isUndefined(max)) {
    return min <= value && value <= max;
  }
  if (!isUndefined(min)) {
    return min <= value;
  }
  if (!isUndefined(max)) {
    return value <= max;
  }
  return false;
};
