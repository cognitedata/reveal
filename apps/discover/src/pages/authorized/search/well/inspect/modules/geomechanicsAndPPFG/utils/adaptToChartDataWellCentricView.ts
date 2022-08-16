import { MeasurementsView, MeasurementUnits } from '../types';

import { adaptToMeasurementChartData } from './adaptToMeasurementChartData';

export const adaptToChartDataWellCentricView = (
  data: MeasurementsView,
  measurementUnits: MeasurementUnits
) => {
  return adaptToMeasurementChartData(
    data,
    measurementUnits,
    ({ curveData }) => ({
      customdata: [curveData.curveName],
    })
  );
};
