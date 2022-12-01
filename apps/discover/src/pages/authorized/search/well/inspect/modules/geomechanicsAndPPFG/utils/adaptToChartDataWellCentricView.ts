import { adaptToMeasurementChartData } from 'domain/wells/measurements/internal/transformers/adaptToMeasurementChartData';
import { MeasurementCurveData } from 'domain/wells/measurements/internal/types';
import { getDifferenceCurves } from 'domain/wells/measurements/internal/utils/getDifferenceCurves';

import { PressureUnit } from 'constants/units';

import { MeasurementsView } from '../types';

export const adaptToChartDataWellCentricView = (
  data: MeasurementsView[],
  pressureUnit: PressureUnit
): MeasurementCurveData[] => {
  const curves = data.flatMap((measurementsData) => {
    return adaptToMeasurementChartData(
      measurementsData,
      pressureUnit,
      ({ curveData }) => ({
        customdata: [curveData.curveName],
      })
    );
  });

  return [...curves, ...getDifferenceCurves(curves)];
};
