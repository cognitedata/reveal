import { filters } from 'domain/wells/well/internal/filters';

import { isStringsArray } from 'utils/types/isStringsArray';

import { WellFilter } from '@cognite/sdk-wells';

export const getWellTypeFilter = (
  value?: unknown
): Pick<WellFilter, 'wellType'> => {
  if (isStringsArray(value)) {
    return {
      wellType: filters.toPropertyFilter(value),
    };
  }

  return {};
};
