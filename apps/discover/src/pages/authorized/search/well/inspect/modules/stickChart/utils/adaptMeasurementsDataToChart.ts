import { adaptToMeasurementChartData } from 'domain/wells/measurements/internal/transformers/adaptToMeasurementChartData';
import {
  DepthMeasurementWithData,
  MeasurementCurveData,
} from 'domain/wells/measurements/internal/types';

import { EMPTY_ARRAY } from 'constants/empty';

import { PRESSURE_UNIT } from '../WellboreStickChart/MeasurementsColumn/constants';

export const adaptMeasurementsDataToChart = (
  data?: DepthMeasurementWithData
): MeasurementCurveData[] => {
  if (!data) {
    return EMPTY_ARRAY;
  }

  return adaptToMeasurementChartData(data, PRESSURE_UNIT, ({ curveData }) => ({
    customdata: [curveData.curveName],
  }));
};
