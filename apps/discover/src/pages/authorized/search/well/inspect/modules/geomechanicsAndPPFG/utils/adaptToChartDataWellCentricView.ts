import { adaptToMeasurementChartData } from 'domain/wells/measurements/internal/transformers/adaptToMeasurementChartData';

import { PressureUnit } from 'constants/units';

import { MeasurementsView } from '../types';

export const adaptToChartDataWellCentricView = (
  data: MeasurementsView,
  pressureUnit: PressureUnit
) => {
  return adaptToMeasurementChartData(data, pressureUnit, ({ curveData }) => ({
    customdata: [curveData.curveName],
  }));
};
