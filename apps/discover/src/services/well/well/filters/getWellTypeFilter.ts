import { filters } from 'dataLayers/wells/filters';
import { isStringsArray } from 'utils/types/isStringsArray';

import { WellFilter } from '@cognite/sdk-wells-v3';

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
