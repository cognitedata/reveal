import { MeasurementCurveData } from 'domain/wells/measurements/internal/types';

import { BooleanMap } from 'utils/booleanMap';

export const filterChartDataBySelection = (
  chartData: MeasurementCurveData[],
  curveSelection: BooleanMap
) => {
  return chartData.filter(({ columnExternalId }) =>
    Boolean(curveSelection[columnExternalId])
  );
};
