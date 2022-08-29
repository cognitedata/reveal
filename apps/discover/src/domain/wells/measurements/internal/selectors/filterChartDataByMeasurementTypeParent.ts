import { MeasurementCurveData } from 'domain/wells/measurements/internal/types';

import { BooleanMap } from 'utils/booleanMap';

export const filterChartDataByMeasurementTypeParent = (
  chartData: MeasurementCurveData[],
  measurementTypeParentSelection: BooleanMap
) => {
  return chartData.filter(({ measurementTypeParent }) =>
    Boolean(measurementTypeParentSelection[measurementTypeParent])
  );
};
