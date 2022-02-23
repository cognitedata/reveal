import { filters } from 'dataLayers/wells/filters';
import { isNumberTuple } from 'utils/types/isNumberTuple';

import { WellFilter } from '@cognite/sdk-wells-v3';

export const getMaxInclinationAngleFilter = (
  value?: unknown
): Pick<WellFilter, 'trajectories'> => {
  if (isNumberTuple(value)) {
    return {
      trajectories: {
        maxInclination: filters.toAngleRange(value),
      },
    };
  }

  return {};
};
