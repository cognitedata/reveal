import { endsWithAny } from 'utils/filter/endsWithAny';

import { CurveSuffix, MeasurementCurveData } from '../types';

import { getNilCountDifferencePercentage } from './getNilCountDifferencePercentage';
import { extractIdPrefix } from './handleId';

export const getCurveFill = (
  curves: MeasurementCurveData[],
  currentCurveIndex: number
) => {
  if (currentCurveIndex === 0) {
    return undefined;
  }

  const currentCurve = curves[currentCurveIndex];
  const previousCurve = curves[currentCurveIndex - 1];

  const currentCurveId = currentCurve.columnExternalId;
  const previousCurveId = previousCurve.columnExternalId;

  if (extractIdPrefix(currentCurveId) !== extractIdPrefix(previousCurveId)) {
    return undefined;
  }

  if (endsWithAny(currentCurveId, [CurveSuffix.ML, CurveSuffix.HIGH])) {
    const nilCountDifferencePercentage = getNilCountDifferencePercentage(
      currentCurve,
      previousCurve
    );

    /**
     * If there are considerable amount of nil values between curves,
     * Plotly fill is not working as expected.
     * Hence we should avoid filling in such cases.
     *
     * Here, after the actual percentage is calculated,
     * it is rounded to three decimals.
     * If the rounded value is greater than `0`,
     * it means we should skip filling this curve.
     *
     * PLEASE BE CAREFUL IF YOU CHANGE THIS CONDITION.
     * THE ABOVE VALUE OF `0` IS CONSIDERED AFTER STUDYING A LOT OF CASES.
     */
    if (nilCountDifferencePercentage) {
      return undefined;
    }

    return 'tonextx';
  }

  return undefined;
};
