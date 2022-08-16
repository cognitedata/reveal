import groupBy from 'lodash/groupBy';

import { MeasurementsView, MeasurementUnits } from '../types';

import { adaptToChartDataCurveCentricView } from './adaptToChartDataCurveCentricView';

export const getCurveCentricViewCharts = (
  data: MeasurementsView[],
  measurementUnits: MeasurementUnits
) => {
  const chartsData = data.flatMap((wellboreMeasurementData) =>
    adaptToChartDataCurveCentricView(wellboreMeasurementData, measurementUnits)
  );

  return groupBy(chartsData, 'columnExternalId');
};
