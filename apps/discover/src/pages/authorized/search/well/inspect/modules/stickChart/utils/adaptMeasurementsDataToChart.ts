import { adaptToMeasurementChartData } from 'domain/wells/measurements/internal/transformers/adaptToMeasurementChartData';
import {
  DepthMeasurementWithData,
  MeasurementCurveData,
} from 'domain/wells/measurements/internal/types';
import { isMeasurementTypeFitOrLot } from 'domain/wells/measurements/internal/utils/isMeasurementTypeFitOrLot';

import { EMPTY_ARRAY } from 'constants/empty';

import { PRESSURE_UNIT } from '../WellboreStickChart/MeasurementsColumn/constants';

export const adaptMeasurementsDataToChart = (
  data?: DepthMeasurementWithData
): MeasurementCurveData[] => {
  if (!data) {
    return EMPTY_ARRAY;
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
