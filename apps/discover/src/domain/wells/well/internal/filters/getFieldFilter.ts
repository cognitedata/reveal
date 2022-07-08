import { filters } from 'domain/wells/well/internal/filters';

import { isStringsArray } from 'utils/types/isStringsArray';

import { WellFilter } from '@cognite/sdk-wells';

export const getFieldFilter = (value?: unknown): Pick<WellFilter, 'field'> => {
  if (isStringsArray(value)) {
    return {
      field: filters.toPropertyFilter(value),
    };
  }

  return {};
};
