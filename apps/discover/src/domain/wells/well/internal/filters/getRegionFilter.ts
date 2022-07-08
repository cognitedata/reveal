import { filters } from 'domain/wells/well/internal/filters';

import { isStringsArray } from 'utils/types/isStringsArray';

import { WellFilter } from '@cognite/sdk-wells';

export const getRegionFilter = (
  value?: unknown
): Pick<WellFilter, 'region'> => {
  if (isStringsArray(value)) {
    return {
      region: filters.toPropertyFilter(value),
    };
  }

  return {};
};
