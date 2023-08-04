import { isEmpty } from 'lodash';

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
  const filters = Object.entries(valueByField).map(
    ([field, { operator, value }]) => {
      const builder = builders[operator];
      const build = builder(field, value);

      return build;
    }
  );

  if (isEmpty(filters)) {
    return undefined;
  }

  if (filters.length === 1) {
    return filters[0];
  }

  return { and: filters };
};
