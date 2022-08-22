import { adaptToMeasurementChartData } from 'domain/wells/measurements/internal/transformers/adaptToMeasurementChartData';
import {
  DepthMeasurementWithData,
  MeasurementCurveData,
} from 'domain/wells/measurements/internal/types';
import { isMeasurementTypeFitOrLot } from 'domain/wells/measurements/internal/utils/isMeasurementTypeFitOrLot';

import { PRESSURE_UNIT } from '../WellboreCasingView/MeasurementsColumn/constants';

export const adaptMeasurementsDataToChart = (
  data?: DepthMeasurementWithData
): MeasurementCurveData[] => {
  if (!data) {
    return [];
  }

  const curves = adaptToMeasurementChartData(
    data,
    PRESSURE_UNIT,
    ({ curveData }) => ({
      customdata: [curveData.curveName],
    })
  );

  /**
   * This filtering step should be removed.
   * There is something wrong with the WDL.
   * So, this is a tempory fix.
   */
  return curves.filter(({ measurementTypeParent }) =>
    isMeasurementTypeFitOrLot(measurementTypeParent)
  );
};
