import { MeasurementCurveData } from 'domain/wells/measurements/internal/types';

import isUndefined from 'lodash/isUndefined';

export const sortCurvesByCustomDataLength = (
  curves: MeasurementCurveData[]
) => {
  return curves.sort((curve1, curve2) => {
    const length1 = curve1.customdata?.length;
    const length2 = curve2.customdata?.length;

    if (isUndefined(length1) || isUndefined(length2)) {
      return 0;
    }

    return length1 - length2;
  });
};
