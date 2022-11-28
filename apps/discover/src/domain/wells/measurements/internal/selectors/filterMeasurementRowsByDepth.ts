import { filterByMinMax } from 'utils/filter/filterByMinMax';

import { DepthMeasurementRow } from '@cognite/sdk-wells';

export const filterMeasurementRowsByDepth = (
  rows: DepthMeasurementRow[],
  {
    min,
    max,
  }: {
    min?: number;
    max?: number;
  }
) => {
  return rows.filter(({ depth }) => {
    return filterByMinMax(depth, min, max);
  });
};
