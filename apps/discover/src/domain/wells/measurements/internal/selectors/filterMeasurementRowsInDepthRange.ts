import isUndefined from 'lodash/isUndefined';

import { DepthMeasurementRow } from '@cognite/sdk-wells';

export const filterMeasurementRowsInDepthRange = (
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
    if (!isUndefined(min) && !isUndefined(max)) {
      return min <= depth && depth <= max;
    }
    if (!isUndefined(min)) {
      return min <= depth;
    }
    if (!isUndefined(max)) {
      return depth <= max;
    }
    return false;
  });
};
