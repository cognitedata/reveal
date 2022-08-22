import groupBy from 'lodash/groupBy';

import { PressureUnit } from 'constants/units';

import { MeasurementsView } from '../types';

import { adaptToChartDataCurveCentricView } from './adaptToChartDataCurveCentricView';

export const getCurveCentricViewCharts = (
  data: MeasurementsView[],
  pressureUnit: PressureUnit
) => {
  const chartsData = data.flatMap((wellboreMeasurementData) =>
    adaptToChartDataCurveCentricView(wellboreMeasurementData, pressureUnit)
  );

  return groupBy(chartsData, 'columnExternalId');
};
