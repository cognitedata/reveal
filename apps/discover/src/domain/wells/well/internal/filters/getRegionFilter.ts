import { filters } from 'dataLayers/wells/filters';
import { isStringsArray } from 'utils/types/isStringsArray';

import { WellFilter } from '@cognite/sdk-wells-v3';

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
