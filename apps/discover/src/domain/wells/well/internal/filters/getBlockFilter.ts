import { filters } from 'dataLayers/wells/filters';
import { isStringsArray } from 'utils/types/isStringsArray';

import { WellFilter } from '@cognite/sdk-wells-v3';

export const getBlockFilter = (value?: unknown): Pick<WellFilter, 'block'> => {
  if (isStringsArray(value)) {
    return {
      block: filters.toPropertyFilter(value),
    };
  }

  return {};
};
