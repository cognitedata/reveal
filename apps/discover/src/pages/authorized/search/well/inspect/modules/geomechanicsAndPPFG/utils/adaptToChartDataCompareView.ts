import { MeasurementsView, MeasurementUnits } from '../types';

import { adaptToMeasurementChartData } from './adaptToMeasurementChartData';

export const adaptToChartDataCompareView = (
  data: MeasurementsView,
  measurementUnits: MeasurementUnits
) => {
  return adaptToMeasurementChartData(
    data,
    measurementUnits,
    ({ curveData }) => {
      const { curveName, wellboreName } = curveData;

      return {
        customdata: [curveName, wellboreName],
      };
    }
  );
};
