import { filters } from 'domain/wells/well/internal/filters';

import { isStringsArray } from 'utils/types/isStringsArray';

import { WellFilter } from '@cognite/sdk-wells-v3';

export const getOperatorFilter = (
  value?: unknown
): Pick<WellFilter, 'operator'> => {
  if (isStringsArray(value)) {
    return {
      operator: filters.toPropertyFilter(value),
    };
  }

  return {};
};
