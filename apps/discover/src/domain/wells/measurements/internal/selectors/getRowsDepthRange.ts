import isEmpty from 'lodash/isEmpty';
import { minMax } from 'utils/number';

import { DepthMeasurementRow } from '@cognite/sdk-wells';

export const getRowsDepthRange = (rows: DepthMeasurementRow[]) => {
  if (isEmpty(rows)) {
    return {
      min: undefined,
      max: undefined,
    };
  }

  const [min, max] = minMax(rows.map(({ depth }) => depth));

  return { min, max };
};
