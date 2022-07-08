import { filters } from 'domain/wells/well/internal/filters';

import { isStringsArray } from 'utils/types/isStringsArray';

import { WellFilter } from '@cognite/sdk-wells';

export const getBlockFilter = (value?: unknown): Pick<WellFilter, 'block'> => {
  if (isStringsArray(value)) {
    return {
      block: filters.toPropertyFilter(value),
    };
  }

  return {};
};
