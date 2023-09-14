import { isEmpty } from 'lodash';

import { SiteConfig } from '../../../config/types';
import { ValueByDataType, ValueByField } from '../../containers/Filter/types';

import { builders } from './builders';

export const buildFilterByDataType = (
  valueByDataType: ValueByDataType = {},
  config?: SiteConfig
) => {
  // TODO: Change this to use all data types (to add support for site selection on this level.)
  const filters = Object.entries(valueByDataType).reduce(
    (result, [dataType, valueByField]) => {
      return {
        ...result,
        [dataType]: buildFilterByField(valueByField, config),
      };
    },
    {} as Record<string, unknown>
  );

  return filters;
};

export const buildFilterByField = (
  valueByField: ValueByField = {},
  config?: SiteConfig
) => {
  const filters = Object.entries(valueByField).map(
    ([field, { operator, value }]) => {
      const builder = builders[operator];
      const build = builder(field, value);

      return build;
    }
  );

  if (config?.instanceSpaces) {
    filters.push({
      space: {
        in: config.instanceSpaces,
      },
    });
  }

  if (isEmpty(filters)) {
    return undefined;
  }

  if (filters.length === 1) {
    return filters[0];
  }

  return { and: filters };
};
