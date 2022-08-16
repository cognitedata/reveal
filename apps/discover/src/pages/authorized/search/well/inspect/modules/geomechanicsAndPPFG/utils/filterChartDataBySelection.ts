import { BooleanMap } from 'utils/booleanMap';

import { MeasurementCurveData } from '../types';

export const filterChartDataBySelection = (
  chartData: MeasurementCurveData[],
  curveSelection: BooleanMap
) => {
  return chartData.filter(({ columnExternalId }) =>
    Boolean(curveSelection[columnExternalId])
  );
};
