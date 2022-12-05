import { adaptToMeasurementChartData } from 'domain/wells/measurements/internal/transformers/adaptToMeasurementChartData';
import {
  DepthMeasurementWithData,
  MeasurementCurveData,
} from 'domain/wells/measurements/internal/types';

import { PressureUnit } from 'constants/units';

export const adaptMeasurementsDataToChart = (
  data: DepthMeasurementWithData,
  pressureUnit: PressureUnit
): MeasurementCurveData[] => {
  return adaptToMeasurementChartData(data, pressureUnit, ({ curveData }) => ({
    customdata: [curveData.curveName],
  }));
};
