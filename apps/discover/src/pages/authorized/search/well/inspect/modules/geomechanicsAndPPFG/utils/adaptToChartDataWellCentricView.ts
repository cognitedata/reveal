import { adaptToMeasurementChartData } from 'domain/wells/measurements/internal/transformers/adaptToMeasurementChartData';
import { MeasurementCurveData } from 'domain/wells/measurements/internal/types';

import { PressureUnit } from 'constants/units';

import { MeasurementsView } from '../types';

export const adaptToChartDataWellCentricView = (
  data: MeasurementsView[],
  pressureUnit: PressureUnit
): MeasurementCurveData[] => {
  return data.flatMap((measurementsData) => {
    return adaptToMeasurementChartData(
      measurementsData,
      pressureUnit,
      ({ curveData }) => ({
        customdata: [curveData.curveName],
      })
    );
  });
};
