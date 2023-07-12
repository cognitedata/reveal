import { ValueByDataType, ValueByField } from '../../containers/Filter/types';

import { builders } from './builders';

export const buildFilterByDataType = (
  valueByDataType: ValueByDataType = {}
) => {
  const filters = Object.entries(valueByDataType).reduce(
    (result, [dataType, valueByField]) => {
      return {
        ...result,
        [dataType]: buildFilterByField(valueByField),
      };
    },
    {} as Record<string, unknown>
  );

  return filters;
};

export const buildFilterByField = (valueByField: ValueByField = {}) => {
  const filters = Object.entries(valueByField).reduce(
    (result, [field, { operator, value }]) => {
      const builder = builders[operator];
      const build = builder(field, value);

      return {
        ...result,
        ...build,
      };
    },
    {} as Record<string, unknown>
  );

  if (filters.length === 0) {
    return undefined;
  }

  return { and: filters };
};
