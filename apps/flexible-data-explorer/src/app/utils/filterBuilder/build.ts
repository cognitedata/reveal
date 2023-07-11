import isArray from 'lodash/isArray';
import mergeWith from 'lodash/mergeWith';

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

  if (filters.length === 0) {
    return undefined;
  }

  return { and: filters };
};

export const mergeBuildWithResult = (
  result: Record<string, unknown>,
  build: Record<string, unknown>
) => {
  return mergeWith(result, build, (obj, src) => {
    if (isArray(obj)) {
      obj.concat(src);
    }
  });
};
