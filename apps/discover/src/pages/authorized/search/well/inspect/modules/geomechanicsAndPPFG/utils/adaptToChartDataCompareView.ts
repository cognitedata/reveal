import { adaptToMeasurementChartData } from 'domain/wells/measurements/internal/transformers/adaptToMeasurementChartData';

import { PressureUnit } from 'constants/units';

import { MeasurementsView } from '../types';

export const adaptToChartDataCompareView = (
  data: MeasurementsView,
  pressureUnit: PressureUnit
) => {
  return adaptToMeasurementChartData(data, pressureUnit, ({ curveData }) => {
    const { curveName } = curveData;
    const { wellboreName } = data;

    return {
      customdata: [curveName, wellboreName],
    };
  });
};
