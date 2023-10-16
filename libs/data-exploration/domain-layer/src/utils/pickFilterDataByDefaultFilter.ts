import get from 'lodash/get';
import isArray from 'lodash/isArray';
import isEmpty from 'lodash/isEmpty';
import isUndefined from 'lodash/isUndefined';
import last from 'lodash/last';

type ValueType = string | number;

type FilterDataType = {
  value: ValueType;
  count?: number;
};

export const pickFilterDataByDefaultFilter = <T extends FilterDataType>(
  data: T[],
  defaultFilter: unknown,
  property: string | string[]
): T[] => {
  // If the property is specified as array, for an example ['sourceFile', 'source']
  const defaultFilterKey = isArray(property) ? last(property) : property;

  if (!defaultFilterKey) {
    return data;
  }

  const value = get(defaultFilter, defaultFilterKey);

  if (isUndefined(value) || isEmpty(value)) {
    return data;
  }

  const values: ValueType[] = isArray(value) ? value : [value];

  return data.filter((item) => {
    return values.includes(item.value);
  });
};
